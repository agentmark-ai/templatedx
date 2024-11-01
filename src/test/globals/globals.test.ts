import { getInput, getOutput } from "../helpers";
import { expect, test } from 'vitest'
import { getFrontMatter, parseMDX, ElementPlugin, PluginContext, transformTree, stringifyMDX, ElementPluginRegistry } from "../../index";
import { Node, Root } from 'mdast';
import { mdxToMarkdown } from "mdast-util-mdx";
import { toMarkdown, Options } from 'mdast-util-to-markdown';

type ExtractedField = {
  name: string;
  content: string;
}

type SharedContext = {
  extractedText?: Array<ExtractedField>;
  sharedVal: string;
}


class ExtractTextPlugin extends ElementPlugin {
  serializeNodesToText(nodes: Node[]): string {
    const rootNode: Root = {
      type: 'root',
      // @ts-ignore
      children: nodes,
    };
    const options: Options = {
      extensions: [mdxToMarkdown()],
    };
    const textContent = toMarkdown(rootNode, options);
    return textContent;
  }

  async transform(
    _props: Record<string, any>,
    children: Node[],
    pluginContext: PluginContext
  ): Promise<Node[] | Node> {
    const { scope, elementName, createNodeTransformer } = pluginContext;

    if (!elementName) {
      throw new Error('elementName must be provided in pluginContext');
    }

    const childScope = scope.createChild();
    const transformer = createNodeTransformer(childScope);
    const processedChildren = await Promise.all(
      children.map(async (child) => {
        const result = await transformer.transformNode(child);
        return Array.isArray(result) ? result : [result];
      })
    );
    const flattenedChildren = processedChildren.flat();
    const extractedText = this.serializeNodesToText(flattenedChildren);
    let collectedData = scope.getShared('extractedText');
    if (!collectedData) {
      collectedData = [];
      scope.setShared('extractedText', collectedData);
    }
    collectedData.push({
      name: elementName,
      content: extractedText.trim(),
    });
    return [];
  }
}

ElementPluginRegistry.register(new ExtractTextPlugin(), ['Input', 'Other']);

test('testing globals, and that plugins can access/manipulate globals', async () => {
  const input = getInput(__dirname);
  const ast = parseMDX(input);
  const frontMatter = getFrontMatter(ast);
  const shared: SharedContext = { sharedVal: 'hello shared' };
  const props = { text: 'hello', arr: ['a', 'b', 'c'] };
  const processed = await transformTree(ast, props, shared);
  const compiled = stringifyMDX(processed);
  const output = getOutput(__dirname);
  expect(compiled).toEqual(output);
  // We're using a plugin to extract fields here, instead of rendering them
  expect(shared.extractedText).toEqual([
    { name: 'Input', content: 'This is the input text1 hello' },
    { name: 'Other', content: 'This is the other text with shared val: hello shared' },
    { name: 'Input', content: 'This is the input text2' },
    { name: 'Other', content: 'Mapped: a' },
    { name: 'Other', content: 'Mapped: b' },
    { name: 'Other', content: 'Mapped: c' },
  ]);
  expect(frontMatter).toEqual({
    name: "jim",
    company: "toyota",
    address: {
      street: "1 blueberry lane",
      zipcode: '010101',
    },
  })
});