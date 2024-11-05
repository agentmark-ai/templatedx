import { getInput, getOutput } from "../helpers";
import { expect, test } from 'vitest'
import { parse, stringify, ComponentPluginRegistry, transformTree } from "../../index";
import { Node } from "mdast";
import { ComponentPlugin } from "../../index";
import type { PluginContext } from "../../index";

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

class FetchDataPlugin extends ComponentPlugin {
  async transform(
    _props: Record<string, any>,
    children: Node[],
    context: PluginContext
  ): Promise<Node[] | Node> {
    // Introduce a delay of 10 milliseconds
    await delay(10);

    const { createNodeTransformer, scope } = context;
    const childScope = scope.createChild({ data: 42 });

    const nodeTransformer = createNodeTransformer(childScope);
    const processedChildren = await Promise.all(
      children.map(async (child) => {
        const transformed = await nodeTransformer.transformNode(child);
        return Array.isArray(transformed) ? transformed : [transformed];
      })
    );

    return processedChildren.flat();
  }
}
ComponentPluginRegistry.register(new FetchDataPlugin(), ['FetchData']);

test('async plugins should work', async () => {
  const input = getInput(__dirname);
  const tree = parse(input);
  const processed = await transformTree(tree);
  const compiled = stringify(processed);
  const output = getOutput(__dirname);
  expect(compiled).toEqual(output);
});