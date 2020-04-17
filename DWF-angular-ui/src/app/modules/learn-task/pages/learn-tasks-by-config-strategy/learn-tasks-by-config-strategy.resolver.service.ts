import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { DataResolved } from '@app/data/models/data-resolved';
import { HashWithTask } from '@app/data/models/experiment';
import { ObservableDataResolved } from '@app/data/models/observable-data-resolved';
import { ElasticsearchService } from '@app/data/services/elasticsearch/elasticsearch.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { LearnTaskConfig } from './learn-task-config';

@Injectable({
  providedIn: 'root',
})
export class LearnTasksByConfigStrategyResolver implements Resolve<ObservableDataResolved<HashWithTask[]>> {
  constructor(private es: ElasticsearchService) {}

  getLearnTasks(
    experiments: string[],
    config: LearnTaskConfig,
    strategyId: string
  ): Observable<DataResolved<HashWithTask[]>> {
    return this.es.getOnlyTasks(experiments).pipe(
      map(response => {
        const data = response.hits.hits.flatMap(hit =>
          Object.entries(hit._source.tasks).filter(([_hash, task]) => task[config].strategy_id === strategyId)
        );
        const missingIndexes = this.es.checkMissingExperimentIndexes(experiments, response);
        const error = [missingIndexes.message, !data.length && `No such algorithm id: ${strategyId}`]
          .filter(Boolean)
          .join('\n');
        return { data, ...(error && { error }) };
      })
    );
  }

  resolve(route: ActivatedRouteSnapshot, _: RouterStateSnapshot): Observable<ObservableDataResolved<HashWithTask[]>> {
    const experimentIds = route.paramMap.get('experimentIds')!.split(',');
    const config: LearnTaskConfig = route.data.config;
    const strategyId = route.paramMap.get('strategyId')!;
    return this.getLearnTasks(experimentIds, config, strategyId).pipe(
      map(learnTasks => ({ resolved: learnTasks, observable: this.getLearnTasks(experimentIds, config, strategyId) }))
    );
  }
}
