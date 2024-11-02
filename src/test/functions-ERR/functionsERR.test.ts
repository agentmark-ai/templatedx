import { getInput } from "../helpers";
import { expect, test } from 'vitest'
import { parse, transformTree } from "../../index";

const props = {
  num: 4,
};

test('replaces function props', async () => {
  const input = getInput(__dirname);
  const tree = parse(input);
  const processedFn = async () => transformTree(tree, props);
  expect(processedFn).rejects.toThrowError();
});