import { getInput, getOutput } from "../helpers";
import { expect, test } from 'vitest'
import { parseMDX, PluginHandler, stringifyMDX, registerPlugin, transformTree } from "../../index";

const PluginA: PluginHandler = async (_props, children, pluginAPI) => {
  const { createChildContext, createNodeTransformer } = pluginAPI;
  const pluginANode = {
    type: 'paragraph',
    children: [
      {
        type: 'text',
        value: 'PluginA has set the shared value.',
      },
    ],
  };

  const processedChildren = await Promise.all(
    children.map(async (child) => await createNodeTransformer(createChildContext({ sharedValue: 'test' }))
      .transformNode(child))
  );

  return [pluginANode, ...processedChildren.flat()];
};
const PluginB: PluginHandler = async (props, children, pluginAPI) => {
  const { createNodeTransformer, readContextValue, createChildContext } = pluginAPI;
  const sharedValue = readContextValue('sharedValue');
  const pluginANode = {
    type: 'paragraph',
    children: [
      {
        type: 'text',
        value: `Shared value should not be accessible: ${sharedValue}`,
      },
    ],
  };

  const processedChildren = await Promise.all(
    children.map(async (child) => await createNodeTransformer(createChildContext({}))
      .transformNode(child))
  );

  return [pluginANode, ...processedChildren.flat()];
};

registerPlugin('PluginA', PluginA);
registerPlugin('PluginB', PluginB);

test('sublings should not share context', async () => {
  const input = getInput(__dirname);
  const tree = parseMDX(input);
  const transformFn = async () => await transformTree(tree);
  expect(transformFn).rejects.toThrowError();
});