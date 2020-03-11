import { AssembleConfig } from './assemble_config';
import { LearnConfig } from './learn_config';
import { Result } from './result';
import { Object } from 'ts-toolbelt';

export interface Experiment {
  name: string;
  markdown: string;
  tasks: {
    [hash: string]: Task;
  };
  created_ts: string;
}

export interface Task {
  assemble_config: AssembleConfig;
  learn_config: LearnConfig;
  assemble_result: string;
  learn_result: Result | null;
  created_ts: string;
}

export type PartailExperiment = Object.Optional<Experiment, keyof Experiment, 'deep'>;
export type HashWithTask = [string, Task];
export type OnlyAssembleConfig = Object.P.Pick<Experiment, ['tasks', string, 'assemble_config']>;
export type OnlyTasks = Pick<Experiment, 'tasks'>;
