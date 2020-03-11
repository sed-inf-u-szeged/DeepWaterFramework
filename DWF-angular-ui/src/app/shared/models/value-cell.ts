import { Result, StdDevIndex } from '@app/data/models/result';

export class ValueCell {
  static readonly PLUS_MINUS_SIGN = '±';
  static readonly NOT_AVAILABLE = 'n/a';
  readonly value: number;
  readonly valueFixed: string;
  readonly stdDevFixed: string;
  readonly valueWithStdDev: string;
  readonly lowerBetter: boolean;

  constructor(value?: number, stdDev?: number, lowerBetter = false) {
    if (value != null) {
      this.value = value;
      this.valueFixed = value.toFixed(value % 1 && 3);
    } else {
      this.value = lowerBetter ? Infinity : -Infinity;
      this.valueFixed = ValueCell.NOT_AVAILABLE;
    }

    this.stdDevFixed = `${ValueCell.PLUS_MINUS_SIGN} ${stdDev != null ? stdDev.toFixed(3) : ValueCell.NOT_AVAILABLE}`;
    this.valueWithStdDev = `${this.valueFixed} ${this.stdDevFixed}`;
    this.lowerBetter = lowerBetter;
  }

  toString() {
    return this.valueWithStdDev;
  }
}

export function toValueCell<TKey1 extends keyof Result, TKey2 extends Exclude<keyof Result[TKey1], 'std_dev'>>(
  taskResult: Result | null,
  type: TKey1,
  param: TKey2,
  lowerBetter?: boolean
): ValueCell {
  return new ValueCell(
    taskResult?.[type][param] as number | undefined,
    taskResult?.[type].std_dev[StdDevIndex[param as keyof typeof StdDevIndex]],
    lowerBetter
  );
}
