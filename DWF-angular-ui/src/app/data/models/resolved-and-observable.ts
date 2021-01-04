import { Observable } from 'rxjs';
import { ResolvedData } from '@app/data/models/resolved-data';

/** Holds the resolved data and it's observable query to reuse. */
export interface ResolvedAndObservable<T> {
  /** The resolved data. */
  readonly resolved: ResolvedData<T>;
  /** Query observable of resolved data. */
  readonly observable: Observable<ResolvedData<T>>;
}
