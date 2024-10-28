export class Scope {
  private variables: Record<string, any>;
  private parent?: Scope;

  constructor(variables: Record<string, any> = {}, parent?: Scope) {
    this.variables = variables;
    this.parent = parent;
  }

  // Retrieves a variable, searching the current scope and parents
  get(key: string): any {
    if (key in this.variables) {
      return this.variables[key];
    } else if (this.parent) {
      return this.parent.get(key);
    } else {
      return undefined;
    }
  }

  // Retrieves a variable only from the current scope
  getLocal(key: string): any {
    return this.variables[key];
  }

  // Sets a variable in the current scope
  setLocal(key: string, value: any): void {
    this.variables[key] = value;
  }

  // Creates a new child scope
  createChild(variables: Record<string, any> = {}): Scope {
    return new Scope(variables, this);
  }
}
