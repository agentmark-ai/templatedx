import { getInput, getOutput, print } from "../helpers";
import { expect, test } from 'vitest'
import { parseMDX, stringifyMDX } from "../../index";

test('input matches output', () => {
  const input = getInput(__dirname);
  const tree = parseMDX(input);
  expect(print(tree)).toMatchFileSnapshot('./node.json');
  const output = getOutput(__dirname);
  expect(stringifyMDX(tree)).toEqual(output);
});