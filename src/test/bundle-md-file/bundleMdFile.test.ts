import fs from 'fs';
import { getInput, getOutput } from "../helpers";
import { expect, test } from 'vitest'
import { bundleMDX, ContentLoader, stringifyMDX } from "../../index";

test('input matches output', async () => {
  const input = getInput(__dirname);
  const loader: ContentLoader = async path => fs.readFileSync(path, 'utf-8');
  const compiled = await stringifyMDX(await bundleMDX(input, __dirname, loader));
  const output = getOutput(__dirname);
  expect(compiled).toEqual(output);
});