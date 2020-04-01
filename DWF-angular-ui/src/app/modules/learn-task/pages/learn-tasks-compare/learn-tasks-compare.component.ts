import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DataResolved } from '@app/data/models/data-resolved';
import { ObservableDataResolved } from '@app/data/models/observable-data-resolved';
import { HashWithTask } from '@app/data/models/experiment';
import { LearnResultChartData } from '../../components/learn-result-chart/learn-result-chart-data';

type NotTrainResultParams = LearnResultChartData<
  Exclude<LearnResultChartData['resultSet'], 'train'>
>['resultSetParams'];

@Component({
  selector: 'app-learn-tasks-compare',
  templateUrl: './learn-tasks-compare.component.html',
  styleUrls: ['./learn-tasks-compare.component.scss'],
})
export class LearnTasksCompareComponent implements OnInit {
  errorMessage?: string;
  observableDataResolved: ObservableDataResolved<HashWithTask[]>;
  tasks: HashWithTask[];
  resultSet: LearnResultChartData['resultSet'] = 'test';
  chart1Data: LearnResultChartData;
  chart2Data: LearnResultChartData;

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.observableDataResolved = this.route.snapshot.data.learnTasksCompare;
    this.tasks = this.observableDataResolved.resolved.data;
    this.errorMessage = this.observableDataResolved.resolved.error;
    this.updateCharts(this.resultSet);
  }

  updateCharts(resultSet: LearnResultChartData['resultSet']): void {
    this.resultSet = resultSet;
    const chart1Params: LearnResultChartData['resultSetParams'] = ['fmes', 'recall', 'precision', 'mcc', 'accuracy'];
    const chart2Params: LearnResultChartData['resultSetParams'] = ['tp', 'tn', 'fp', 'fn'];

    if (resultSet !== 'train') {
      (chart1Params as NotTrainResultParams).push('completeness');
      (chart2Params as NotTrainResultParams).push('covered_issues', 'missed_issues');
    }

    this.chart1Data = { taskEntries: this.tasks, resultSet, resultSetParams: chart1Params };
    this.chart2Data = { taskEntries: this.tasks, resultSet, resultSetParams: chart2Params };
  }

  handleNewData(newData: DataResolved<HashWithTask[]>) {
    this.tasks = newData.data;
    this.errorMessage = newData.error;
    this.updateCharts(this.resultSet);
  }
}
