import fs from 'fs';
import { getInput, getOutput } from "../helpers";
import { expect, test } from 'vitest'
import { bundle, ContentLoader, stringify } from "../../index";

test('input matches output', async () => {
  const input = getInput(__dirname);
  const loader: ContentLoader = async path => fs.readFileSync(path, 'utf-8');
  const compiled = await stringify(await bundle(input, __dirname, loader));
  const output = getOutput(__dirname);
  expect(compiled).toEqual(output);
});