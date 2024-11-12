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
import type { BaseMDXProvidedComponents } from './types';
import './global.d';
import './register-builtin-plugins';

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
  transformTree as transform,
  TagPluginRegistry,
  TagPlugin,
  FilterRegistry
};