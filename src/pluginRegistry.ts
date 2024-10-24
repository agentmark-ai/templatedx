import { Node } from "mdast";
import { Context } from './types';
import { NODE_TYPES } from './constants';

interface NodeTypeHelpers {
  isMdxJsxElement(node: Node): boolean;
  isMdxJsxFlowElement(node: Node): boolean;
  isMdxJsxTextElement(node: Node): boolean;
  isParentNode(node: Node): boolean;
  NODE_TYPES: typeof NODE_TYPES;
}

interface ContextAPI {
  updateContextProp(prop: string, value: any): void;
  addContextProp(prop: string, value: any): void;
  readContextProp(prop: string): any;
}

interface NodeAPI {
  transformNode(node: Node): Promise<Node | Node[]>;
  evaluateProps(node: any): Record<string, any>;
  resolveExpression(expression: string, context: Context): any;
}

export interface PluginAPI {
  nodeAPI: NodeAPI;
  contextAPI: ContextAPI;
  nodeTypeHelpers: NodeTypeHelpers;
}
export interface PluginHandler {
  (props: Record<string, any>, children: Node[], pluginAPI: PluginAPI): Promise<Node | Node[]>;
}

export const pluginRegistry: Record<string, PluginHandler> = {};

export const registerPlugin = (componentName: string, handler: PluginHandler) => {
  pluginRegistry[componentName] = handler;
};

export const removePlugin = (componentName: string) => {
  delete pluginRegistry[componentName];
};