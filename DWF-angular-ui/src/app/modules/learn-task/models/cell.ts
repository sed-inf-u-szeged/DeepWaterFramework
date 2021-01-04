/** Interface for the cells used inside tables. */
export interface Cell {
  /** Value used for ordering. */
  sortingValue: string | number;
  /**
   * Gets the string representation of the cell.
   * @returns The string representation.
   */
  toString(): string;
}
