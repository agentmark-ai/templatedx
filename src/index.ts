import { transformTree } from "./transformer";
import { bundle } from "./bundler";
import {
  compressAst,
  stringify,
  parse,
  getFrontMatter,
} from "./ast-utils";
import { ComponentPluginRegistry } from "./component-plugin-registry";
import { ComponentPlugin, PluginContext } from "./component-plugin";
import { FilterRegistry } from "./filter-registry";
import type { FilterFunction } from "./filter-registry";
import type { ContentLoader } from "./types";
import type { Root } from "mdast";
import type TemplateDX from './types/global';
import './register-builtin-plugins';

export type {
  ContentLoader,
  Root as Ast,
  PluginContext,
  FilterFunction,
  TemplateDX
};
export {
  parse,
  stringify,
  bundle,
  getFrontMatter,
  compressAst,
  transformTree,
  ComponentPluginRegistry,
  ComponentPlugin,
  FilterRegistry
};