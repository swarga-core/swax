export default class Counter {
  constructor(count: number = 0, tag: string | null = null) {
    this.count = count;
    this.tag = tag;
  }
  public count: number;
  public tag: string | null;
}
