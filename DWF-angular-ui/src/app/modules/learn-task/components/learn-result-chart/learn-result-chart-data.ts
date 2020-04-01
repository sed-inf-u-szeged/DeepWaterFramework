import { Task, HashWithTask } from '@app/data/models/experiment';

/** The input of {@link LearnResultChartComponent}. */
export interface LearnResultChartData<
  ResultType extends keyof NonNullable<Task['learn_result']> = keyof NonNullable<Task['learn_result']>
> {
  /** An array of tuples of the tasks and their hash in a [hash, task] format. */
  taskEntries: HashWithTask[];
  /** The result set name inside of the task's `Result`. */
  resultSet: ResultType;
  /** An array of result parameters of the picked set to display on the chart. */
  resultSetParams: Exclude<keyof NonNullable<Task['learn_result']>[ResultType], 'std_dev'>[];
}
