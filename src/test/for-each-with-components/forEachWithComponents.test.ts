import { getInput, getOutput } from "../helpers";
import { expect, test } from 'vitest'
import { stringify, parseWithComponentSupport } from "../../index";
import { ContentLoader } from "../../index";
import fs from 'fs';

const props = {
  messageHistory: [
    { role: 'user', message: 'Hello there' },
    { role: 'assistant', message: 'Hi! How can I help you?' },
    { role: 'user', message: 'What\'s the weather like?' }
  ]
};

test('ForEach with function syntax bundles components properly', async () => {
  const input = getInput(__dirname);
  const loader: ContentLoader = async path => fs.readFileSync(path, 'utf-8');
  const tree = await parseWithComponentSupport(input, __dirname, loader, props);
  const compiled = stringify(tree);
  const output = getOutput(__dirname);
  expect(compiled).toEqual(output);
});