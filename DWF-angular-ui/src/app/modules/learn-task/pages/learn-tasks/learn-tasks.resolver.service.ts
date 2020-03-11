import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { DataResolved } from '@app/data/models/data-resolved';
import { Experiment } from '@app/data/models/experiment';
import { ObservableDataResolved } from '@app/data/models/observable-data-resolved';
import { ElasticsearchService } from '@app/data/services/elasticsearch/elasticsearch.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class LearnTasksResolver implements Resolve<ObservableDataResolved<Experiment['tasks'][]>> {
  constructor(private es: ElasticsearchService) {}

  getLearnTasks$(experiments: string[]): Observable<DataResolved<Experiment['tasks'][]>> {
    return this.es.getOnlyTasks(experiments).pipe(
      map(response => {
        const data = response.hits.hits.map(hit => hit._source.tasks);
        const missingIndexes = this.es.checkMissingExperimentIndexes(experiments, response);
        const error = [missingIndexes.message, !data.length && `No learn tasks found`].filter(Boolean).join('\n');
        return { data, ...(error && { error }) };
      })
    );
  }

  resolve(
    route: ActivatedRouteSnapshot,
    _: RouterStateSnapshot
  ): Observable<ObservableDataResolved<Experiment['tasks'][]>> {
    const experimentIds = route.paramMap.get('experimentIds')!.split(',');

    return this.getLearnTasks$(experimentIds).pipe(
      map(learnTasks => ({ resolved: learnTasks, observable: this.getLearnTasks$(experimentIds) }))
    );
  }
}
