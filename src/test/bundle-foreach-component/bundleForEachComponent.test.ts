import fs from 'fs';
import { getInput, getOutput } from "../helpers";
import { expect, test } from 'vitest'
import { parse, ContentLoader, stringify } from "../../index";

test('ForEach with imported component bundles correctly', async () => {
  const input = getInput(__dirname);
  const loader: ContentLoader = async path => fs.readFileSync(path, 'utf-8');
  const compiled = await stringify(await parse(input, __dirname, loader));
  const output = getOutput(__dirname);
  expect(compiled).toEqual(output);
});