import { Node, Root } from "mdast";
import { ComponentPlugin, PluginContext } from "../component-plugin";

export interface RawProps {
  children: any;
}

export const Tags = ['Raw'];

export class RawPlugin extends ComponentPlugin {
  async transform(
    _props: Record<string, any>,
    children: Node[],
    context: PluginContext
  ): Promise<Node[] | Node> {
    const { nodeHelpers } = context;
    const rawContent = nodeHelpers.toMarkdown({
        type: 'root',
        children: children,
    } as Root);
    return [
      {
        type: 'text',
        value: rawContent,
      } as Node,
    ];
  }
}