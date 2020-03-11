import { animate, state, style, transition, trigger } from '@angular/animations';
import { SelectionModel } from '@angular/cdk/collections';
import { Component, OnInit, ChangeDetectionStrategy, Input, AfterViewInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { Experiment, HashWithTask, Task } from '@app/data/models/experiment';
import { LinkCell } from '@app/shared/models/link-cell';
import { toValueCell } from '@app/shared/models/value-cell';
import { MatTableShellComponent } from '@app/shared/components/mat-table-shell/mat-table-shell.component';
import { once, maxBy, minBy } from 'lodash-es';
import { LinkCells, TableRow, ValueCells } from './table-row';
import { FocusState } from '../../../components/learn-result-focus-button/focus-state';
import { HeatmapRange } from '../../../components/learn-result-value-cell/heatmap-range';

type SortableColumn = keyof (ValueCells & LinkCells);
type SortedValueColumns = { [key in keyof ValueCells]: (number | undefined)[] };
type ValueColumnsHeatmapRange = { [key in keyof ValueCells]: HeatmapRange };

@Component({
  selector: 'app-learn-task-table',
  templateUrl: './learn-task-table.component.html',
  styleUrls: ['./learn-task-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('detailExpand', [
      state('collapsed, void', style({ height: '0px', minHeight: '0px' })),
      state('expanded', style({ height: '*' })),
      transition('* <=> *', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class LearnTaskTableComponent implements OnInit, AfterViewInit {
  @Input() set tasks(tasks: Experiment['tasks'][]) {
    this.dataSource.data = tasks.flatMap(task => Object.entries(task).map(taskEntry => this.mapToTableRow(taskEntry)));
    this._bestWorstValues = once(() => this.getValueColumnsHeatmapRange());
    this._sortedValueColumns = once(() => this.getSortedValueColumns());
  }
  readonly linkColumns: (keyof LinkCells)[] = ['Preset', 'Algorithm'];
  readonly valueColumns: (keyof ValueCells)[] = [
    'Train-Prec',
    'Train-Recall',
    'Train-F',
    'Dev-Prec',
    'Dev-Recall',
    'Dev-F',
    'Test-Prec',
    'Test-Recall',
    'Test-F',
  ];
  readonly columnsToExport = [...this.linkColumns, ...this.valueColumns];
  readonly columnsToDisplay = ['select' as const, 'radio' as const, ...this.linkColumns, ...this.valueColumns];
  readonly dataSource = new MatTableDataSource<TableRow>([]);
  readonly selectedRows = new SelectionModel<string>(true, []);
  expandedRow?: TableRow;
  referencedRow?: TableRow;
  focusState: FocusState = { checked: false };
  heatmapEnabled = false;

  @ViewChild(MatTableShellComponent, { static: true }) tableShell: MatTableShellComponent;

  private _sortedValueColumns: () => SortedValueColumns;
  get sortedValueColumns() {
    return this._sortedValueColumns();
  }

  private _bestWorstValues: () => ValueColumnsHeatmapRange;
  get bestWorstValues() {
    return this._bestWorstValues();
  }

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.dataSource.sortingDataAccessor = (data: TableRow, sortHeaderId: SortableColumn) => data[sortHeaderId].value;
    this.dataSource.filterPredicate = this.filterPredicate;
  }

  ngAfterViewInit() {
    const expandRowByHash = history.state?.expandRowByHash;
    if (expandRowByHash != null) {
      const foundRowIndex = this.dataSource.data.findIndex(task => task.hash === expandRowByHash);
      if (foundRowIndex !== -1) {
        setTimeout(() => {
          this.tableShell.jumpToRow(foundRowIndex);
          this.expandedRow = this.dataSource.data[foundRowIndex];
        }, 0);
      }
    }
  }

  isAllSelected(): boolean {
    const numSelected = this.selectedRows.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
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
      Preset: new LinkCell(
        task.assemble_config.strategy_name,
        `/assemble-configs/of-experiments/${experimentIds}/by-preset/${task.assemble_config.strategy_id}`
      ),
      Algorithm: new LinkCell(task.learn_config.strategy_name, `by-algorithm/${task.learn_config.strategy_id}`),
    };
  }

  mapToValueCells(learnResult: Task['learn_result']): ValueCells {
    return {
      'Train-Prec': toValueCell(learnResult, 'train', 'precision'),
      'Train-Recall': toValueCell(learnResult, 'train', 'recall'),
      'Train-F': toValueCell(learnResult, 'train', 'fmes'),
      'Dev-Prec': toValueCell(learnResult, 'dev', 'precision'),
      'Dev-Recall': toValueCell(learnResult, 'dev', 'recall'),
      'Dev-F': toValueCell(learnResult, 'dev', 'fmes'),
      'Test-Prec': toValueCell(learnResult, 'test', 'precision'),
      'Test-Recall': toValueCell(learnResult, 'test', 'recall'),
      'Test-F': toValueCell(learnResult, 'test', 'fmes'),
    };
  }

  mapToTableRow([hash, task]: HashWithTask): TableRow {
    return {
      hash,
      shortHash: hash.substr(0, 5),
      ...this.mapToLinkCells(task),
      ...this.mapToValueCells(task.learn_result),
      parameters: {
        features: { ...task.assemble_config.strategy_parameters, ...task.assemble_config.shared_parameters },
        learning: { ...task.learn_config.strategy_parameters, ...task.learn_config.shared_parameters },
      },
    };
  }

  getValueColumnsHeatmapRange(): ValueColumnsHeatmapRange {
    return this.valueColumns.reduce((acc, col) => {
      const worstRow = minBy(this.dataSource.data, row => row[col].value);
      const bestRow = maxBy(this.dataSource.data, row => row[col].value);
      acc[col] = {
        worst: worstRow && worstRow[col].value,
        best: bestRow && bestRow[col].value,
      };
      return acc;
    }, {} as ValueColumnsHeatmapRange);
  }

  getSortedValueColumns(): SortedValueColumns {
    return this.valueColumns.reduce((acc, col) => {
      acc[col] = this.dataSource.data.map(row => row[col].value).sort((a, b) => -(a - b));
      return acc;
    }, {} as SortedValueColumns);
  }
}
