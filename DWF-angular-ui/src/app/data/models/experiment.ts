import { AssembleConfig } from './assemble_config';
import { LearnConfig } from './learn_config';
import { Result } from './result';
import { Object } from 'ts-toolbelt';

export interface Experiment {
  readonly name: string;
  readonly markdown: string;
  readonly tasks: {
    readonly [hash: string]: Task;
  };
  readonly created_ts: string;
}

export interface Task {
  readonly assemble_config: AssembleConfig;
  readonly learn_config: LearnConfig;
  readonly assemble_result: string;
  readonly learn_result: Result | null;
  readonly created_ts: string;
}

export type PartailExperiment = Object.Optional<Experiment, keyof Experiment, 'deep'>;
export type HashWithTask = [string, Task];
export type OnlyTasks = Pick<Experiment, 'tasks'>;
