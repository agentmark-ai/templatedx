import { getInput, getOutput } from "../helpers";
import { expect, test } from 'vitest'
import { stringify, parse, transformTree } from "../../index";

test('maps over arrays', async () => {
  const input = getInput(__dirname);
  const tree = parse(input);
  const processed = await transformTree(tree);
  const compiled = stringify(processed);
  const output = getOutput(__dirname);
  expect(compiled).toEqual(output);
});