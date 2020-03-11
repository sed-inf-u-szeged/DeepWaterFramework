import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { DataResolved } from '@app/data/models/data-resolved';
import { HashWithTask, Task } from '@app/data/models/experiment';
import { ObservableDataResolved } from '@app/data/models/observable-data-resolved';
import { ValueCell, toValueCell } from '@app/shared/models/value-cell';
import { LinkCell } from '@app/shared/models/link-cell';
import { once, maxBy, minBy } from 'lodash-es';
import { TableRow, ValueCells, LinkCells } from './table-row';
import { FocusState } from '../../components/learn-result-focus-button/focus-state';
import { HeatmapRange } from '../../components/learn-result-value-cell/heatmap-range';

type SortedValueColumns = { [key in keyof ValueCells]: (number | undefined)[] };
type ValueColumnsHeatmapRange = { [key in keyof ValueCells]: HeatmapRange };

@Component({
  selector: 'app-learn-tasks-by-algorithm',
  templateUrl: './learn-tasks-by-algorithm.component.html',
  styleUrls: ['./learn-tasks-by-algorithm.component.scss'],
})
export class LearnTasksByAlgorithmComponent implements OnInit {
  algorithmName?: string;
  errorMessage?: string;
  paramColumns?: string[];
  columnsToDisplay: string[] = [];
  readonly linkColumns: (keyof LinkCells)[] = ['hash', 'preset'];
  readonly valueColumns: (keyof ValueCells)[] = [
    'test-tp',
    'test-fp',
    'test-tn',
    'test-fn',
    'test-covered_issues',
    'test-missed_issues',
    'test-fmes',
    'test-precision',
    'test-accuracy',
    'test-completeness',
    'test-mcc',
    'test-recall',
  ];
  readonly lowerBetterCols: (keyof ValueCells)[] = ['test-fp', 'test-fn'];
  readonly dataSource = new MatTableDataSource<TableRow>([]);
  referencedRow?: TableRow;
  focusState: FocusState = { checked: false };
  heatmapEnabled = false;
  observableDataResolved: ObservableDataResolved<HashWithTask[]>;

  private _sortedValueColumns: () => SortedValueColumns;
  get sortedValueColumns(): SortedValueColumns {
    return this._sortedValueColumns();
  }
  private _bestWorstValues: () => ValueColumnsHeatmapRange;
  get bestWorstValues(): ValueColumnsHeatmapRange {
    return this._bestWorstValues();
  }

  constructor(private route: ActivatedRoute) {}

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

  mapToValueCells(learnResult: Task['learn_result']): ValueCells {
    return {
      'test-tp': toValueCell(learnResult, 'test', 'tp'),
      'test-fp': toValueCell(learnResult, 'test', 'fp', true),
      'test-tn': toValueCell(learnResult, 'test', 'tn'),
      'test-fn': toValueCell(learnResult, 'test', 'fn', true),
      'test-covered_issues': toValueCell(learnResult, 'test', 'covered_issues'),
      'test-missed_issues': toValueCell(learnResult, 'test', 'missed_issues'),
      'test-fmes': toValueCell(learnResult, 'test', 'fmes'),
      'test-precision': toValueCell(learnResult, 'test', 'precision'),
      'test-accuracy': toValueCell(learnResult, 'test', 'accuracy'),
      'test-completeness': toValueCell(learnResult, 'test', 'completeness'),
      'test-mcc': toValueCell(learnResult, 'test', 'mcc'),
      'test-recall': toValueCell(learnResult, 'test', 'recall'),
    };
  }

  sortingDataAccessor(data: TableRow, sortHeaderId: keyof TableRow): string | number {
    const value = data[sortHeaderId];
    if (value instanceof ValueCell || value instanceof LinkCell) {
      return value.value;
    }
    const valueAsNumber = Number(value);
    return isNaN(valueAsNumber) ? value : valueAsNumber;
  }

  getSortedValueColumns(): SortedValueColumns {
    return this.valueColumns.reduce((acc, col) => {
      const compareFn: (a: number, b: number) => number = this.lowerBetterCols.includes(col)
        ? (a, b) => a - b
        : (a, b) => -(a - b);

      acc[col] = this.dataSource.data.map(row => row[col].value).sort(compareFn);
      return acc;
    }, {} as SortedValueColumns);
  }

  getValueColumnsHeatmapRange(): ValueColumnsHeatmapRange {
    return this.valueColumns.reduce((acc, col) => {
      let worstRow = minBy(this.dataSource.data, row => row[col].value);
      let bestRow = maxBy(this.dataSource.data, row => row[col].value);

      if (this.lowerBetterCols.includes(col)) {
        [worstRow, bestRow] = [bestRow, worstRow];
      }

      acc[col] = {
        worst: worstRow && worstRow[col].value,
        best: bestRow && bestRow[col].value,
      };
      return acc;
    }, {} as ValueColumnsHeatmapRange);
  }

  handleNewData(newData: DataResolved<HashWithTask[]>): void {
    if (newData.data.length) {
      this.algorithmName = newData.data[0][1].learn_config.strategy_name;
      this.paramColumns = Object.keys(newData.data[0][1].learn_config.strategy_parameters);
      this.columnsToDisplay = ['radio', ...this.linkColumns, ...this.paramColumns, ...this.valueColumns];
    }
    this.dataSource.data = newData.data.map(([hash, task]) => ({
      ...this.mapToLinkCells([hash, task]),
      ...this.mapToValueCells(task.learn_result),
      ...task.learn_config.strategy_parameters,
    }));

    this.errorMessage = newData.error;
    this._bestWorstValues = once(() => this.getValueColumnsHeatmapRange());
    this._sortedValueColumns = once(() => this.getSortedValueColumns());
  }
}
