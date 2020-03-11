import { ActivatedRoute } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { Experiment } from '@app/data/models/experiment';
import { DataResolved } from '@app/data/models/data-resolved';
import { ObservableDataResolved } from '@app/data/models/observable-data-resolved';

@Component({
  selector: 'app-learn-tasks',
  templateUrl: './learn-tasks.component.html',
  styleUrls: ['./learn-tasks.component.scss'],
})
export class LearnTasksComponent implements OnInit {
  experimentTasks: Experiment['tasks'][];
  errorMessage?: string;
  observableDataResolved: ObservableDataResolved<Experiment['tasks'][]>;

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.observableDataResolved = this.route.snapshot.data.learnTasks;
    this.experimentTasks = this.observableDataResolved.resolved.data;
    this.errorMessage = this.observableDataResolved.resolved.error;
  }

  handleNewData(data: DataResolved<Experiment['tasks'][]>) {
    this.experimentTasks = data.data;
    this.errorMessage = data.error;
  }
}
