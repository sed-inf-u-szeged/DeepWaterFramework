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

/** A service to produce `ValueCells` and help with `ValueCell` features. */
@Injectable()
export class LearnResultTableService {
  /**
   * On data change function calls to {@link LearnResultTableService#getSortedValueColumns} and
   * {@link LearnResultTableService#getValueColumnsHeatmapRange} are getting wrapped in
   * lodash.once with the data to be lazily invoced when its needed.
   */
  set data(data: ValueCells[]) {
    this._sortedValueColumns = once(() => this.getSortedValueColumns(data));
    this._valueColumnsHeatmapRange = once(() => this.getValueColumnsHeatmapRange(data));
  }
  /** Accessor for {@link LearnResultTableService#_sortedValueColumns} to hide the wrapped function call. */
  get sortedValueColumns() {
    return this._sortedValueColumns();
  }
  /** Accessor for {@link LearnResultTableService#_valueColumnsHeatmapRange} to hide the wrapped function call. */
  get valueColumnsHeatmapRange() {
    return this._valueColumnsHeatmapRange();
  }

  /**
   * Constructs a new `LearnResultTableService` and sets up the result sets with default value if its not supplied
   * and sets up properties based on the result set.
   * @param resultSets Result sets to use, uses all if not supplied.
   */
  constructor(@Optional() @Inject('RESULT_SETS') resultSets?: ResultSet[]) {
    this.resultSets = resultSets != null ? resultSets : ['train', 'dev', 'test'];
    this.allColumnsNames = this.toColumnNames(this.allParams);
    this.lowerBetterColumns = new Set(this.toColumnNames(['fp', 'fn', 'missed_issues']));
  }
  /** Name of the result sets to use. */
  readonly resultSets: ResultSet[];
  /** Result set parameter names that every result set has. */
  readonly baseParams: BaseResultSetParam[] = [
    'tp',
    'tn',
    'fp',
    'fn',
    'accuracy',
    'precision',
    'recall',
    'fmes',
    'mcc',
  ];
  /** Result set parameter names that the train result set does not have. */
  readonly completenessParams = new Set<EveryResultSetParam>(['completeness', 'covered_issues', 'missed_issues']);
  /** Every result set parameter. */
  readonly allParams = [...this.baseParams, ...this.completenessParams];

  /** Every column's name. */
  readonly allColumnsNames: string[];
  /** Column names where the lower is the better value. */
  readonly lowerBetterColumns: Set<string>;

  /** On data change it's set up with a call to {@link LearnResultTableService#getSortedValueColumns} wrapped in lodash.once. */
  private _sortedValueColumns: () => SortedValueColumns = () => ({});
  /** On data change it's set up with a call to {@link LearnResultTableService#getValueColumnsHeatmapRange} wrapped in lodash.once. */
  private _valueColumnsHeatmapRange: () => ValueColumnsHeatmapRange = () => ({});

  /**
   * Produces the `ValueCells`.
   * @param param Task learn result to create the cells from.
   * @returns The `ValueCells`.
   */
  mapToValueCells(learnResult: Task['learn_result']): ValueCells {
    return this.resultSets.reduce(
      (acc, set) =>
        set === 'train'
          ? this.addValueCells(acc, learnResult, set, this.baseParams)
          : this.addValueCells(acc, learnResult, set, this.allParams),
      {} as ValueCells
    );
  }

  /**
   * Adds columns with `ValueCell`s to the accumulator object and return it.
   * @param accumulator ValueCells object to add the cells to.
   * @param learnResult Learn result to create the cells from.
   * @param set Result set of the cells.
   * @param params Result set params to create cells for.
   * @returns The `ValueCells` object.
   */
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

  /**
   * Creates the column name from the result set and the result set param.
   * @param set The name of the result set.
   * @param param The name of the result set param.
   * @returns The column name.
   */
  toColumnName(set: ResultSet, param: EveryResultSetParam): string {
    return `${set}-${param}`;
  }

  /**
   * Creates the column names from the result sets and the result set params.
   * @param params The result set params.
   * @returns Array of column names.
   */
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

  /**
   * Produces a better to worse ordered array for every value column of their values.
   * @param data Array of `ValueCells`.
   * @returns Value column names with their better to worse ordered values.
   */
  getSortedValueColumns(data: ValueCells[]): SortedValueColumns {
    return this.allColumnsNames.reduce((acc, col) => {
      const compareFn: (a: number, b: number) => number = this.lowerBetterColumns.has(col)
        ? (a, b) => a - b
        : (a, b) => -(a - b);

      acc[col] = data.map(row => row[col].value).sort(compareFn);
      return acc;
    }, {} as SortedValueColumns);
  }

  /**
   * Produces the `HeatmapRange` for every value column.
   * @param data Array of `ValueCells`.
   * @returns Value column names with their `HeatmapRange`.
   */
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
