import { ValueCell } from '@app/shared/models/value-cell';
import { LinkCell } from '@app/shared/models/link-cell';

export interface LinkCells {
  hash: LinkCell;
  preset: LinkCell;
}

export interface ValueCells {
  'test-tp': ValueCell;
  'test-fp': ValueCell;
  'test-tn': ValueCell;
  'test-fn': ValueCell;
  'test-covered_issues': ValueCell;
  'test-missed_issues': ValueCell;
  'test-fmes': ValueCell;
  'test-precision': ValueCell;
  'test-accuracy': ValueCell;
  'test-completeness': ValueCell;
  'test-mcc': ValueCell;
  'test-recall': ValueCell;
}

export interface TableRow extends LinkCells, ValueCells {
  [key: string]: string | number | ValueCell | LinkCell;
}
