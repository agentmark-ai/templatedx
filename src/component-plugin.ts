import { Node } from 'mdast';
import { Scope } from './scope';
import { NODE_TYPES } from './constants';

export interface NodeHelpers {
  isMdxJsxElement(node: Node): boolean;
  isMdxJsxFlowElement(node: Node): boolean;
  isMdxJsxTextElement(node: Node): boolean;
  isParentNode(node: Node): boolean;
  toMarkdown(node: Node): string;
  hasFunctionBody(node: Node): boolean;
  getFunctionBody(node: Node): { body: Node[]; argumentNames: string[] };
  NODE_TYPES: typeof NODE_TYPES;
}

export interface PluginContext {
  nodeHelpers: NodeHelpers;
  createNodeTransformer: (scope: Scope) => any;
  scope: Scope;
  componentName: string;
}

export abstract class ComponentPlugin<Props = Record<string, any>> {
  abstract transform(
    props: Props,
    children: Node[],
    context: PluginContext
  ): Promise<Node[] | Node>;
}
