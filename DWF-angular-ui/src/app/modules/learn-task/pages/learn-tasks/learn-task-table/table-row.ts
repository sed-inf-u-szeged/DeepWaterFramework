import { Task } from '@app/data/models/experiment';
import { LinkCell } from '@app/shared/models/link-cell';
import { ValueCell } from '@app/shared/models/value-cell';

export interface LinkCells {
  Preset: LinkCell;
  Algorithm: LinkCell;
}

export interface ValueCells {
  'Train-Prec': ValueCell;
  'Train-Recall': ValueCell;
  'Train-F': ValueCell;
  'Dev-Prec': ValueCell;
  'Dev-Recall': ValueCell;
  'Dev-F': ValueCell;
  'Test-Prec': ValueCell;
  'Test-Recall': ValueCell;
  'Test-F': ValueCell;
}

export interface TableRow extends ValueCells, LinkCells {
  hash: string;
  shortHash: string;
  parameters: {
    features: Task['assemble_config']['strategy_parameters'] & Task['assemble_config']['shared_parameters'];
    learning: Task['learn_config']['strategy_parameters'] & Task['learn_config']['shared_parameters'];
  };
}
