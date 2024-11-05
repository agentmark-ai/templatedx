import { ComponentPlugin } from './component-plugin';

export class ComponentPluginRegistry {
  private static plugins: Map<string, ComponentPlugin> = new Map();

  static register(plugin: ComponentPlugin, names: string[]): void {
    names.forEach((name) => {
      this.plugins.set(name, plugin);
    });
  }

  static get(name: string): ComponentPlugin | undefined {
    return this.plugins.get(name);
  }

  static getAll(): Map<string, ComponentPlugin> {
    return new Map(this.plugins);
  }

  static remove(name: string): void {
    this.plugins.delete(name);
  }

  static removeAll(): void {
    this.plugins.clear();
  }
}