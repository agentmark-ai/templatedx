import { getInput, getOutput } from "../helpers";
import { expect, test } from 'vitest'
import { stringify, bundle, transformTree } from "../../index";
import { ContentLoader } from "../../index";
import fs from 'fs';

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
  const loader: ContentLoader = async path => fs.readFileSync(path, 'utf-8');
  const tree = await bundle(input, __dirname, loader);
  const processed = await transformTree(tree, props);
  const compiled = stringify(processed);
  const output = getOutput(__dirname);
  expect(compiled).toEqual(output);
});