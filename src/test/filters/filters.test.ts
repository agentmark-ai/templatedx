import { getInput, getOutput } from "../helpers";
import { expect, test } from 'vitest'
import { stringify, parse, transformTree } from "../../index";


test('handles filters', async () => {
  const input = getInput(__dirname);
  const tree = parse(input);
  const props = { obj: { a: 'b', c: [1, 2, 3]}}
  const processed = await transformTree(tree, props);
  const compiled = stringify(processed);
  const output = getOutput(__dirname);
  expect(compiled).toEqual(output);
});