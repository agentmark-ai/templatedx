import { Node, Root } from "mdast";
import { ElementPlugin } from "../element-plugin";
import { toMarkdown, Options } from "mdast-util-to-markdown";
import { mdxToMarkdown } from "mdast-util-mdx";

export class RawPlugin extends ElementPlugin {
  async transform(
    _props: Record<string, any>,
    children: Node[],
  ): Promise<Node[] | Node> {
    const toMarkdownOptions: Options = {
      extensions: [mdxToMarkdown()],
    };
    const rawContent = toMarkdown(
      {
        type: 'root',
        children: children,
      } as Root,
      toMarkdownOptions
    );
    return [
      {
        type: 'text',
        value: rawContent,
      } as Node,
    ];
  }
}