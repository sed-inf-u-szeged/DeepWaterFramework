/** Results for the data sets. */
export interface Result {
  /** Development set's results. */
  readonly dev: {
    readonly tp: number;
    readonly tn: number;
    readonly fp: number;
    readonly fn: number;
    readonly accuracy: number;
    readonly precision: number;
    readonly recall: number;
    readonly fmes: number;
    readonly mcc: number;
    readonly covered_issues: number;
    readonly missed_issues: number;
    readonly completeness: number;
    readonly std_dev: number[];
  };
  /** Test set's results. */
  readonly test: {
    readonly tp: number;
    readonly tn: number;
    readonly fp: number;
    readonly fn: number;
    readonly accuracy: number;
    readonly precision: number;
    readonly recall: number;
    readonly fmes: number;
    readonly mcc: number;
    readonly covered_issues: number;
    readonly missed_issues: number;
    readonly completeness: number;
    readonly std_dev: number[];
  };
  /** Training set's results. */
  readonly train: {
    readonly tp: number;
    readonly tn: number;
    readonly fp: number;
    readonly fn: number;
    readonly accuracy: number;
    readonly precision: number;
    readonly recall: number;
    readonly fmes: number;
    readonly mcc: number;
    readonly std_dev: number[];
  };
}

/** Dataset result parameters with their index in the `std_dev` array. */
export const stdDevIndex = {
  tp: 0,
  tn: 1,
  fp: 2,
  fn: 3,
  accuracy: 4,
  precision: 5,
  recall: 6,
  fmes: 7,
  mcc: 8,
  covered_issues: 9,
  missed_issues: 10,
  completeness: 11,
} as const;
