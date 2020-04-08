import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DataResolved } from '@app/data/models/data-resolved';
import { HashWithTask } from '@app/data/models/experiment';
import { ObservableDataResolved } from '@app/data/models/observable-data-resolved';

/** Page component for learn tasks of a specific algorithm */
@Component({
  selector: 'app-learn-tasks-by-algorithm',
  templateUrl: './learn-tasks-by-algorithm.component.html',
  styleUrls: ['./learn-tasks-by-algorithm.component.scss'],
})
export class LearnTasksByAlgorithmComponent {
  /** Name of the tasks algorithm.  */
  algorithmName?: string;
  /** An array of [hash, task] tuples to pass to child components. */
  hashWithTasks: HashWithTask[];
  /** Error message to display. */
  errorMessage?: string;
  /** The resolved array of [hash, task] tuples and it's observable query to reuse. */
  observableDataResolved: ObservableDataResolved<HashWithTask[]>;

  /**
   * Constructs a new `LearnTasksByAlgorithmComponent` and gets the resolved data from the route snapshot.
   * @param route The `ActivatedRoute` to get the resolved data from.
   */
  constructor(route: ActivatedRoute) {
    this.observableDataResolved = route.snapshot.data.learnTasksByAlgorithm;
    this.handleNewData(this.observableDataResolved.resolved);
  }

  /**
   * Handles the new data on init and from polling.
   * @param newData The new resolved data.
   */
  handleNewData(newData: DataResolved<HashWithTask[]>): void {
    if (newData.data.length) {
      this.algorithmName = newData.data[0][1].learn_config.strategy_name;
    }
    this.hashWithTasks = newData.data;
    this.errorMessage = newData.error;
  }
}
