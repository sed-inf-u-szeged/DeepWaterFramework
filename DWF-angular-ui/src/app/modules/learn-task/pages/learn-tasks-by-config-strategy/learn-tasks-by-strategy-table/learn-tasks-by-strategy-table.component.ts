import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { HashWithTask } from '@app/data/models/experiment';
import { mapValues } from 'lodash-es';
import { Union } from 'ts-toolbelt';
import { ColumnPickerOptions } from '../../../components/learn-result-column-picker/learn-result-column-picker.component';
import { FocusState } from '../../../components/learn-result-focus-button/focus-state';
import { SimpleCell } from '../../../models/simple-cell';
import { LinkCell } from '../../../models/link-cell';
import { ValueCell } from '../../../models/value-cell';
import { EveryResultSetParam, LearnResultTableService } from '../../../services/learn-result-table.service';
import { LearnTaskConfig } from '../learn-task-config';

type LinkCells = Record<'hash' | 'preset', LinkCell> | Record<'hash' | 'algorithm', LinkCell>;
type ValueCells = Record<string, ValueCell>;
type ParamCells = Record<string, SimpleCell>;
type TableRow = LinkCells & ValueCells & ParamCells;

/** Table component to display tasks hash, preset, config parameters and test results. */
@Component({
  selector: 'app-learn-tasks-by-strategy-table',
  templateUrl: './learn-tasks-by-strategy-table.component.html',
  styleUrls: ['./learn-tasks-by-strategy-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  viewProviders: [
    {
      provide: LearnResultTableService,
      useFactory() {
        return new LearnResultTableService(['test']);
      },
    },
  ],
})
export class LearnTasksByStrategyTableComponent {
  /** Name of the columns containing `Result` learn config parameters. */
  paramColumns: string[] = [];
  /** Name of the columns containing `LinkCell`s. */
  linkColumns: Union.Keys<LinkCells>[];
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

  /** Input data to create the tables data from. */
  @Input() set data({ hashWithTasks, config }: { hashWithTasks: HashWithTask[]; config: LearnTaskConfig }) {
    const mapToLinkCells = this.createLinkCellsMapper(config);
    this.dataSource.data = hashWithTasks.map(
      ([hash, task]) =>
        ({
          ...mapToLinkCells([hash, task]),
          ...this.tableService.mapToValueCells(task.learn_result),
          ...mapValues(task[config].strategy_parameters, value => new SimpleCell(value)),
        } as TableRow)
    );
    this.paramColumns = hashWithTasks.length > 0 ? Object.keys(hashWithTasks[0][1][config].strategy_parameters) : [];
    this.columnsToDisplay = [...this.linkColumns, ...this.paramColumns, 'radio', ...this.valueColumns];
    this.columnsToExport = [...this.linkColumns, ...this.paramColumns, ...this.valueColumns];
    this.tableService.data = this.dataSource.data;
  }

  /**
   * Constructs a new `LearnTasksByStrategyTableComponent` and sets up the sortingDataAccessor for the dataSource.
   * @param tableService `LearnResultTableService` to produce `ValueCells` and help with `ValueCell` features.
   */
  constructor(public tableService: LearnResultTableService) {
    this.dataSource.sortingDataAccessor = (data: TableRow, sortHeaderId: keyof TableRow) =>
      (data[sortHeaderId] as ValueCell | LinkCell | SimpleCell).sortingValue;
  }

  /**
   * Creates the function that produces the `LinkCells` part of a `TableRow`.
   * @param config The displayed config.
   * @returns A function to produce `LinkCells`.
   */
  createLinkCellsMapper(config: LearnTaskConfig): ([hash, task]: HashWithTask) => LinkCells {
    const [otherConfigName, otherConfig] =
      config === 'assemble_config'
        ? (['algorithm', 'learn_config'] as const)
        : (['preset', 'assemble_config'] as const);
    this.linkColumns = ['hash', otherConfigName];

    return ([hash, task]: HashWithTask) =>
      ({
        hash: new LinkCell(hash.substr(0, 5), '../../', { expandRowByHash: hash }),
        [otherConfigName]: new LinkCell(
          task[otherConfig].strategy_name,
          `../../by-${otherConfigName}/${task[otherConfig].strategy_id}`
        ),
      } as LinkCells);
  }

  /**
   * Handles the {@link ColumnPickerComponent} output event.
   * @param columns The selected and ordered columns output of the ColumnPickerComponent.
   */
  onColumnPickerChange(columns: EveryResultSetParam[]): void {
    this.valueColumns = this.tableService.toColumnNames(columns);
    this.columnsToDisplay = [...this.linkColumns, ...this.paramColumns, 'radio', ...this.valueColumns];
    this.columnsToExport = [...this.linkColumns, ...this.paramColumns, ...this.valueColumns];
  }
}
