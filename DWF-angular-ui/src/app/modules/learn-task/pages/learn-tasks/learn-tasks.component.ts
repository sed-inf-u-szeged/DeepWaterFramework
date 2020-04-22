import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ResolvedData } from '@app/data/models/resolved-data';
import { HashWithTask } from '@app/data/models/experiment';
import { ResolvedAndObservable } from '@app/data/models/resolved-and-observable';

/** Page component for learn tasks. */
@Component({
  selector: 'app-learn-tasks',
  templateUrl: './learn-tasks.component.html',
  styleUrls: ['./learn-tasks.component.scss'],
})
export class LearnTasksComponent {
  /** An array of [hash, task] tuples to pass to child components. */
  hashWithTasks: HashWithTask[];
  /** Error message to display. */
  errorMessage?: string;
  /** The resolved array of [hash, task] tuples and it's observable query to reuse. */
  resolvedAndObservable: ResolvedAndObservable<HashWithTask[]>;

  /**
   * Constructs a new `LearnTasksComponent` and gets the resolved data from the route snapshot.
   * @param route The `ActivatedRoute` to get the resolved data from.
   */
  constructor(route: ActivatedRoute) {
    this.resolvedAndObservable = route.snapshot.data.learnTasks;
    this.handleNewData(this.resolvedAndObservable.resolved);
  }

  /**
   * Handles the new data on init and from polling.
   * @param data The new resolved data.
   */
  handleNewData(data: ResolvedData<HashWithTask[]>) {
    this.hashWithTasks = data.data;
    this.errorMessage = data.error;
  }
}
