import { getInput, getOutput } from "../helpers";
import { expect, test } from 'vitest'
import { stringify, bundle, transformTree } from "../../index";
import { ContentLoader } from "../../index";
import fs from 'fs';


test('handles filters', async () => {
  const input = getInput(__dirname);
  const loader: ContentLoader = async path => fs.readFileSync(path, 'utf-8');
  const tree = await bundle(input, __dirname, loader);  const props = { obj: { a: 'b', c: [1, 2, 3]}}
  const processed = await transformTree(tree, props);
  const compiled = stringify(processed);
  const output = getOutput(__dirname);
  expect(compiled).toEqual(output);
});