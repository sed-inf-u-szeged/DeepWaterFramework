import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DataResolved } from '@app/data/models/data-resolved';
import { HashWithTask } from '@app/data/models/experiment';
import { ObservableDataResolved } from '@app/data/models/observable-data-resolved';
import { LearnTaskConfig } from './learn-task-config';

/** Page component for learn tasks of a specific config's startegy. */
@Component({
  selector: 'app-learn-tasks-by-config-strategy',
  templateUrl: './learn-tasks-by-config-strategy.component.html',
  styleUrls: ['./learn-tasks-by-config-strategy.component.scss'],
})
export class LearnTasksByConfigStrategyComponent {
  /** Name of the tasks' config's strategy.  */
  strategyName?: string;
  /** The feature the tasks filtered by. */
  readonly tasksBy: 'preset' | 'algorithm';
  /** The feature displayed on the boxplot. */
  readonly boxplotFor: 'presets' | 'algorithms';
  /** The config used. */
  readonly config: LearnTaskConfig;
  /** The config to display on the boxplot. */
  readonly boxplotConfig: LearnTaskConfig;
  /** An array of [hash, task] tuples to pass to child components. */
  hashWithTasks: HashWithTask[];
  /** Error message to display. */
  errorMessage?: string;
  /** The resolved array of [hash, task] tuples and it's observable query to reuse. */
  readonly observableDataResolved: ObservableDataResolved<HashWithTask[]>;

  /**
   * Constructs a new `LearnTasksByConfigStrategyComponent` and gets the resolved data from the route snapshot.
   * @param route The `ActivatedRoute` to get the resolved data from.
   */
  constructor(route: ActivatedRoute) {
    this.observableDataResolved = route.snapshot.data.learnTasksByConfigStrategy;
    this.config = route.snapshot.data.config;
    if (this.config === 'assemble_config') {
      this.tasksBy = 'preset';
      this.boxplotFor = 'algorithms';
      this.boxplotConfig = 'learn_config';
    } else {
      this.tasksBy = 'algorithm';
      this.boxplotFor = 'presets';
      this.boxplotConfig = 'assemble_config';
    }
    this.handleNewData(this.observableDataResolved.resolved);
  }

  /**
   * Handles the new data on init and from polling.
   * @param newData The new resolved data.
   */
  handleNewData(newData: DataResolved<HashWithTask[]>): void {
    if (newData.data.length) {
      this.strategyName = newData.data[0][1][this.config].strategy_name;
    }
    this.hashWithTasks = newData.data;
    this.errorMessage = newData.error;
  }
}
