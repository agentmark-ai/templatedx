import { getInput, getOutput } from "../helpers";
import { expect, test } from 'vitest'
import { stringifyMDX, parseMDX, transformTree } from "../../index";


test('handles filters', async () => {
  const input = getInput(__dirname);
  const tree = parseMDX(input);
  const props = { obj: { a: 'b', c: [1, 2, 3]}}
  const processed = await transformTree(tree, props);
  const compiled = stringifyMDX(processed);
  const output = getOutput(__dirname);
  expect(compiled).toEqual(output);
});