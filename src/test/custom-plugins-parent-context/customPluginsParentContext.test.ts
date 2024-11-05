import { getInput, getOutput } from "../helpers";
import { expect, test } from 'vitest'
import { parse, stringify, transformTree, ComponentPlugin, PluginContext, ComponentPluginRegistry } from "../../index";
import { Node } from "mdast";

class PluginAPlugin extends ComponentPlugin {
  async transform(
    _props: Record<string, any>,
    children: Node[],
    context: PluginContext
  ): Promise<Node[] | Node> {
    const { createNodeTransformer, scope } = context;
    const pluginANode = {
      type: "paragraph",
      children: [
        {
          type: "text",
          value: "PluginA has set the shared value.",
        },
      ],
    };
    const childScope = scope.createChild({ sharedValue: "test" });
    const nodeTransformer = createNodeTransformer(childScope);
    const processedChildren = await Promise.all(
      children.map(async (child) => {
        const transformed = await nodeTransformer.transformNode(child);
        return Array.isArray(transformed) ? transformed : [transformed];
      })
    );
    return [pluginANode, ...processedChildren.flat()];
  }
}

class PluginBPlugin extends ComponentPlugin {
  async transform(
    props: Record<string, any>,
    children: Node[],
    context: PluginContext
  ): Promise<Node[] | Node> {
    const { createNodeTransformer, scope } = context;
    const sharedValue = scope.get("sharedValue");
    const pluginBNode = {
      type: "paragraph",
      children: [
        {
          type: "text",
          value: `Shared value should be accessible: ${sharedValue}, Props should be accessible: ${props.var}`,
        },
      ],
    };
    const nodeTransformer = createNodeTransformer(scope);
    const processedChildren = await Promise.all(
      children.map(async (child) => {
        const transformed = await nodeTransformer.transformNode(child);
        return Array.isArray(transformed) ? transformed : [transformed];
      })
    );
    return [pluginBNode, ...processedChildren.flat()];
  }
}
ComponentPluginRegistry.register(new PluginAPlugin(), ['PluginA'])
ComponentPluginRegistry.register(new PluginBPlugin(), ['PluginB'])


test('parent-child should share context', async () => {
  const input = getInput(__dirname);
  const tree = parse(input);
  const processed = await transformTree(tree);
  const compiled = stringify(processed);
  const output = getOutput(__dirname);
  expect(compiled).toEqual(output);
});