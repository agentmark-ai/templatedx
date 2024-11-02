import { getInput, getOutput } from "../helpers";
import { expect, test } from 'vitest'
import { stringify, parse, transformTree } from "../../index";

const props = {
  num4: 4,
  num3: 3,
  num5: 5,
  a: true,
  b: false
};

test('input matches output for operators', async () => {
  const input = getInput(__dirname);
  const tree = parse(input);
  const processed = await transformTree(tree, props);
  const compiled = stringify(processed);
  const output = getOutput(__dirname);
  expect(compiled).toEqual(output);
});