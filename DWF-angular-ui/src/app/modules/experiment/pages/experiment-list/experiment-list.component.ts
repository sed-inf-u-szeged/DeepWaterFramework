import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SelectionModel } from '@angular/cdk/collections';
import { PageEvent } from '@angular/material/paginator';
import { ObservableDataResolved } from '@app/data/models/observable-data-resolved';
import { DataResolved } from '@app/data/models/data-resolved';
import { ExperimentListItem } from './experiment-list-item';

@Component({
  selector: 'app-experiment-list',
  templateUrl: './experiment-list.component.html',
  styleUrls: ['./experiment-list.component.scss'],
})
export class ExperimentListComponent implements OnInit {
  experiments: ExperimentListItem[] = [];
  experimentsPage: ExperimentListItem[] = [];
  errorMessage?: string;
  observableDataResolved: ObservableDataResolved<ExperimentListItem[]>;
  readonly pageSizeOptions = [10, 25, 50];
  readonly selectedExperiments = new SelectionModel<string>(true, []);

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.observableDataResolved = this.route.snapshot.data.experimentList;
    this.handleNewData(this.observableDataResolved.resolved);
  }

  paging(event: PageEvent): void {
    const start = event.pageIndex * event.pageSize;
    const end = start + event.pageSize;
    this.experimentsPage = this.experiments.slice(start, end);
  }

  handleNewData(newData: DataResolved<ExperimentListItem[]>): void {
    this.experiments = newData.data;
    this.errorMessage = newData.error;
    this.experimentsPage = this.experiments.slice(0, this.pageSizeOptions[0]);
  }
}
