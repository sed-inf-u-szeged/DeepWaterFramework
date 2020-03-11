export interface DataResolved<T> {
  readonly data: T;
  readonly error?: string;
}
