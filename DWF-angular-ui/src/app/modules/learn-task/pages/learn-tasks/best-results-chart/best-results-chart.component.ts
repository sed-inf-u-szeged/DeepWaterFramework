import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { Experiment, HashWithTask } from '@app/data/models/experiment';
import { LearnResultChartData } from '../../../components/learn-result-chart/learn-result-chart-data';

/**
 * Barchart component to display the test precision, recall and fmes values
 * for the best tasks of every preset + algorithm combination based on test fmes value.
 */
@Component({
  selector: 'app-best-results-chart',
  templateUrl: './best-results-chart.component.html',
  styleUrls: ['./best-results-chart.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BestResultsChartComponent {
  /** Base fields of `LearnResultChartData`. */
  readonly baseChartData: Omit<LearnResultChartData, 'taskEntries'> = {
    resultSet: 'test',
    resultSetParams: ['precision', 'recall', 'fmes'],
  };

  /** Chart data for {@link LearnResultChartComponent}. */
  chartData: LearnResultChartData;

  /** The array of experiment tasks to create the chart data from. */
  @Input() set tasksOfExperiments(tasksOfExperiments: Experiment['tasks'][]) {
    this.chartData = {
      ...this.baseChartData,
      taskEntries: Object.values(this.getBestTasksByPresetPlusAlgorithm(tasksOfExperiments)),
    };
  }

  /**
   * Gets the best tasks for every preset + algorithm combination based on test fmes value.
   * @param tasksOfExperiments Array to find the best tasks in.
   * @returns Array of object where the key is the combination and the value is the best task of that combination.
   */
  getBestTasksByPresetPlusAlgorithm(tasksOfExperiments: Experiment['tasks'][]): { [combo: string]: HashWithTask } {
    const bestResults: { [combo: string]: HashWithTask } = {};
    for (const tasks of tasksOfExperiments) {
      for (const [hash, task] of Object.entries(tasks)) {
        const combo = `${task.assemble_config.strategy_name} ${task.learn_config.strategy_name}`;
        const bestResult = bestResults.key?.[1].learn_result?.test.fmes;
        const currResult = task.learn_result?.test.fmes;
        if (currResult != null && (bestResult == null || bestResult < currResult)) {
          bestResults[combo] = [hash, task];
        }
      }
    }
    return bestResults;
  }
}
