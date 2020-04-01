import { Injectable, Optional, Inject } from '@angular/core';
import { Task } from '@app/data/models/experiment';
import { Result } from '@app/data/models/result';
import { ValueCell, toValueCell } from '@app/shared/models/value-cell';
import { HeatmapRange } from '../../../learn-task/components/learn-result-value-cell/heatmap-range';
import { once } from 'lodash-es';
import { Union } from 'ts-toolbelt';

type ResultSet = keyof Result;
type BaseResultSetParam = Exclude<keyof Result[keyof NonNullable<Result>], 'std_dev'>;
export type EveryResultSetParam = Exclude<Union.Keys<Result[keyof NonNullable<Result>]>, 'std_dev'>;
type ValueCells = Record<string, ValueCell>;
type SortedValueColumns = { [key in keyof ValueCells]: (number | undefined)[] };
type ValueColumnsHeatmapRange = { [key in keyof ValueCells]: HeatmapRange };

@Injectable()
export class LearnResultTableService {
  set data(data: ValueCells[]) {
    this._bestWorstValues = once(() => this.getValueColumnsHeatmapRange(data));
    this._sortedValueColumns = once(() => this.getSortedValueColumns(data));
  }
  get sortedValueColumns() {
    return this._sortedValueColumns();
  }
  get bestWorstValues() {
    return this._bestWorstValues();
  }
  readonly resultSets: ResultSet[];
  readonly baseParams: BaseResultSetParam[] = [
    'accuracy',
    'tp',
    'tn',
    'fp',
    'fn',
    'mcc',
    'precision',
    'recall',
    'fmes',
  ];
  readonly completenessParams = new Set<EveryResultSetParam>(['completeness', 'covered_issues', 'missed_issues']);
  readonly allParams = [...this.baseParams, ...this.completenessParams];

  readonly allColumnsNames: string[];
  readonly lowerBetterColumns: Set<string>;

  private _bestWorstValues: () => ValueColumnsHeatmapRange = () => ({});
  private _sortedValueColumns: () => SortedValueColumns = () => ({});

  constructor(@Optional() @Inject('RESULT_SETS') resultSets: ResultSet[]) {
    this.resultSets = resultSets != null ? resultSets : ['train', 'dev', 'test'];
    this.allColumnsNames = this.toColumnNames(this.allParams);
    this.lowerBetterColumns = new Set(this.toColumnNames(['fp', 'fn', 'missed_issues']));
  }

  mapToValueCells(learnResult: Task['learn_result']): ValueCells {
    return this.resultSets.reduce(
      (acc, set) =>
        set === 'train'
          ? this.addValueCells(acc, learnResult, set, this.baseParams)
          : this.addValueCells(acc, learnResult, set, this.allParams),
      {} as ValueCells
    );
  }

  addValueCells<T extends ResultSet, U extends Exclude<keyof Result[T], 'std_dev'>>(
    accumulator: ValueCells,
    learnResult: Task['learn_result'],
    set: T,
    params: U[]
  ): ValueCells {
    params.forEach(param => {
      const columnName = this.toColumnName(set, param as EveryResultSetParam);
      accumulator[columnName] = toValueCell(learnResult, set, param, this.lowerBetterColumns.has(columnName));
    });
    return accumulator;
  }

  toColumnName(set: ResultSet, param: EveryResultSetParam): string {
    return `${set}-${param}`;
  }

  toColumnNames(params: EveryResultSetParam[]): string[] {
    return this.resultSets.reduce((acc, set) => {
      params.forEach(
        set === 'train'
          ? param => {
              if (!this.completenessParams.has(param as EveryResultSetParam)) acc.push(this.toColumnName(set, param));
            }
          : param => acc.push(this.toColumnName(set, param))
      );
      return acc;
    }, [] as string[]);
  }

  getSortedValueColumns(data: ValueCells[]): SortedValueColumns {
    return this.allColumnsNames.reduce((acc, col) => {
      const compareFn: (a: number, b: number) => number = this.lowerBetterColumns.has(col)
        ? (a, b) => a - b
        : (a, b) => -(a - b);

      acc[col] = data.map(row => row[col].value).sort(compareFn);
      return acc;
    }, {} as SortedValueColumns);
  }

  getValueColumnsHeatmapRange(data: ValueCells[]): ValueColumnsHeatmapRange {
    return this.allColumnsNames.reduce((acc, col) => {
      let worst = Infinity;
      let best = -Infinity;

      data.forEach(({ [col]: { value } }) => {
        if (!isFinite(value)) return;
        if (value < worst) worst = value;
        if (value > best) best = value;
      });

      if (this.lowerBetterColumns.has(col)) [worst, best] = [best, worst];

      acc[col] = {
        worst: isFinite(worst) ? worst : undefined,
        best: isFinite(best) ? best : undefined,
      };
      return acc;
    }, {} as ValueColumnsHeatmapRange);
  }
}
