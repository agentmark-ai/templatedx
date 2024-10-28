import { ElementPlugin } from "./element-plugin";

export class ElementPluginRegistry {
  public static plugins: Map<string, ElementPlugin> = new Map<
    string,
    ElementPlugin
  >();

  public static register(
    modelPlugin: ElementPlugin,
    ids: string[]
  ) {
    for (const id of ids) {
      this.plugins.set(id, modelPlugin);
    }
  }

  public static getPlugin(id: string) {
    return this.plugins.get(id);
  }

  public static removePlugin(id: string) {
    this.plugins.delete(id);
  }

  public static clearRegistry() {
    this.plugins.clear();
  }
}