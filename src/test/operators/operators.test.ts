import { getInput, getOutput } from "../helpers";
import { expect, test } from 'vitest'
import { stringifyMDX, parseMDX, transformTree } from "../../index";

const props = {
  num4: 4,
  num3: 3,
  num5: 5,
  a: true,
  b: false
};

test('input matches output for operators', async () => {
  const input = getInput(__dirname);
  const tree = parseMDX(input);
  const processed = await transformTree(tree, props);
  const compiled = stringifyMDX(processed);
  const output = getOutput(__dirname);
  expect(compiled).toEqual(output);
});