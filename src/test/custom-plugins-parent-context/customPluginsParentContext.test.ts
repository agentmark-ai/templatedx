import { getInput, getOutput } from "../helpers";
import { expect, test } from 'vitest'
import { parseMDX, PluginHandler, stringifyMDX, registerPlugin, transformTree } from "../../index";

const PluginA: PluginHandler = async (_props, children, pluginAPI) => {
  const { nodeAPI, contextAPI } = pluginAPI;
  contextAPI.addContextProp('sharedValue', 'test');
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
    children.map(async (child) => await nodeAPI.transformNode(child))
  );

  return [pluginANode, ...processedChildren.flat()];
};
const PluginB: PluginHandler = async (props, children, pluginAPI) => {
  const { nodeAPI, contextAPI } = pluginAPI;
  const sharedValue = contextAPI.readContextProp('sharedValue');
  const pluginANode = {
    type: 'paragraph',
    children: [
      {
        type: 'text',
        value: `Shared value should be accessible: ${sharedValue}, Props should be accessible: ${props.var}`,
      },
    ],
  };

  const processedChildren = await Promise.all(
    children.map(async (child) => await nodeAPI.transformNode(child))
  );

  return [pluginANode, ...processedChildren.flat()];
};

registerPlugin('PluginA', PluginA);
registerPlugin('PluginB', PluginB);

test('parent-child should share context', async () => {
  const input = getInput(__dirname);
  const tree = parseMDX(input);
  const processed = await transformTree(tree);
  const compiled = stringifyMDX(processed);
  const output = getOutput(__dirname);
  expect(compiled).toEqual(output);
});