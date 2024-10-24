import fs from 'fs';
import { getInput } from "../helpers";
import { expect, test } from 'vitest'
import { bundleMDX, ContentLoader, stringifyMDX, compressAst } from "../../index";

test('compresses an ast', async () => {
  const input = getInput(__dirname);
  const loader: ContentLoader = async path => fs.readFileSync(path, 'utf-8');
  const bundled = await bundleMDX(input, __dirname, loader);
  // Cloning, because compressing mutates the tree.
  const uncompressedAst = structuredClone(bundled);
  compressAst(bundled);
  expect(bundled).toMatchFileSnapshot('./node.json');
  const compressed = await stringifyMDX(bundled);
  const uncompressed = await stringifyMDX(uncompressedAst);
  expect(compressed).toEqual(uncompressed);
});