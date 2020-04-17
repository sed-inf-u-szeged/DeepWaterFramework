import { Task } from '@app/data/models/experiment';

export type LearnTaskConfig = keyof Pick<Task, 'assemble_config' | 'learn_config'>;
