import { transformTree } from "./transformer";
import { bundle } from "./bundler";
import {
  compressAst,
  stringify,
  getFrontMatter,
} from "./ast-utils";
import { TagPluginRegistry } from "./tag-plugin-registry";
import { TagPlugin, PluginContext } from "./tag-plugin";
import { FilterRegistry } from "./filter-registry";
import type { FilterFunction } from "./filter-registry";
import type { ContentLoader } from "./types";
import type { Root } from "mdast";
import { getDirname } from "./utils";
import './global.d';

const readFile = async (path: string) => {
  // @ts-ignore
  if (typeof Deno !== 'undefined') {
    // @ts-ignore
    return await Deno.readTextFile(path);
  } else if (typeof require !== 'undefined') {
    const { readFile } = await import('fs/promises');
    return await readFile(path, 'utf8');
  } else {
    throw new Error('Unsupported environment');
  }
};

export class TemplatedX {
  private tagPluginRegistry: TagPluginRegistry;
  private filterRegistry: FilterRegistry;

  constructor() {
    this.tagPluginRegistry = new TagPluginRegistry();
    this.filterRegistry = new FilterRegistry();
    
    // Copy built-in plugins and filters from static registries
    this.tagPluginRegistry.copyFromStatic();
    this.filterRegistry.copyFromStatic();
  }

  // Plugin management methods
  registerTagPlugin(plugin: TagPlugin, names: string[]): void {
    this.tagPluginRegistry.register(plugin, names);
  }

  registerFilter(name: string, filterFunction: FilterFunction): void {
    this.filterRegistry.register(name, filterFunction);
  }

  removeTagPlugin(name: string): void {
    this.tagPluginRegistry.remove(name);
  }

  removeFilter(name: string): void {
    this.filterRegistry.remove(name);
  }

  getTagPlugin(name: string): TagPlugin | undefined {
    return this.tagPluginRegistry.get(name);
  }

  getFilter(name: string): FilterFunction | undefined {
    return this.filterRegistry.get(name);
  }

  getAllTagPlugins(): Map<string, TagPlugin> {
    return this.tagPluginRegistry.getAll();
  }

  getAllFilters(): Map<string, FilterFunction> {
    return this.filterRegistry.getAll();
  }

  clearTagPlugins(): void {
    this.tagPluginRegistry.removeAll();
  }

  clearFilters(): void {
    this.filterRegistry.removeAll();
  }

  // Core transformation methods
  async parse(
    mdxContent: string,
    baseDir: string,
    contentLoader: ContentLoader
  ): Promise<Root> {
    const result = await bundle(mdxContent, baseDir, contentLoader);
    return result;
  }

  async transform(
    tree: Root,
    props: Record<string, any> = {},
    shared: Record<string, any> = {}
  ): Promise<Root> {
    return await transformTree(tree, props, shared, this.tagPluginRegistry, this.filterRegistry);
  }

  async load(path: string): Promise<Root> {
    const file = await readFile(path);
    const componentLoader = async (path: string) => readFile(path);
    return await this.parse(file, getDirname(path), componentLoader);
  }

  // Utility methods (delegated to static functions)
  stringify(tree: Root): string {
    return stringify(tree);
  }

  getFrontMatter(tree: Root): any {
    return getFrontMatter(tree);
  }

  compressAst(tree: Root): Root {
    compressAst(tree);
    return tree;
  }
}