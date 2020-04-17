import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Experiment, OnlyTasks, PartailExperiment } from '@app/data/models/experiment';
import { SearchResponse } from 'elasticsearch';
import { Observable } from 'rxjs';

/** Service to get data from elasticsearch */
@Injectable({ providedIn: 'root' })
export class ElasticsearchService {
  /**
   * Constructs a new `ElasticsearchService`.
   * @param http A HttpClient service.
   */
  constructor(private http: HttpClient) {}

  /**
   * Executes a search query.
   * @param index Comma-separated list or wildcard expression of index names used to limit the request.
   * @param body Search request body.
   * @param params Search query parameters.
   * @returns The `Observable` search response.
   */
  search<T>(
    index: string,
    body: any = {},
    params: { [param: string]: string | string[] } = {}
  ): Observable<SearchResponse<T>> {
    return this.http.post<SearchResponse<T>>(`/api/${index}/_search`, body, { params: { size: '10000', ...params } });
  }

  /**
   * Executes a search query for all experiments_* indexes, only returning the name, markdown,
   * created_ts fields order by name and their tasks count as a script field called numberOfTasks for every hit.
   * @returns The `Observable` search response of experiments_* indexes with only their name, markdown and created_ts fields and numberOfTasks script field.
   */
  getAllExperimentItems(): Observable<SearchResponse<Pick<Experiment, 'name' | 'markdown' | 'created_ts'>>> {
    return this.search<Pick<Experiment, 'name' | 'markdown' | 'created_ts'>>('experiments_*', {
      _source: ['name', 'markdown', 'created_ts'],
      script_fields: { numberOfTasks: { script: 'params._source.tasks.size()' } },
      sort: { 'name.keyword': 'asc' },
    });
  }

  /**
   * Executes a search query for certain experiments_{hash} indexes.
   * @param hashes An array of the hash parts of the experiments_{hash} indexes.
   * @param body Additional search request body.
   * @returns The `Observable` search response of experiment indexes.
   */
  getExperiments<T extends PartailExperiment = Experiment>(
    hashes: string[],
    body: any = {}
  ): Observable<SearchResponse<T>> {
    return this.search<T>(hashes.map(hash => `experiments_${hash}`).join(','), body, {
      ignore_unavailable: 'true',
    });
  }

  /**
   * Executes a search query for certain experiments_{hash} indexes and returns only their tasks field.
   * @param hashes An array of the hash parts of the experiments_{hash} indexes.
   * @returns The `Observable` search response of experiment indexes with only their tasks filed for every hit.
   */
  getOnlyTasks(hashes: string[]): Observable<SearchResponse<OnlyTasks>> {
    return this.getExperiments<OnlyTasks>(hashes, { _source: 'tasks' });
  }

  /**
   * Checks if any experiments_{hash} index from a hashes array is missing from the search response if yes then creates and error message with the missing index(es).
   * @param hashes An array of the hash parts of the experiments_{hash} indexes.
   * @param response The search response.
   * @returns Whether there is a missing index, and if yes an error message with the missing index(es).
   */
  checkMissingExperimentIndexes(
    hashes: string[],
    response: SearchResponse<PartailExperiment>
  ): { missing: boolean; message?: string } {
    const hits = response.hits.hits;
    const missingIndexes =
      hashes.length === hits.length ? [] : hashes.filter(index => !hits.some(hit => hit._index.endsWith(index)));
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
