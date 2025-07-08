import { getInput, getOutput } from "../helpers";
import { expect, test } from 'vitest'
import { stringify, parse, ContentLoader, transform, bundleWithComponentASTs } from "../../index";
import fs from 'fs';

const props = {
  items: [1, 2, 3],
  text: 'Hello'
};

test('ForEach bundles components with static props correctly', async () => {
  const input = getInput(__dirname);
  const loader: ContentLoader = async path => fs.readFileSync(path, 'utf-8');
  
  // Step 1: Bundle components (build-time) and get componentASTs
  const { tree: bundledTree, componentASTs } = await bundleWithComponentASTs(input, __dirname, loader);
  
  // Step 2: Transform with props (runtime) and pass componentASTs
  const transformedTree = await transform(bundledTree, props, {}, undefined, undefined, componentASTs);
  
  const compiled = stringify(transformedTree);
  const output = getOutput(__dirname);
  expect(compiled).toEqual(output);
});