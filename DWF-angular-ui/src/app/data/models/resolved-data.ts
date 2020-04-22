/** Holds data with optional error message. */
export interface ResolvedData<T> {
  /** Data. */
  readonly data: T;
  /** Error message. */
  readonly error?: string;
}
