import { animate, state, style, transition, trigger } from '@angular/animations';
import { SelectionModel } from '@angular/cdk/collections';
import { Component, ChangeDetectionStrategy, Input, AfterViewInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
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

/** Table component to display tasks hash, preset, algorithm and train, dev, test results. */
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
export class LearnTaskTableComponent implements AfterViewInit {
  /** The default result set params to make value column from. */
  readonly defaultParams: EveryResultSetParam[] = ['precision', 'recall', 'fmes'];
  /** Name of the columns containing `LinkCell`s. */
  readonly linkColumns: Readonly<(keyof LinkCells)[]> = ['preset', 'algorithm'] as const;
  /** Name of the columns containing `ValueCell`s. */
  valueColumns: (keyof ValueCells)[] = this.tableService.toColumnNames(this.defaultParams);
  /** Column names to always export. */
  readonly baseColumnsToExport = [...this.linkColumns] as const;
  /** Name of the columns to export. */
  columnsToExport: (keyof TableRow)[] = [...this.baseColumnsToExport, ...this.valueColumns];
  /** Column names to always display. */
  readonly baseColumnsToDisplay = ['select' as const, ...this.linkColumns, 'radio' as const] as const;
  /** Name of the columns to display. */
  columnsToDisplay: (keyof TableRow)[] = [...this.baseColumnsToDisplay, ...this.valueColumns];
  /** Data source of the table. */
  readonly dataSource = new MatTableDataSource<TableRow>([]);
  /** The currently selected rows by the checkboxes. */
  readonly selectedRows = new SelectionModel<string>(true, []);
  /** Options for the {@link ColumnPickerComponent}. */
  readonly columnOptions: ColumnPickerOptions<EveryResultSetParam> = {
    columns: this.tableService.allParams,
    defaultToggled: this.defaultParams,
    defaultAllSelected: false,
  };

  /** The currently expanded row. */
  expandedRow?: TableRow;
  /** The referenced row to compare the other rows. */
  referencedRow?: TableRow;
  /** Current state of the focus feature. */
  focusState: FocusState = { checked: false };
  /** Whether the heatmap enabled. */
  heatmapEnabled = false;

  /** The array of experiment tasks to create the tables data from. */
  @Input() set tasksOfExperiments(tasksOfExperiments: Experiment['tasks'][]) {
    this.dataSource.data = tasksOfExperiments.flatMap(tasks =>
      Object.entries(tasks).map(taskEntry => this.mapToTableRow(taskEntry))
    );
    this.tableService.data = this.dataSource.data;
  }
  /** Reference to the table shell component. */
  @ViewChild(MatTableShellComponent, { static: true }) readonly tableShell: MatTableShellComponent;

  /**
   * Constructs a new `LearnTaskTableComponent` and sets up the sortingDataAccessor and the filterPredicate for the dataSource.
   * @param route `ActivatedRoute` to get the currently opened Experiments ids.
   * @param tableService `LearnResultTableService` to produce `ValueCells` and help with `ValueCell` features.
   */
  constructor(public readonly tableService: LearnResultTableService) {
    this.dataSource.sortingDataAccessor = (data: TableRow, sortHeaderId: keyof TableRow) =>
      (data[sortHeaderId] as LinkCell | ValueCell).value;
    this.dataSource.filterPredicate = this.filterPredicate;
  }

  /**
   * Checks if it should expand a row after view init and expands it in a resolved promise to
   * guard against making template changes within a change detection run.
   */
  ngAfterViewInit(): void {
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

  /** Whether all checkbox is selected. */
  isAllCheckboxSelected(): boolean {
    return this.selectedRows.selected.length === this.dataSource.data.length;
  }

  /** Master toggle for the checkboxes. */
  checkboxMasterToggle(): void {
    this.isAllCheckboxSelected()
      ? this.selectedRows.clear()
      : this.dataSource.data.forEach(row => this.selectedRows.select(row.hash));
  }

  /**
   * Checks if a row's cell matches the filter string.
   * @param data A row of the table.
   * @param filter The filter string.
   * @returns Whether the filter matches against the row.
   */
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

  /**
   * Produces the `LinkCells` part of a `TableRow`.
   * @param param [hash, task] tupple.
   * @returns The `LinkCells`.
   */
  mapToLinkCells(task: Task): LinkCells {
    return {
      preset: new LinkCell(task.assemble_config.strategy_name, `by-preset/${task.assemble_config.strategy_id}`),
      algorithm: new LinkCell(task.learn_config.strategy_name, `by-algorithm/${task.learn_config.strategy_id}`),
    };
  }

  /**
   * Pruduces a row of the table.
   * @param param [hash, task] tuple to create the row from.
   * @returns A table row.
   */
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

  /**
   * Handles the {@link ColumnPickerComponent} output event.
   * @param columns The selected and ordered columns output of the ColumnPickerComponent.
   */
  onColumnPickerChange(columns: EveryResultSetParam[]): void {
    this.valueColumns = this.tableService.toColumnNames(columns);
    this.columnsToDisplay = [...this.baseColumnsToDisplay, ...this.valueColumns];
    this.columnsToExport = [...this.baseColumnsToExport, ...this.valueColumns];
  }
}
