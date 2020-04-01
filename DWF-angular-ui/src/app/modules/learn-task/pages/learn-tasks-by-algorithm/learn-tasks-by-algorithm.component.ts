import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { DataResolved } from '@app/data/models/data-resolved';
import { HashWithTask } from '@app/data/models/experiment';
import { ObservableDataResolved } from '@app/data/models/observable-data-resolved';
import { ValueCell } from '@app/shared/models/value-cell';
import { LinkCell } from '@app/shared/models/link-cell';
import { FocusState } from '../../components/learn-result-focus-button/focus-state';
import {
  LearnResultTableService,
  EveryResultSetParam,
} from '../../services/learn-result-table/learn-result-table.service';
import { ColumnPickerOptions } from '../../components/learn-result-column-picker/learn-result-column-picker.component';

type LinkCells = Record<'hash' | 'preset', LinkCell>;
type ValueCells = Record<string, ValueCell>;
type TableRow = LinkCells & ValueCells & Record<string, string | number>;

@Component({
  selector: 'app-learn-tasks-by-algorithm',
  templateUrl: './learn-tasks-by-algorithm.component.html',
  styleUrls: ['./learn-tasks-by-algorithm.component.scss'],
  viewProviders: [{ provide: LearnResultTableService, useFactory: () => new LearnResultTableService(['test']) }],
})
export class LearnTasksByAlgorithmComponent implements OnInit {
  algorithmName?: string;
  errorMessage?: string;
  observableDataResolved: ObservableDataResolved<HashWithTask[]>;

  paramColumns: string[] = [];
  readonly linkColumns: (keyof LinkCells)[] = ['hash', 'preset'];
  readonly baseColumnsToDisplay: string[] = ['radio', ...this.linkColumns];
  valueColumns: (keyof ValueCells)[] = this.tableService.toColumnNames(this.tableService.allParams);
  columnsToDisplay: string[] = [];
  columnsToExport: string[] = [];
  readonly dataSource = new MatTableDataSource<TableRow>([]);

  referencedRow?: TableRow;
  focusState: FocusState = { checked: false };
  heatmapEnabled = false;
  readonly columnOptions: ColumnPickerOptions<EveryResultSetParam> = {
    columns: this.tableService.allParams,
    defaultToggled: [],
    defaultAllSelected: true,
  };

  constructor(private route: ActivatedRoute, public tableService: LearnResultTableService) {}

  ngOnInit() {
    this.observableDataResolved = this.route.snapshot.data.learnTasksByAlgorithm;
    this.handleNewData(this.observableDataResolved.resolved);
    this.dataSource.sortingDataAccessor = this.sortingDataAccessor;
  }

  mapToLinkCells([hash, task]: HashWithTask): LinkCells {
    const experimentIds: string = this.route.snapshot.paramMap.get('experimentIds')!;
    return {
      hash: new LinkCell(hash.substr(0, 5), '../../', { expandRowByHash: hash }),
      preset: new LinkCell(
        task.assemble_config.strategy_name,
        `/assemble-configs/of-experiments/${experimentIds}/by-preset/${task.assemble_config.strategy_id}`
      ),
    };
  }

  sortingDataAccessor(data: TableRow, sortHeaderId: keyof TableRow): string | number {
    const value = data[sortHeaderId] as LinkCell | ValueCell | string | number;
    if (value instanceof ValueCell || value instanceof LinkCell) {
      return value.value;
    }
    const valueAsNumber = Number(value);
    return isNaN(valueAsNumber) ? value : valueAsNumber;
  }

  handleNewData(newData: DataResolved<HashWithTask[]>): void {
    if (newData.data.length) {
      this.algorithmName = newData.data[0][1].learn_config.strategy_name;
      this.paramColumns = Object.keys(newData.data[0][1].learn_config.strategy_parameters);
      this.columnsToDisplay = [...this.baseColumnsToDisplay, ...this.paramColumns, ...this.valueColumns];
      this.columnsToExport = [...this.linkColumns, ...this.paramColumns, ...this.valueColumns];
    }
    this.dataSource.data = newData.data.map(
      ([hash, task]) =>
        ({
          ...this.mapToLinkCells([hash, task]),
          ...this.tableService.mapToValueCells(task.learn_result),
          ...task.learn_config.strategy_parameters,
        } as TableRow)
    );
    this.tableService.data = this.dataSource.data;
    this.errorMessage = newData.error;
  }

  onColumnPickerChange(columns: EveryResultSetParam[]): void {
    this.valueColumns = this.tableService.toColumnNames(columns);
    this.columnsToDisplay = [...this.baseColumnsToDisplay, ...this.paramColumns, ...this.valueColumns];
    this.columnsToExport = [...this.linkColumns, ...this.paramColumns, ...this.valueColumns];
  }
}
