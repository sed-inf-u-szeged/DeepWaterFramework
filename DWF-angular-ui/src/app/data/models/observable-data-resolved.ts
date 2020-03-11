import { Observable } from 'rxjs';
import { DataResolved } from '@app/data/models/data-resolved';

export interface ObservableDataResolved<T> {
  readonly resolved: DataResolved<T>;
  readonly observable: Observable<DataResolved<T>>;
}
