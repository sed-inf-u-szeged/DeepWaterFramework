import { Task, HashWithTask } from '@app/data/models/experiment';

/** The input of {@link LearnResultChartComponent}. */
export interface LearnResultChartData<
  ResultType extends keyof NonNullable<Task['learn_result']> = keyof NonNullable<Task['learn_result']>
> {
  /** An array of tuples of the tasks and their hash in a [hash, task] format. */
  taskEntries: HashWithTask[];
  /** The type inside of the task's `Result`. */
  resultType: ResultType;
  /** An array of result parameters of the picked type to display on the chart. */
  resultParams: Exclude<keyof NonNullable<Task['learn_result']>[ResultType], 'std_dev'>[];
}
