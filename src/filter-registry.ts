export type FilterFunction = (input: any, ...args: any[]) => any;

export class FilterRegistry {
  private static filters: Map<string, FilterFunction> = new Map();

  public static register(name: string, filter: FilterFunction) {
    this.filters.set(name, filter);
  }

  public static get(name: string): FilterFunction | undefined {
    return this.filters.get(name);
  }

  public static remove(name: string) {
    this.filters.delete(name);
  }

  public static clear() {
    this.filters.clear();
  }
}
