import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { DataResolved } from '@app/data/models/data-resolved';
import { ObservableDataResolved } from '@app/data/models/observable-data-resolved';
import { ElasticsearchService } from '@app/data/services/elasticsearch/elasticsearch.service';
import { Observable, of } from 'rxjs';
import { map, pluck, catchError } from 'rxjs/operators';
import { ExperimentListItem } from './experiment-list-item';

@Injectable({
  providedIn: 'root',
})
export class ExperimentListResolver implements Resolve<ObservableDataResolved<ExperimentListItem[]>> {
  constructor(private es: ElasticsearchService) {}

  getResolvedExperimentListItems$(): Observable<DataResolved<ExperimentListItem[]>> {
    return this.es.getAllExperimentItems().pipe(
      pluck('hits', 'hits'),
      map(hits => ({
        data: hits.map(hit => ({
          indexHash: hit._index.replace(/^experiments_/, ''),
          name: hit._source.name,
          numberOfTasks: hit.fields.numberOfTasks[0],
          created_ts: hit._source.created_ts,
          markdown: hit._source.markdown,
        })),
      })),
      catchError((error: Error) => of({ data: [] as ExperimentListItem[], error: error.message }))
    );
  }

  resolve(): Observable<ObservableDataResolved<ExperimentListItem[]>> {
    return this.getResolvedExperimentListItems$().pipe(
      map(experimtentListItems => ({
        resolved: experimtentListItems,
        observable: this.getResolvedExperimentListItems$(),
      }))
    );
  }
}
