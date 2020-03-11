import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { AssembleConfig } from '@app/data/models/assemble_config';
import { DataResolved } from '@app/data/models/data-resolved';
import { ObservableDataResolved } from '@app/data/models/observable-data-resolved';
import { OnlyAssembleConfig } from '@app/data/models/experiment';

type TableRow = AssembleConfig['strategy_parameters'] & { hash: string };

@Component({
  selector: 'app-assemble-configs-by-preset',
  templateUrl: './assemble-configs-by-preset.component.html',
  styleUrls: ['./assemble-configs-by-preset.component.scss'],
})
export class AssembleConfigsByPresetComponent implements OnInit {
  strategyName?: string;
  errorMessage?: string;
  columnsToDisplay: string[];
  observableDataResolved: ObservableDataResolved<OnlyAssembleConfig[]>;
  readonly dataSource = new MatTableDataSource<TableRow>([]);

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.observableDataResolved = this.route.snapshot.data.assembleConfigsByPreset;
    this.handleNewData(this.observableDataResolved.resolved);
  }

  handleNewData(newData: DataResolved<OnlyAssembleConfig[]>) {
    const hashWithTasks = newData.data.flatMap(exp => Object.entries(exp.tasks));
    const data = hashWithTasks.map<TableRow>(([hash, task]) => ({
      hash: hash.substr(0, 5),
      ...task.assemble_config.strategy_parameters,
    }));
    this.strategyName = hashWithTasks[0][1].assemble_config.strategy_name;
    this.errorMessage = newData.error;
    this.columnsToDisplay = Object.keys(data[0]);
    this.dataSource.data = data;
  }
}
