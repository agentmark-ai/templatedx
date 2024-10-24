import { getInput } from "../helpers";
import { expect, test } from 'vitest'
import { getFrontMatter, extractFields, parseMDX } from "../../index";

test('can extract vars', async () => {
  const input = getInput(__dirname);
  const ast = parseMDX(input);
  const frontMatter = getFrontMatter(ast);
  const extractedFields = await extractFields(ast, ['Input', 'Other', 'NA'], { text: 'hello', arr: ['a', 'b', 'c'] });
  expect(extractedFields).toEqual([
    { name: 'Input', content: 'This is the input text1 hello' },
    { name: 'Other', content: 'This is the other text' },
    { name: 'Input', content: 'This is the input text2' },
    { name: 'Other', content: 'Mapped: a' },
    { name: 'Other', content: 'Mapped: b' },
    { name: 'Other', content: 'Mapped: c' },
  ]);
  expect(frontMatter).toEqual({
    name: "jim",
    company: "toyota",
    address: {
      street: "1 blueberry lane",
      zipcode: '010101',
    },
  })
});