import { Node } from "mdast";
import type { Scope } from "./scope";
import { NODE_TYPES } from "./constants";

interface NodeTypeHelpers {
  isMdxJsxElement(node: Node): boolean;
  isMdxJsxFlowElement(node: Node): boolean;
  isMdxJsxTextElement(node: Node): boolean;
  isParentNode(node: Node): boolean;
  NODE_TYPES: typeof NODE_TYPES;
}

export interface PluginContext {
  nodeTypeHelpers: NodeTypeHelpers;
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
