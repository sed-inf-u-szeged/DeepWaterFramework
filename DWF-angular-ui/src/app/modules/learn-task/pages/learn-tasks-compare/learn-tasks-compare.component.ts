import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ResolvedData } from '@app/data/models/resolved-data';
import { ResolvedAndObservable } from '@app/data/models/resolved-and-observable';
import { HashWithTask } from '@app/data/models/experiment';
import { LearnResultChartData } from '../../components/learn-result-chart/learn-result-chart-data';

type NotTrainResultParams = LearnResultChartData<
  Exclude<LearnResultChartData['resultSet'], 'train'>
>['resultSetParams'];

/** Page component for task comparison charts.  */
@Component({
  selector: 'app-learn-tasks-compare',
  templateUrl: './learn-tasks-compare.component.html',
  styleUrls: ['./learn-tasks-compare.component.scss'],
})
export class LearnTasksCompareComponent {
  /** Error message to display. */
  errorMessage?: string;
  /** The resolved array of [hash, task] tuples and it's observable query to reuse. */
  resolvedAndObservable: ResolvedAndObservable<HashWithTask[]>;
  /** The array of tasks and their hashes to create the charts from. */
  hashWithTasks: HashWithTask[];
  /** The current result set to compare. */
  resultSet: LearnResultChartData['resultSet'] = 'test';
  /** Chart comapring parameters with decimal value between 0-1. */
  chart1Data: LearnResultChartData;
  /** Chart comapring parameters with integer value with unknown interval. */
  chart2Data: LearnResultChartData;

  /**
   * Constructs a new `LearnTasksCompareComponent` and gets the resolved data from the route snapshot.
   * @param route The `ActivatedRoute` to get the resolved data from.
   */
  constructor(route: ActivatedRoute) {
    this.resolvedAndObservable = route.snapshot.data.learnTasksCompare;
    this.handleNewData(this.resolvedAndObservable.resolved);
  }

  /**
   * Updates the charts with data produced from the current tasks data and the selected result set.
   * @param resultSet The selected result set.
   */
  updateCharts(resultSet: LearnResultChartData['resultSet']): void {
    this.resultSet = resultSet;
    const chart1Params: LearnResultChartData['resultSetParams'] = ['fmes', 'recall', 'precision', 'mcc', 'accuracy'];
    const chart2Params: LearnResultChartData['resultSetParams'] = ['tp', 'tn', 'fp', 'fn'];

    if (resultSet !== 'train') {
      (chart1Params as NotTrainResultParams).push('completeness');
      (chart2Params as NotTrainResultParams).push('covered_issues', 'missed_issues');
    }

    this.chart1Data = { taskEntries: this.hashWithTasks, resultSet, resultSetParams: chart1Params };
    this.chart2Data = { taskEntries: this.hashWithTasks, resultSet, resultSetParams: chart2Params };
  }

  /**
   * Handles the new data on init and from polling.
   * @param newData The new resolved data.
   */
  handleNewData(newData: ResolvedData<HashWithTask[]>): void {
    this.hashWithTasks = newData.data;
    this.errorMessage = newData.error;
    this.updateCharts(this.resultSet);
  }
}
