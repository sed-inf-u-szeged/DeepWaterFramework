import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { ObservableDataResolved } from '@app/data/models/observable-data-resolved';
import { DataResolved } from '@app/data/models/data-resolved';
import { OnlyAssembleConfig } from '@app/data/models/experiment';
import { ElasticsearchService } from '@app/data/services/elasticsearch/elasticsearch.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { pickBy } from 'lodash-es';

@Injectable({
  providedIn: 'root',
})
export class AssembleConfigsByPresetResolver implements Resolve<ObservableDataResolved<OnlyAssembleConfig[]>> {
  constructor(private es: ElasticsearchService) {}

  getAssembleConfigs$(experiments: string[], strategyId: string): Observable<DataResolved<OnlyAssembleConfig[]>> {
    return this.es.getOnlyAssembleConfigs(experiments).pipe(
      map(response => {
        const data = response.hits.hits.map(hit => ({
          tasks: pickBy(hit._source.tasks, task => task.assemble_config.strategy_id === strategyId),
        }));
        const missingIndexes = this.es.checkMissingExperimentIndexes(experiments, response);
        const error = [missingIndexes.message, !data.length && `No such strategy id: ${strategyId}`]
          .filter(Boolean)
          .join('\n');
        return { data, ...(error && { error }) };
      })
    );
  }

  resolve(
    route: ActivatedRouteSnapshot,
    _: RouterStateSnapshot
  ): Observable<ObservableDataResolved<OnlyAssembleConfig[]>> {
    const experiments = route.paramMap.get('experimentIds')!.split(',');
    const strategyId = route.paramMap.get('presetId')!;

    return this.getAssembleConfigs$(experiments, strategyId).pipe(
      map(configs => ({
        resolved: configs,
        observable: this.getAssembleConfigs$(experiments, strategyId),
      }))
    );
  }
}
