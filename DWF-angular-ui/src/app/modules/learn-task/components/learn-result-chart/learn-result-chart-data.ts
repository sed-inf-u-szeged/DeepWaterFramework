import { Task, HashWithTask } from '@app/data/models/experiment';

export interface LearnResultChartData<
  ResultType extends keyof NonNullable<Task['learn_result']> = keyof NonNullable<Task['learn_result']>
> {
  taskEntries: HashWithTask[];
  resultType: ResultType;
  resultParams: Exclude<keyof NonNullable<Task['learn_result']>[ResultType], 'std_dev'>[];
}
