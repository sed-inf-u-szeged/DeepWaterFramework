import { animate, state, style, transition, trigger } from '@angular/animations';
import { SelectionModel } from '@angular/cdk/collections';
import { Component, OnInit, ChangeDetectionStrategy, Input, AfterViewInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { Experiment, HashWithTask, Task } from '@app/data/models/experiment';
import { LinkCell } from '@app/shared/models/link-cell';
import { ValueCell } from '@app/shared/models/value-cell';
import { MatTableShellComponent } from '@app/shared/components/mat-table-shell/mat-table-shell.component';
import { FocusState } from '../../../components/learn-result-focus-button/focus-state';
import {
  EveryResultSetParam,
  LearnResultTableService,
} from '../../../services/learn-result-table/learn-result-table.service';
import { ColumnPickerOptions } from '../../../components/learn-result-column-picker/learn-result-column-picker.component';

type LinkCells = Record<'preset' | 'algorithm', LinkCell>;
type ValueCells = Record<string, ValueCell>;
type TableRow = LinkCells &
  ValueCells & {
    hash: string;
    shortHash: string;
    parameters: {
      features: Task['assemble_config']['strategy_parameters'] & Task['assemble_config']['shared_parameters'];
      learning: Task['learn_config']['strategy_parameters'] & Task['learn_config']['shared_parameters'];
    };
  };

@Component({
  selector: 'app-learn-task-table',
  templateUrl: './learn-task-table.component.html',
  styleUrls: ['./learn-task-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  viewProviders: [LearnResultTableService],
  animations: [
    trigger('detailExpand', [
      state('collapsed, void', style({ height: '0px', minHeight: '0px' })),
      state('expanded', style({ height: '*' })),
      transition('* <=> *', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class LearnTaskTableComponent implements OnInit, AfterViewInit {
  readonly defaultParams: EveryResultSetParam[] = ['precision', 'recall', 'fmes'];
  readonly linkColumns: Readonly<(keyof LinkCells)[]> = ['preset', 'algorithm'] as const;
  valueColumns: (keyof ValueCells)[] = this.tableService.toColumnNames(this.defaultParams);
  readonly baseColumnsToExport = [...this.linkColumns] as const;
  columnsToExport: (keyof TableRow)[] = [...this.baseColumnsToExport, ...this.valueColumns];
  readonly baseColumnsToDisplay = ['select' as const, 'radio' as const, ...this.linkColumns] as const;
  columnsToDisplay: (keyof TableRow)[] = [...this.baseColumnsToDisplay, ...this.valueColumns];
  readonly dataSource = new MatTableDataSource<TableRow>([]);
  readonly selectedRows = new SelectionModel<string>(true, []);
  readonly columnOptions: ColumnPickerOptions<EveryResultSetParam> = {
    columns: this.tableService.allParams,
    defaultToggled: this.defaultParams,
    defaultAllSelected: false,
  };

  expandedRow?: TableRow;
  referencedRow?: TableRow;
  focusState: FocusState = { checked: false };
  heatmapEnabled = false;

  @Input() set tasksOfExperiments(tasksOfExperiments: Experiment['tasks'][]) {
    this.dataSource.data = tasksOfExperiments.flatMap(tasks =>
      Object.entries(tasks).map(taskEntry => this.mapToTableRow(taskEntry))
    );
    this.tableService.data = this.dataSource.data;
  }
  @ViewChild(MatTableShellComponent, { static: true }) readonly tableShell: MatTableShellComponent;

  constructor(private readonly route: ActivatedRoute, public readonly tableService: LearnResultTableService) {}

  ngOnInit() {
    this.dataSource.sortingDataAccessor = (data: TableRow, sortHeaderId: keyof TableRow) =>
      (data[sortHeaderId] as LinkCell | ValueCell).value;
    this.dataSource.filterPredicate = this.filterPredicate;
  }

  ngAfterViewInit() {
    const expandRowByHash = history.state?.expandRowByHash;
    if (expandRowByHash != null) {
      const foundRowIndex = this.dataSource.data.findIndex(task => task.hash === expandRowByHash);
      if (foundRowIndex !== -1) {
        Promise.resolve().then(() => {
          this.tableShell.jumpToRow(foundRowIndex);
          this.expandedRow = this.dataSource.data[foundRowIndex];
        });
      }
    }
  }

  isAllSelected(): boolean {
    return this.selectedRows.selected.length === this.dataSource.data.length;
  }

  masterToggle(): void {
    this.isAllSelected()
      ? this.selectedRows.clear()
      : this.dataSource.data.forEach(row => this.selectedRows.select(row.hash));
  }

  filterPredicate(data: TableRow, filter: string): boolean {
    const parameters: keyof TableRow = 'parameters';
    return (
      Object.entries(data).some(
        ([key, value]) =>
          key !== parameters &&
          (value as TableRow[keyof Omit<TableRow, typeof parameters>])
            .toString()
            .toLowerCase()
            .includes(filter)
      ) ||
      Object.values(data.parameters).some(param =>
        Object.entries(param).some(([key, value]) => `${key}: ${value}`.toLowerCase().includes(filter))
      )
    );
  }

  mapToLinkCells(task: Task): LinkCells {
    const experimentIds: string = this.route.snapshot.paramMap.get('experimentIds')!;
    return {
      preset: new LinkCell(
        task.assemble_config.strategy_name,
        `/assemble-configs/of-experiments/${experimentIds}/by-preset/${task.assemble_config.strategy_id}`
      ),
      algorithm: new LinkCell(task.learn_config.strategy_name, `by-algorithm/${task.learn_config.strategy_id}`),
    };
  }

  mapToTableRow([hash, task]: HashWithTask): TableRow {
    return {
      hash,
      shortHash: hash.substr(0, 5),
      ...this.mapToLinkCells(task),
      ...this.tableService.mapToValueCells(task.learn_result),
      parameters: {
        features: { ...task.assemble_config.strategy_parameters, ...task.assemble_config.shared_parameters },
        learning: { ...task.learn_config.strategy_parameters, ...task.learn_config.shared_parameters },
      },
    } as TableRow;
  }

  onColumnPickerChange(columns: EveryResultSetParam[]): void {
    this.valueColumns = this.tableService.toColumnNames(columns);
    this.columnsToDisplay = [...this.baseColumnsToDisplay, ...this.valueColumns];
    this.columnsToExport = [...this.baseColumnsToExport, ...this.valueColumns];
  }
}
