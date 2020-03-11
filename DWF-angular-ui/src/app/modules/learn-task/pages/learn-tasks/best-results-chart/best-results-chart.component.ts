import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { Experiment } from '@app/data/models/experiment';
import { LearnResultChartData } from '../../../components/learn-result-chart/learn-result-chart-data';

type TaskEntry = LearnResultChartData['taskEntries'][number];

@Component({
  selector: 'app-best-results-chart',
  templateUrl: './best-results-chart.component.html',
  styleUrls: ['./best-results-chart.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BestResultsChartComponent {
  readonly baseChartData: Omit<LearnResultChartData, 'taskEntries'> = {
    resultType: 'test',
    resultParams: ['precision', 'recall', 'fmes'],
  };

  chartData: LearnResultChartData;

  @Input()
  set tasks(tasks: Experiment['tasks'][]) {
    this.chartData = {
      ...this.baseChartData,
      taskEntries: Object.values(this.getBestTasksByPresetPlusAlgorithm(tasks)),
    };
  }

  constructor() {}

  getBestTasksByPresetPlusAlgorithm(tasks: Experiment['tasks'][]): { [key: string]: TaskEntry } {
    const bestResults: { [key: string]: TaskEntry } = {};
    for (const taskObj of tasks) {
      for (const [hash, task] of Object.entries(taskObj)) {
        const key = `${task.assemble_config.strategy_name} ${task.learn_config.strategy_name}`;
        const bestResult = bestResults.key?.[1].learn_result?.test.fmes;
        const currResult = task.learn_result?.test.fmes;
        if (currResult != null && (bestResult == null || bestResult < currResult)) {
          bestResults[key] = [hash, task];
        }
      }
    }
    return bestResults;
  }
}
