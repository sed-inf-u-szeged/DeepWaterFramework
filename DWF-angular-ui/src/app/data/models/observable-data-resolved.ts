import { Observable } from 'rxjs';
import { DataResolved } from '@app/data/models/data-resolved';

/** Holds the resolved data and it's observable query to reuse. */
export interface ObservableDataResolved<T> {
  /** The resolved data. */
  readonly resolved: DataResolved<T>;
  /** Query observable of resolved data. */
  readonly observable: Observable<DataResolved<T>>;
}
