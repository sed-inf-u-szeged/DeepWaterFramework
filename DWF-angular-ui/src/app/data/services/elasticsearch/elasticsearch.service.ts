import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Experiment, OnlyAssembleConfig, OnlyTasks, PartailExperiment } from '@app/data/models/experiment';
import { SearchResponse } from 'elasticsearch';
import { Observable } from 'rxjs';

/** Service to get data from elasticsearch */
@Injectable({ providedIn: 'root' })
export class ElasticsearchService {
  constructor(private http: HttpClient) {}

  /**
   * Execute a search query
   * @param index Comma-separated list or wildcard expression of index names used to limit the request
   * @param body Search request body
   * @param params Search query parameters
   * @returns The observable search response
   */
  search<T>(
    index: string,
    body: any = {},
    params: { [param: string]: string | string[] } = {}
  ): Observable<SearchResponse<T>> {
    return this.http.post<SearchResponse<T>>(`/api/${index}/_search`, body, { params: { size: '10000', ...params } });
  }

  getAllExperimentItems(): Observable<SearchResponse<Omit<Experiment, 'tasks'>>> {
    return this.search<Omit<Experiment, 'tasks'>>('experiments_*', {
      _source: ['name', 'markdown', 'created_ts'],
      script_fields: { numberOfTasks: { script: 'params._source.tasks.size()' } },
      sort: { 'name.keyword': 'asc' },
    });
  }

  getExperiments<T extends PartailExperiment = Experiment>(
    hashes: string[],
    body: any = {}
  ): Observable<SearchResponse<T>> {
    return this.search<T>(hashes.map(hash => `experiments_${hash}`).join(','), body, {
      ignore_unavailable: 'true',
    });
  }

  getOnlyAssembleConfigs(hashes: string[]): Observable<SearchResponse<OnlyAssembleConfig>> {
    return this.getExperiments<OnlyAssembleConfig>(hashes, { _source: 'tasks.*.assemble_config' });
  }

  getOnlyTasks(hashes: string[]): Observable<SearchResponse<OnlyTasks>> {
    return this.getExperiments<OnlyTasks>(hashes, { _source: 'tasks' });
  }

  checkMissingExperimentIndexes(
    indexes: string[],
    { hits: { hits } }: SearchResponse<PartailExperiment>
  ): { missing: boolean; message?: string } {
    const missingIndexes =
      indexes.length === hits.length ? [] : indexes.filter(index => !hits.some(hit => hit._index.endsWith(index)));
    return missingIndexes.length === 0
      ? { missing: false }
      : {
          missing: true,
          message:
            missingIndexes.length === 1
              ? `No such experiment index: ${missingIndexes[0]}`
              : `No such experiment indexes: [${missingIndexes.join(', ')}]`,
        };
  }
}
