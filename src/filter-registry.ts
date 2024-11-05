export type FilterFunction<Input = any, Output = any, Args extends any[] = any[]> = (
  input: Input,
  ...args: Args
) => Output;

export class FilterRegistry {
  private static filters: Map<string, FilterFunction> = new Map();

  static register(name: string, filterFunction: FilterFunction): void {
    this.filters.set(name, filterFunction);
  }

  static get(name: string): FilterFunction | undefined {
    return this.filters.get(name);
  }

  static getAll(): Map<string, FilterFunction> {
    return new Map(this.filters);
  }

  static remove(name: string): void {
    this.filters.delete(name);
  }

  static removeAll(): void {
    this.filters.clear();
  }
}
