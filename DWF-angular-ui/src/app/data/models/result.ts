/** Results for the data sets. */
export interface Result {
  /** Development set's results. */
  dev: {
    tp: number;
    tn: number;
    fp: number;
    fn: number;
    accuracy: number;
    precision: number;
    recall: number;
    fmes: number;
    mcc: number;
    covered_issues: number;
    missed_issues: number;
    completeness: number;
    std_dev: number[];
  };
  /** Test set's results. */
  test: {
    tp: number;
    tn: number;
    fp: number;
    fn: number;
    accuracy: number;
    precision: number;
    recall: number;
    fmes: number;
    mcc: number;
    covered_issues: number;
    missed_issues: number;
    completeness: number;
    std_dev: number[];
  };
  /** Training set's results. */
  train: {
    tp: number;
    tn: number;
    fp: number;
    fn: number;
    accuracy: number;
    precision: number;
    recall: number;
    fmes: number;
    mcc: number;
    std_dev: number[];
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
