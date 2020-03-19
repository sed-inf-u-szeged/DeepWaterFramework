import { Experiment } from '@app/data/models/experiment';

/** Represents an `Experiment` in the ExperimentListComponent. */
export interface ExperimentListItem extends Pick<Experiment, 'name' | 'markdown'> {
  /** The hash part of the experiment's index. */
  indexHash: string;
  /** Number of its tasks. */
  numberOfTasks: number;
  /** The creation date. */
  created: Date;
}
