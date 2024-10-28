import { getInput, getOutput } from "../helpers";
import { expect, test } from 'vitest'
import { stringifyMDX, parseMDX, transformTree } from "../../index";


test('can extract vars', async () => {
  const input = getInput(__dirname);
  const tree = parseMDX(input);
  const processed = await transformTree(tree);
  const compiled = stringifyMDX(processed);
  const output = getOutput(__dirname);
  expect(compiled).toEqual(output);
});