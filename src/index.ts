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
import './global.d';
import './register-builtin-plugins';


async function load (path: string) {
  const fs = await import('node:fs/promises');
  const file = await fs.readFile(path, 'utf8');
  const componentLoader = async (path: string) => fs.readFile(path, 'utf8');
  return bundle(file, getDirname(path), componentLoader);
}

export type {
  ContentLoader,
  Root as Ast,
  PluginContext,
  FilterFunction,
  BaseMDXProvidedComponents
};
export {
  stringify,
  bundle as parse,
  getFrontMatter,
  compressAst,
  load,
  transformTree as transform,
  TagPluginRegistry,
  TagPlugin,
  FilterRegistry
};