import { getInput } from "../helpers";
import { expect, test } from 'vitest'
import { getFrontMatter, parse, ElementPlugin, PluginContext, transformTree, ElementPluginRegistry } from "../../index";
import { Node } from 'mdast';

type ExtractedField = {
  name: string;
  content: string;
}

type SharedContext = {
  extractedText?: Array<ExtractedField>;
  sharedVal: string;
}


class ExtractTextPlugin extends ElementPlugin {
  async transform(
    _props: Record<string, any>,
    children: Node[],
    pluginContext: PluginContext
  ): Promise<Node[] | Node> {
    const { scope, elementName, createNodeTransformer, nodeHelpers } = pluginContext;

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
    const extractedText = nodeHelpers.toMarkdown({
      type: 'root',
      children: flattenedChildren
    });
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
  const ast = parse(input);
  const frontMatter = getFrontMatter(ast);
  const shared: SharedContext = { sharedVal: 'hello shared' };
  const props = { text: 'hello', arr: ['a', 'b', 'c'] };
  await transformTree(ast, props, shared);
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