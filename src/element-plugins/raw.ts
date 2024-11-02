import { Node, Root } from "mdast";
import { ElementPlugin, PluginContext } from "../element-plugin";

export class RawPlugin extends ElementPlugin {
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