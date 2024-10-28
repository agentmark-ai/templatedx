export class Scope {
  private variables: Record<string, any>;
  private parent?: Scope;

  constructor(variables: Record<string, any> = {}, parent?: Scope) {
    this.variables = variables;
    this.parent = parent;
  }

  get(key: string): any {
    if (key in this.variables) {
      return this.variables[key];
    } else if (this.parent) {
      return this.parent.get(key);
    } else {
      return undefined;
    }
  }

  getLocal(key: string): any {
    return this.variables[key];
  }

  setLocal(key: string, value: any): void {
    this.variables[key] = value;
  }

  createChild(variables: Record<string, any> = {}): Scope {
    return new Scope(variables, this);
  }
}
