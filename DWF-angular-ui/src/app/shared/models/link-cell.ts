export class LinkCell {
  readonly value: string;
  readonly linkUrl: string;
  readonly state?: { [key: string]: any };

  constructor(value: string, linkUrl: string, state?: { [key: string]: any }) {
    this.value = value;
    this.linkUrl = linkUrl;
    this.state = state;
  }

  toString() {
    return this.value;
  }
}
