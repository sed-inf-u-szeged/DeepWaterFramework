/** Represents a simple string or numeric value inside tables. */
export class SimpleCell {
  /** The cell's value as string. */
  readonly valueString: string;
  /** Value used to order `SimpleCell`s. */
  readonly sortingValue: number | string;

  /**
   * Constructs a new `SimpleCell`.
   * @param value Value of the cell.
   */
  constructor(value: number | string) {
    const valueAsNumber = Number(value);
    this.sortingValue = isNaN(valueAsNumber) ? value : valueAsNumber;
    this.valueString = value.toString();
  }

  /**
   * Gives back the string representation of the cell.
   * @returns The string representation.
   */
  toString(): string {
    return this.valueString;
  }
}
