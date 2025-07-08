export {
  TemplateDX,
  defaultTemplateDX,
  transform,
  parse,
  load,
  stringify,
  getFrontMatter,
  compressAst,
  TagPlugin,
  TagPluginRegistry,
  FilterRegistry
} from './templatedx';

export type {
  ContentLoader,
  PluginContext,
  FilterFunction,
  BaseMDXProvidedComponents
} from './templatedx';

export type { Root as Ast } from 'mdast';