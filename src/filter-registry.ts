export type FilterFunction<Input = any, Output = any, Args extends any[] = any[]> = (
  input: Input,
  ...args: Args
) => Output;

export class FilterRegistry {
  private filters: Map<string, FilterFunction> = new Map();

  register(name: string, filterFunction: FilterFunction): void {
    this.filters.set(name, filterFunction);
  }

  get(name: string): FilterFunction | undefined {
    return this.filters.get(name);
  }

  getAll(): Map<string, FilterFunction> {
    return new Map(this.filters);
  }

  remove(name: string): void {
    this.filters.delete(name);
  }

  removeAll(): void {
    this.filters.clear();
  }
}
