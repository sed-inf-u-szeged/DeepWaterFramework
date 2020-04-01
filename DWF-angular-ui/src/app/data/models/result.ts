export interface Result {
  dev: {
    covered_issues: number;
    missed_issues: number;
    fmes: number;
    precision: number;
    fn: number;
    accuracy: number;
    fp: number;
    completeness: number;
    mcc: number;
    std_dev: number[];
    recall: number;
    tn: number;
    tp: number;
  };
  test: {
    covered_issues: number;
    missed_issues: number;
    fmes: number;
    precision: number;
    fn: number;
    accuracy: number;
    fp: number;
    completeness: number;
    mcc: number;
    std_dev: number[];
    recall: number;
    tn: number;
    tp: number;
  };
  train: {
    fmes: number;
    std_dev: number[];
    precision: number;
    recall: number;
    fn: number;
    accuracy: number;
    tn: number;
    fp: number;
    tp: number;
    mcc: number;
  };
}

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
