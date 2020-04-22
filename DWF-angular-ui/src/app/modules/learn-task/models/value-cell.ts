import { Result, stdDevIndex } from '@app/data/models/result';

/** Represents an Experiment Result value and its corresponding standard deviation inside tables. */
export class ValueCell {
  /** Character used between the value and standard deviation. */
  static readonly PLUS_MINUS_SIGN = '±' as const;
  /** Text used when value or standard deviation is not available. */
  static readonly NOT_AVAILABLE = 'n/a' as const;
  /** Numeric value of the result. */
  readonly value: number | undefined;
  /** String representation of the value rounded to 3 decimal if its not an integer or the not availabe text. */
  readonly valueFixed: string;
  /** String representation of the standard deviation rounded to 3 decimal if its not an integer or the not availabe text. */
  readonly stdDevFixed: string;
  /** String representation of the value and its standard deviation */
  readonly valueWithStdDev: string;
  /** Whether the lower value means better result. */
  readonly lowerBetter: boolean;
  /** Value used to order `ValueCell`s. */
  readonly sortingValue: number;

  /**
   * Constructs a new `ValueCell`.
   * @param value Value of the result.
   * @param stdDev Standard deviation of the result.
   * @param lowerBetter Whether the lower value means better result.
   */
  constructor(value?: number, stdDev?: number, lowerBetter = false) {
    if (value != null) {
      this.sortingValue = value;
      this.valueFixed = value.toFixed(value % 1 && 3);
    } else {
      this.sortingValue = lowerBetter ? Infinity : -Infinity;
      this.valueFixed = ValueCell.NOT_AVAILABLE;
    }

    this.value = value;
    this.stdDevFixed = `${ValueCell.PLUS_MINUS_SIGN} ${
      stdDev != null ? stdDev.toFixed(stdDev % 1 && 3) : ValueCell.NOT_AVAILABLE
    }`;
    this.valueWithStdDev = `${this.valueFixed} ${this.stdDevFixed}`;
    this.lowerBetter = lowerBetter;
  }

  /**
   * Gives back the string representation of the value and its standard deviation.
   * @returns The string representation.
   */
  toString(): string {
    return this.valueWithStdDev;
  }
}

/**
 * Creates a `ValueCell` from a result value picked from a task's `Result` object.
 * @param taskResult The `Result` object.
 * @param type The type inside of the `Result`.
 * @param param The parameter's name inside of the picked type.
 * @param lowerBetter Whether the lower value means better result.
 * @returns A new `ValueCell`.
 */
export function toValueCell<TKey1 extends keyof Result, TKey2 extends Exclude<keyof Result[TKey1], 'std_dev'>>(
  taskResult: Result | null,
  type: TKey1,
  param: TKey2,
  lowerBetter?: boolean
): ValueCell {
  return new ValueCell(
    taskResult?.[type][param] as number | undefined,
    taskResult?.[type].std_dev[stdDevIndex[param as keyof typeof stdDevIndex]],
    lowerBetter
  );
}
