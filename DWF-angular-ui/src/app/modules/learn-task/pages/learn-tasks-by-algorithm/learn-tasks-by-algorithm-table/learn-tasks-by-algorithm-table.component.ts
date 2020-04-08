import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';
import { HashWithTask } from '@app/data/models/experiment';
import { LinkCell } from '@app/shared/models/link-cell';
import { ValueCell } from '@app/shared/models/value-cell';
import { ColumnPickerOptions } from '../../../components/learn-result-column-picker/learn-result-column-picker.component';
import { FocusState } from '../../../components/learn-result-focus-button/focus-state';
import {
  LearnResultTableService,
  EveryResultSetParam,
} from '../../../services/learn-result-table/learn-result-table.service';

type LinkCells = Record<'hash' | 'preset', LinkCell>;
type ValueCells = Record<string, ValueCell>;
type TableRow = LinkCells & ValueCells & Record<string, string | number>;

/** Table component to display tasks hash, preset, learn config parameters and test results. */
@Component({
  selector: 'app-learn-tasks-by-algorithm-table',
  templateUrl: './learn-tasks-by-algorithm-table.component.html',
  styleUrls: ['./learn-tasks-by-algorithm-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  viewProviders: [{ provide: LearnResultTableService, useFactory: () => new LearnResultTableService(['test']) }],
})
export class LearnTasksByAlgorithmTableComponent {
  /** Name of the columns containing `Result` learn config parameters. */
  paramColumns: string[] = [];
  /** Name of the columns containing `LinkCell`s. */
  readonly linkColumns: (keyof LinkCells)[] = ['hash', 'preset'];
  /** Column names to always display. */
  readonly baseColumnsToDisplay: string[] = ['radio', ...this.linkColumns];
  /** Name of the columns containing `ValueCell`s. */
  valueColumns: (keyof ValueCells)[] = this.tableService.toColumnNames(this.tableService.allParams);
  /** Name of the columns to display. */
  columnsToDisplay: string[] = [];
  /** Name of the columns to export. */
  columnsToExport: string[] = [];
  /** Data source of the table. */
  readonly dataSource = new MatTableDataSource<TableRow>([]);

  /** The referenced row to compare the other rows. */
  referencedRow?: TableRow;
  /** Current state of the focus feature. */
  focusState: FocusState = { checked: false };
  /** Whether the heatmap enabled. */
  heatmapEnabled = false;
  /** Options for the {@link ColumnPickerComponent}. */
  readonly columnOptions: ColumnPickerOptions<EveryResultSetParam> = {
    columns: this.tableService.allParams,
    defaultToggled: [],
    defaultAllSelected: true,
  };

  /** The array of tasks and their hashes to create the tables data from. */
  @Input() set hashWithTasks(hashWithTasks: HashWithTask[]) {
    this.dataSource.data = hashWithTasks.map(
      ([hash, task]) =>
        ({
          ...this.mapToLinkCells([hash, task]),
          ...this.tableService.mapToValueCells(task.learn_result),
          ...task.learn_config.strategy_parameters,
        } as TableRow)
    );
    if (hashWithTasks.length > 0) {
      this.paramColumns = Object.keys(hashWithTasks[0][1].learn_config.strategy_parameters);
      this.columnsToDisplay = [...this.baseColumnsToDisplay, ...this.paramColumns, ...this.valueColumns];
      this.columnsToExport = [...this.linkColumns, ...this.paramColumns, ...this.valueColumns];
    }
    this.tableService.data = this.dataSource.data;
  }

  /**
   * Constructs a new `LearnTasksByAlgorithmTableComponent` and sets up the sortingDataAccessor for the dataSource.
   * @param route `ActivatedRoute` to get the currently opened Experiments ids.
   * @param tableService `LearnResultTableService` to produce `ValueCells` and help with `ValueCell` features.
   */
  constructor(private route: ActivatedRoute, public tableService: LearnResultTableService) {
    this.dataSource.sortingDataAccessor = this.sortingDataAccessor;
  }

  /**
   * Produces the `LinkCells` part of a `TableRow`.
   * @param param [hash, task] tuple to create the `LinkCells` from.
   * @returns The `LinkCells`.
   */
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

  /**
   * Data accessor function for `MatTableDataSource`.
   * @param data Table row that is being accessed.
   * @param sortHeaderId The name of the column.
   * @returns For `ValueCell`s and `LinkCell`s their value, for anything else it tries to converts to number, if can't just leaves as is.
   */
  sortingDataAccessor(data: TableRow, sortHeaderId: keyof TableRow): string | number {
    const cell = data[sortHeaderId] as LinkCell | ValueCell | string | number;
    if (cell instanceof ValueCell || cell instanceof LinkCell) {
      return cell.value;
    }
    const valueAsNumber = Number(cell);
    return isNaN(valueAsNumber) ? cell : valueAsNumber;
  }

  /**
   * Handles the {@link ColumnPickerComponent} output event.
   * @param columns The selected and ordered columns output of the ColumnPickerComponent.
   */
  onColumnPickerChange(columns: EveryResultSetParam[]): void {
    this.valueColumns = this.tableService.toColumnNames(columns);
    this.columnsToDisplay = [...this.baseColumnsToDisplay, ...this.paramColumns, ...this.valueColumns];
    this.columnsToExport = [...this.linkColumns, ...this.paramColumns, ...this.valueColumns];
  }
}
