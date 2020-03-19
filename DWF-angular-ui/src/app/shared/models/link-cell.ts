/**  Represents a link inside tables. */
export class LinkCell {
  /** Name for the link. */
  readonly value: string;
  /** Url for the link. */
  readonly linkUrl: string;
  /**
   * State value that can be persisted to the browser's History.state property.
   * @see https://developer.mozilla.org/en-US/docs/Web/API/History#Properties
   */
  readonly state?: { [key: string]: any };

  /**
   * Constructs a new `LinkCell`.
   * @param value Name for the link.
   * @param linkUrl Url for the link.
   * @param state State value that can be persisted to the browser's History.state property.
   */
  constructor(value: string, linkUrl: string, state?: { [key: string]: any }) {
    this.value = value;
    this.linkUrl = linkUrl;
    this.state = state;
  }

  /**
   * Gives back the link's name.
   * @returns The link's name.
   */
  toString(): string {
    return this.value;
  }
}
