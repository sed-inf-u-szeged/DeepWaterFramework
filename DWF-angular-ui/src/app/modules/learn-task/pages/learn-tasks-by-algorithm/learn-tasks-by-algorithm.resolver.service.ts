import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { DataResolved } from '@app/data/models/data-resolved';
import { HashWithTask } from '@app/data/models/experiment';
import { ObservableDataResolved } from '@app/data/models/observable-data-resolved';
import { ElasticsearchService } from '@app/data/services/elasticsearch/elasticsearch.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class LearnTasksByAlgorithmResolver implements Resolve<ObservableDataResolved<HashWithTask[]>> {
  constructor(private es: ElasticsearchService) {}

  getLearnTasks$(experiments: string[], algorithmId: string): Observable<DataResolved<HashWithTask[]>> {
    return this.es.getOnlyTasks(experiments).pipe(
      map(response => {
        const data = response.hits.hits.flatMap(hit =>
          Object.entries(hit._source.tasks).filter(([_hash, task]) => task.learn_config.strategy_id === algorithmId)
        );
        const missingIndexes = this.es.checkMissingExperimentIndexes(experiments, response);
        const error = [missingIndexes.message, !data.length && `No such algorithm id: ${algorithmId}`]
          .filter(Boolean)
          .join('\n');
        return { data, ...(error && { error }) };
      })
    );
  }

  resolve(route: ActivatedRouteSnapshot, _: RouterStateSnapshot): Observable<ObservableDataResolved<HashWithTask[]>> {
    const algorithmId = route.paramMap.get('algorithmId')!;
    const experimentIds = route.paramMap.get('experimentIds')!.split(',');
    return this.getLearnTasks$(experimentIds, algorithmId).pipe(
      map(learnTasks => ({ resolved: learnTasks, observable: this.getLearnTasks$(experimentIds, algorithmId) }))
    );
  }
}
