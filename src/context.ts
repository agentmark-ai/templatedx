export class Context {
  private variables: Record<string, any>;
  private parent?: Context;

  constructor(variables: Record<string, any> = {}, parent?: Context) {
    this.variables = variables;
    this.parent = parent;
  }

  get(key: string): any {
    if (key in this.variables) {
      return this.variables[key];
    } else if (this.parent) {
      return this.parent.get(key);
    } else {
      throw new Error(`Variable "${key}" is not defined in the context.`);
    }
  }

  createChild(variables: Record<string, any> = {}): Context {
    return new Context(variables, this);
  }
}
