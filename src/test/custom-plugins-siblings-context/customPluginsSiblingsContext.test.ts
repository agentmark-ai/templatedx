import { getInput, getOutput } from "../helpers";
import { expect, test } from 'vitest'
import { parseMDX, PluginHandler, stringifyMDX, registerPlugin, transformTree } from "../../index";

const PluginA: PluginHandler = async (_props, _children, pluginAPI) => {
  const { createContext } = pluginAPI;
  createContext({ sharedValue: 'test' });
  const paragraph = {
    type: 'paragraph',
    children: [
      {
        type: 'text',
        value: 'PluginA has set the shared value.',
      },
    ],
  };
  return paragraph;
};
const PluginB: PluginHandler = async (_props, _children, pluginAPI) => {
  const { getContext } = pluginAPI;
  const context = getContext();
  const sharedValue = context.sharedValue;
  const paragraph = {
    type: 'paragraph',
    children: [
      {
        type: 'text',
        value: `Shared value should be empty:${sharedValue || ''}`,
      },
    ],
  };
  return paragraph;
};

registerPlugin('PluginA', PluginA);
registerPlugin('PluginB', PluginB);

test('siblings should not share context', async () => {
  const input = getInput(__dirname);
  const tree = parseMDX(input);
  const processed = await transformTree(tree);
  const compiled = stringifyMDX(processed);
  const output = getOutput(__dirname);
  expect(compiled).toEqual(output);
});