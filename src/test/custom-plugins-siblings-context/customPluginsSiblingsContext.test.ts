import { getInput, getOutput } from "../helpers";
import { expect, test } from 'vitest'
import { TagPlugin, PluginContext, TemplateDX, stringify } from "../../index";
import { parse } from "../../ast-utils";
import { Node } from "mdast";

class PluginAPlugin extends TagPlugin {
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

class PluginBPlugin extends TagPlugin {
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
          value: `Shared value should not be accessible:${sharedValue || ''}`,
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

test('siblings should not share context', async () => {
  const input = getInput(__dirname);
  const tree = parse(input);
  
  // Create TemplateDX instance and register the plugins
  const templatedx = new TemplateDX();
  templatedx.registerTagPlugin(new PluginAPlugin(), ['PluginA']);
  templatedx.registerTagPlugin(new PluginBPlugin(), ['PluginB']);
  
  const processed = await templatedx.transform(tree);
  const compiled = stringify(processed);
  const output = getOutput(__dirname);
  expect(compiled).toEqual(output);
});