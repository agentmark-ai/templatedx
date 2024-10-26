import { Node } from "mdast";
import { NODE_TYPES } from './constants';
import type { Context } from "./context";

interface NodeTypeHelpers {
  isMdxJsxElement(node: Node): boolean;
  isMdxJsxFlowElement(node: Node): boolean;
  isMdxJsxTextElement(node: Node): boolean;
  isParentNode(node: Node): boolean;
  NODE_TYPES: typeof NODE_TYPES;
}

export interface PluginAPI {
  nodeTypeHelpers: NodeTypeHelpers;
  createNodeTransformer: (context: any) => any;
  readContextValue: (key: string) => any;
  createChildContext: (variables: Record<string, any>) => Context;
}

export interface PluginHandler {
  (props: Record<string, any>, children: Node[], pluginAPI: PluginAPI): Promise<Node | Node[]>;
}

export const pluginRegistry: Record<string, PluginHandler> = {};

export const registerPlugin = (componentName: string, handler: PluginHandler) => {
  if (!pluginRegistry[componentName]) {
    pluginRegistry[componentName] = handler;
  } else {
    throw new Error(`Plugin: ${componentName} already exists`);
  }
};

export const removePlugin = (componentName: string) => {
  if (pluginRegistry[componentName]) {
    delete pluginRegistry[componentName];
  } else {
    throw new Error(`Plugin: ${componentName} does not exist`);
  }
};