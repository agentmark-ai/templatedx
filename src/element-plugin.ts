import { Node, Root } from "mdast";
import type { Scope } from "./scope";
import { NODE_TYPES } from "./constants";

interface NodeHelpers {
  isMdxJsxElement(node: Node): boolean;
  isMdxJsxFlowElement(node: Node): boolean;
  isMdxJsxTextElement(node: Node): boolean;
  isParentNode(node: Node): boolean;
  toMarkdown(node: Root): string;
  hasFunctionBody: (children: Node) => boolean;
  getFunctionBody: (children: Node) => { body: Node[], argumentNames: string[] };
  NODE_TYPES: typeof NODE_TYPES;
}

export interface PluginContext {
  nodeHelpers: NodeHelpers;
  createNodeTransformer: (scope: Scope) => any;
  scope: Scope;
  elementName: string;
}

export abstract class ElementPlugin {
  abstract transform(
    props: Record<string, any>,
    children: Node[],
    context: PluginContext,
  ): Promise<Node[] | Node>;
}
