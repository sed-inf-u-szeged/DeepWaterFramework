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

export enum StdDevIndex {
  tp,
  tn,
  fp,
  fn,
  accuracy,
  precision,
  recall,
  fmes,
  mcc,
  covered_issues,
  missed_issues,
  completeness,
}
