import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { ResolvedData } from '@app/data/models/resolved-data';
import { Experiment, HashWithTask } from '@app/data/models/experiment';
import { ResolvedAndObservable } from '@app/data/models/resolved-and-observable';
import { ElasticsearchService } from '@app/data/services/elasticsearch.service';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class LearnTasksCompareResolver implements Resolve<ResolvedAndObservable<HashWithTask[]>> {
  constructor(private es: ElasticsearchService) {}

  getTaskSummary(tasks: Experiment['tasks'][], ids: string[]): { tasks: HashWithTask[]; missingTaskHashes: string[] } {
    return ids.reduce(
      (acc, id) => {
        const tasksWithId = tasks.find(task => task[id]);
        if (tasksWithId) {
          acc.tasks.push([id, tasksWithId[id]]);
        } else {
          acc.missingTaskHashes.push(id);
        }
        return acc;
      },
      { tasks: [], missingTaskHashes: [] } as { tasks: HashWithTask[]; missingTaskHashes: string[] }
    );
  }

  getErrorMessage(missingTaskHashes: string[], resolvedError?: string): string | undefined {
    if (missingTaskHashes.length === 0) {
      return resolvedError || undefined;
    }
    const missingHashError =
      missingTaskHashes.length === 1
        ? `No such task hash: ${missingTaskHashes[0]}`
        : `No such task hashes: [${missingTaskHashes.join(', ')}]`;
    return resolvedError ? `${resolvedError}\n${missingHashError}` : missingHashError;
  }

  getLearnTasks$(experiments: string[], learnTaskIds: string[]): Observable<ResolvedData<HashWithTask[]>> {
    return this.es.getOnlyTasks(experiments).pipe(
      map(response => {
        const tasks = response.hits.hits.map(hit => hit._source.tasks);
        const summary = this.getTaskSummary(tasks, learnTaskIds);
        const data = summary.tasks;
        const missingIndexes = this.es.checkMissingExperimentIndexes(experiments, response);
        const error = this.getErrorMessage(summary.missingTaskHashes, missingIndexes.message);
        return { data, ...(error && { error }) };
      }),
      catchError((error: Error) => of({ data: [] as HashWithTask[], error: error.message }))
    );
  }

  resolve(route: ActivatedRouteSnapshot, _: RouterStateSnapshot): Observable<ResolvedAndObservable<HashWithTask[]>> {
    const learnTaskIds = route.paramMap.get('learnTaskIds')!.split(',');
    const experimentIds = route.paramMap.get('experimentIds')!.split(',');
    return this.getLearnTasks$(experimentIds, learnTaskIds).pipe(
      map(learnTasks => ({ resolved: learnTasks, observable: this.getLearnTasks$(experimentIds, learnTaskIds) }))
    );
  }
}
