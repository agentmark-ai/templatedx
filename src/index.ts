import {
  transformTree,
  extractFields
} from "./transformer";
import { bundleMDX } from "./bundler";
import {
  compressAst,
  stringifyMDX,
  parseMDX,
  getFrontMatter,
} from "./astUtils";
import { registerPlugin } from "./pluginRegistry";
import type { PluginHandler } from "./pluginRegistry";
import type { ExtractedField } from "./extractFieldsPlugin";
import type { ContentLoader } from "./types";
import type { Root } from "mdast";
import './defaultPlugins';

export type {
  ContentLoader,
  Root as Ast,
  ExtractedField,
  PluginHandler
};
export {
  parseMDX,
  stringifyMDX,
  bundleMDX,
  getFrontMatter,
  extractFields,
  compressAst,
  transformTree,
  registerPlugin
};