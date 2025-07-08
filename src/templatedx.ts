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
import type { BaseMDXProvidedComponents } from './types';

// Import builtin plugins
import { ForEachPlugin, Tags as ForEachTags } from './tag-plugins/for-each';
import { ConditionalPlugin, Tags as ConditionalTags } from './tag-plugins/conditional';
import { RawPlugin, Tags as RawTags } from './tag-plugins/raw';
import {
  capitalize,
  upper,
  lower,
  truncate,
  abs,
  join,
  round,
  replace,
  urlencode,
  dump,
} from "./filter-plugins";

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

export class TemplateDX {
  private tagPluginRegistry: TagPluginRegistry;
  private filterRegistry: FilterRegistry;

  constructor() {
    this.tagPluginRegistry = new TagPluginRegistry();
    this.filterRegistry = new FilterRegistry();
    
    // Register builtin plugins by default
    this.registerBuiltinPlugins();
  }

  private registerBuiltinPlugins(): void {
    // Register tag plugins
    this.tagPluginRegistry.register(new ForEachPlugin(), ForEachTags);
    this.tagPluginRegistry.register(new ConditionalPlugin(), ConditionalTags);
    this.tagPluginRegistry.register(new RawPlugin(), RawTags);

    // Register filter functions
    this.filterRegistry.register("capitalize", capitalize);
    this.filterRegistry.register("upper", upper);
    this.filterRegistry.register("lower", lower);
    this.filterRegistry.register("truncate", truncate);
    this.filterRegistry.register("abs", abs);
    this.filterRegistry.register("join", join);
    this.filterRegistry.register("round", round);
    this.filterRegistry.register("replace", replace);
    this.filterRegistry.register("urlencode", urlencode);
    this.filterRegistry.register("dump", dump);
  }

  // Tag plugin methods
  registerTagPlugin(plugin: TagPlugin, names: string[]): void {
    this.tagPluginRegistry.register(plugin, names);
  }

  removeTagPlugin(name: string): void {
    this.tagPluginRegistry.remove(name);
  }

  getTagPlugin(name: string): TagPlugin | undefined {
    return this.tagPluginRegistry.get(name);
  }

  getAllTagPlugins(): Map<string, TagPlugin> {
    return this.tagPluginRegistry.getAll();
  }

  clearTagPlugins(): void {
    this.tagPluginRegistry.removeAll();
  }

  // Filter function methods
  registerFilter(name: string, filterFunction: FilterFunction): void {
    this.filterRegistry.register(name, filterFunction);
  }

  removeFilter(name: string): void {
    this.filterRegistry.remove(name);
  }

  getFilter(name: string): FilterFunction | undefined {
    return this.filterRegistry.get(name);
  }

  getAllFilters(): Map<string, FilterFunction> {
    return this.filterRegistry.getAll();
  }

  clearFilters(): void {
    this.filterRegistry.removeAll();
  }

  // Core template processing methods
  async transform(
    tree: Root,
    props: Record<string, any> = {},
    shared: Record<string, any> = {},
  ): Promise<Root> {
    return transformTree(tree, props, shared, this.tagPluginRegistry, this.filterRegistry);
  }

  async parse(
    mdxContent: string,
    baseDir: string,
    contentLoader: ContentLoader
  ): Promise<Root> {
    return bundle(mdxContent, baseDir, contentLoader, this.tagPluginRegistry);
  }

  async load(path: string): Promise<Root> {
    const file = await readFile(path);
    const componentLoader = async (path: string) => readFile(path);
    return this.parse(file, getDirname(path), componentLoader);
  }

  // Static utility methods that don't depend on instance state
  static stringify = stringify;
  static getFrontMatter = getFrontMatter;
  static compressAst = compressAst;
}

// Create a default instance for backwards compatibility functions
export const defaultTemplateDX = new TemplateDX();

// Backwards compatibility exports (using default instance)
export const transform = (
  tree: Root,
  props: Record<string, any> = {},
  shared: Record<string, any> = {},
): Promise<Root> => defaultTemplateDX.transform(tree, props, shared);

export const parse = (
  mdxContent: string,
  baseDir: string,
  contentLoader: ContentLoader
): Promise<Root> => defaultTemplateDX.parse(mdxContent, baseDir, contentLoader);

export const load = (path: string): Promise<Root> => defaultTemplateDX.load(path);

// Export types and classes
export type {
  ContentLoader,
  Root as Ast,
  PluginContext,
  FilterFunction,
  BaseMDXProvidedComponents
};

export {
  stringify,
  getFrontMatter,
  compressAst,
  TagPlugin,
  TagPluginRegistry,
  FilterRegistry
};