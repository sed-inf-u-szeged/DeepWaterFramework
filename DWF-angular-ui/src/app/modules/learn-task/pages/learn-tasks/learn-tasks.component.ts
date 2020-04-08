import { ActivatedRoute } from '@angular/router';
import { Component } from '@angular/core';
import { Experiment } from '@app/data/models/experiment';
import { DataResolved } from '@app/data/models/data-resolved';
import { ObservableDataResolved } from '@app/data/models/observable-data-resolved';

/** Page component for learn tasks. */
@Component({
  selector: 'app-learn-tasks',
  templateUrl: './learn-tasks.component.html',
  styleUrls: ['./learn-tasks.component.scss'],
})
export class LearnTasksComponent {
  /** An array of experiment tasks to pass to child components. */
  tasksOfExperiments: Experiment['tasks'][];
  /** Error message to display. */
  errorMessage?: string;
  /** The resolved array of experiment tasks and it's observable query to reuse. */
  observableDataResolved: ObservableDataResolved<Experiment['tasks'][]>;

  /**
   * Constructs a new `LearnTasksComponent` and gets the resolved data from the route snapshot.
   * @param route The `ActivatedRoute` to get the resolved data from.
   */
  constructor(route: ActivatedRoute) {
    this.observableDataResolved = route.snapshot.data.learnTasks;
    this.handleNewData(this.observableDataResolved.resolved);
  }

  /**
   * Handles the new data on init and from polling.
   * @param data The new resolved data.
   */
  handleNewData(data: DataResolved<Experiment['tasks'][]>) {
    this.tasksOfExperiments = data.data;
    this.errorMessage = data.error;
  }
}
