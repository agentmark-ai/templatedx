import { getInput, getOutput } from "../helpers";
import { expect, test } from 'vitest'
import { stringifyMDX, parseMDX, transformTree } from "../../index";

const props = {
  messageHistory: [
    {
      role: 'system',
      message: 'ignored'
    },
    {
      role: 'user',
      message: "What's 2 + 2?"
    },
    {
      role: 'assistant',
      message: '5',
    },
    {
      role: 'user',
      message: "What's 10 + 2?"
    },
    {
      role: 'assistant',
      message: '5'
    }
  ]
};

test('maps over arrays', async () => {
  const input = getInput(__dirname);
  const tree = parseMDX(input);
  const processed = await transformTree(tree, props);
  const compiled = stringifyMDX(processed);
  const output = getOutput(__dirname);
  expect(compiled).toEqual(output);
});