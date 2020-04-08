/** Holds data with optional error message. */
export interface DataResolved<T> {
  /** Data. */
  readonly data: T;
  /** Error message. */
  readonly error?: string;
}
