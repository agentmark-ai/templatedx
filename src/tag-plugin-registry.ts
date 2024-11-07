import { TagPlugin } from './tag-plugin';

export class TagPluginRegistry {
  private static plugins: Map<string, TagPlugin> = new Map();

  static register(plugin: TagPlugin, names: string[]): void {
    names.forEach((name) => {
      this.plugins.set(name, plugin);
    });
  }

  static get(name: string): TagPlugin | undefined {
    return this.plugins.get(name);
  }

  static getAll(): Map<string, TagPlugin> {
    return new Map(this.plugins);
  }

  static remove(name: string): void {
    this.plugins.delete(name);
  }

  static removeAll(): void {
    this.plugins.clear();
  }
}