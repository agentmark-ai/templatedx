import { getInput, getOutput } from "../helpers";
import { expect, test } from 'vitest'
import { stringify, parse, ContentLoader } from "../../index";
import fs from 'fs';

const props = {
  items: [1, 2, 3]
};

test('ForEach bundles components with static props correctly', async () => {
  const input = getInput(__dirname);
  const loader: ContentLoader = async path => fs.readFileSync(path, 'utf-8');
  const tree = await parse(input, __dirname, loader, props);
  const compiled = stringify(tree);
  const output = getOutput(__dirname);
  expect(compiled).toEqual(output);
});