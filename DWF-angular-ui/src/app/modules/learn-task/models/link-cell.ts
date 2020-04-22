import { Cell } from './cell';

/** Represents a link inside tables. */
export class LinkCell implements Cell {
  /** Name for the link. */
  readonly name: string;
  /** Url for the link. */
  readonly linkUrl: string;
  /**
   * State value that can be persisted to the browser's History.state property.
   * @see https://developer.mozilla.org/en-US/docs/Web/API/History#Properties
   */
  readonly state?: { [key: string]: any };
  /** Value used to order `LinkCell`s. */
  readonly sortingValue: string;

  /**
   * Constructs a new `LinkCell`.
   * @param name Name for the link.
   * @param linkUrl Url for the link.
   * @param state State value that can be persisted to the browser's History.state property.
   */
  constructor(name: string, linkUrl: string, state?: { [key: string]: any }) {
    this.name = name;
    this.linkUrl = linkUrl;
    this.state = state;
    this.sortingValue = name;
  }

  /**
   * Gives back the link's name.
   * @returns The link's name.
   */
  toString(): string {
    return this.name;
  }
}
