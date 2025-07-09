import { bundle } from "./bundler";
import { transformTree } from "./transformer";
import { TagPluginRegistry } from "./tag-plugin-registry";
import { FilterRegistry } from "./filter-registry";
import { TagPlugin } from "./tag-plugin";
import type { FilterFunction } from "./filter-registry";
import type { ContentLoader } from "./types";
import type { Root } from "mdast";
import {
  compressAst,
  stringify,
  getFrontMatter,
} from "./ast-utils";
import { getDirname } from "./utils";

// Built-in plugins
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
    this.registerBuiltinPlugins();
  }

  private registerBuiltinPlugins() {
    // Register built-in tag plugins
    this.tagPluginRegistry.register(new ForEachPlugin(), ForEachTags);
    this.tagPluginRegistry.register(new ConditionalPlugin(), ConditionalTags);
    this.tagPluginRegistry.register(new RawPlugin(), RawTags);

    // Register built-in filter functions
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

  // Plugin management methods
  registerTagPlugin(plugin: TagPlugin, names: string[]): void {
    this.tagPluginRegistry.register(plugin, names);
  }

  registerFilterFunction(name: string, filterFunction: FilterFunction): void {
    this.filterRegistry.register(name, filterFunction);
  }

  removeTagPlugin(name: string): void {
    this.tagPluginRegistry.remove(name);
  }

  removeFilterFunction(name: string): void {
    this.filterRegistry.remove(name);
  }

  getTagPlugin(name: string): TagPlugin | undefined {
    return this.tagPluginRegistry.get(name);
  }

  getFilterFunction(name: string): FilterFunction | undefined {
    return this.filterRegistry.get(name);
  }

  getAllTagPlugins(): Map<string, TagPlugin> {
    return this.tagPluginRegistry.getAll();
  }

  getAllFilterFunctions(): Map<string, FilterFunction> {
    return this.filterRegistry.getAll();
  }

  // Core template processing methods
  async parse(
    mdxContent: string,
    baseDir: string,
    contentLoader: ContentLoader
  ): Promise<Root> {
    return bundle(mdxContent, baseDir, contentLoader, this.tagPluginRegistry, this.filterRegistry);
  }

  async transform(
    tree: Root,
    props: Record<string, any> = {},
    shared: Record<string, any> = {}
  ): Promise<Root> {
    return transformTree(tree, props, shared, this.tagPluginRegistry, this.filterRegistry);
  }

  async load(path: string): Promise<Root> {
    const file = await readFile(path);
    const componentLoader = async (path: string) => readFile(path);
    return this.parse(file, getDirname(path), componentLoader);
  }

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