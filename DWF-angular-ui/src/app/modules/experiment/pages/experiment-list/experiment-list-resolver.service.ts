import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { ResolvedData } from '@app/data/models/resolved-data';
import { ResolvedAndObservable } from '@app/data/models/resolved-and-observable';
import { ElasticsearchService } from '@app/data/services/elasticsearch.service';
import { Observable, of } from 'rxjs';
import { map, pluck, catchError } from 'rxjs/operators';
import { ExperimentListItem } from './experiment-list-item';

@Injectable({ providedIn: 'root' })
export class ExperimentListResolver implements Resolve<ResolvedAndObservable<ExperimentListItem[]>> {
  constructor(private es: ElasticsearchService) {}

  getResolvedExperimentListItems(): Observable<ResolvedData<ExperimentListItem[]>> {
    return this.es.getAllExperimentItems().pipe(
      pluck('hits', 'hits'),
      map(hits => ({
        data: hits.map(hit => ({
          indexHash: hit._index.replace(/^experiments_/, ''),
          name: hit._source.name,
          numberOfTasks: hit.fields.numberOfTasks[0],
          created: new Date(Number(hit._source.created_ts)),
          markdown: hit._source.markdown,
        })),
      })),
      catchError((error: Error) => of({ data: [] as ExperimentListItem[], error: error.message }))
    );
  }

  resolve(): Observable<ResolvedAndObservable<ExperimentListItem[]>> {
    return this.getResolvedExperimentListItems().pipe(
      map(experimtentListItems => ({
        resolved: experimtentListItems,
        observable: this.getResolvedExperimentListItems(),
      }))
    );
  }
}
