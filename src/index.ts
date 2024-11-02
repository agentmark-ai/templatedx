import { transformTree } from "./transformer";
import { bundleMDX } from "./bundler";
import {
  compressAst,
  stringify,
  parse,
  getFrontMatter,
} from "./ast-utils";
import { ElementPluginRegistry } from "./element-plugin-registry";
import { ElementPlugin, PluginContext } from "./element-plugin";
import { FilterRegistry } from "./filter-registry";
import type { FilterFunction } from "./filter-registry";
import type { ContentLoader } from "./types";
import type { Root } from "mdast";
import './register-builtin-plugins';

export type {
  ContentLoader,
  Root as Ast,
  PluginContext,
  FilterFunction,
};
export {
  parse,
  stringify,
  bundleMDX,
  getFrontMatter,
  compressAst,
  transformTree,
  ElementPluginRegistry,
  ElementPlugin,
  FilterRegistry
};