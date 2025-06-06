import { getInput, getOutput } from "../helpers";
import { expect, test } from 'vitest'
import { stringify, parse, transform } from "../../index";
import { ContentLoader } from "../../index";
import fs from 'fs';

const props = {
  definedVar: 'defined',
  undefinedVar: undefined,
};

test('maps over arrays', async () => {
  const input = getInput(__dirname);
  const loader: ContentLoader = async path => fs.readFileSync(path, 'utf-8');
  const tree = await parse(input, __dirname, loader);
  const processed = await transform(tree, props);
  const compiled = stringify(processed);
  const output = getOutput(__dirname);
  expect(compiled).toEqual(output);
});