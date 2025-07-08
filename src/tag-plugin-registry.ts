import { TagPlugin } from './tag-plugin';

export class TagPluginRegistry {
  private plugins: Map<string, TagPlugin> = new Map();

  register(plugin: TagPlugin, names: string[]): void {
    names.forEach((name) => {
      this.plugins.set(name, plugin);
    });
  }

  get(name: string): TagPlugin | undefined {
    return this.plugins.get(name);
  }

  getAll(): Map<string, TagPlugin> {
    return new Map(this.plugins);
  }

  remove(name: string): void {
    this.plugins.delete(name);
  }

  removeAll(): void {
    this.plugins.clear();
  }
}