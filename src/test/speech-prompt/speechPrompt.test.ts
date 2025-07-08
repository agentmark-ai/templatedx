import { getInput, getOutput } from "../helpers";
import { expect, test } from 'vitest';
import { stringify, transform } from "../../index";
import { parse } from "../../ast-utils";

test('SpeechPrompt with expression content', async () => {
  const input = `
<User>
  <SpeechPrompt>{props.var}</SpeechPrompt>
</User>
`;

  const expectedOutput = "<User />";

  const tree = parse(input);
  const props = { var: "Hello world" };
  const shared = { __insideMessageType: "user" };
  const result = await transform(tree, props, shared);
  const output = stringify(result);

  expect(output.trim()).toBe(expectedOutput);

  // Verify that the speech content was extracted
  expect(shared).toHaveProperty('__agentmark-mediaParts');
  const mediaParts = (shared as any)['__agentmark-mediaParts'];
  expect(mediaParts).toHaveLength(1);
  expect(mediaParts[0]).toEqual({
    type: "speech",
    content: "Hello world"
  });
});

test('SpeechPrompt with mixed content', async () => {
  const input = `
<User>
  <SpeechPrompt>- {props.var}</SpeechPrompt>
</User>
`;

  const expectedOutput = "<User>\n\n</User>";

  const tree = parse(input);
  const props = { var: "test content" };
  const shared = { __insideMessageType: "user" };
  const result = await transform(tree, props, shared);
  const output = stringify(result);

  expect(output.trim()).toBe(expectedOutput);

  // Verify that the speech content was extracted
  expect(shared).toHaveProperty('__agentmark-mediaParts');
  const mediaParts = (shared as any)['__agentmark-mediaParts'];
  expect(mediaParts).toHaveLength(1);
  expect(mediaParts[0]).toEqual({
    type: "speech",
    content: "\\- test content"
  });
});

test('SpeechPrompt with empty content', async () => {
  const input = `
<User>
  <SpeechPrompt>{props.empty}</SpeechPrompt>
</User>
`;

  const expectedOutput = "<User />";

  const tree = parse(input);
  const props = { empty: "" };
  const shared = { __insideMessageType: "user" };
  const result = await transform(tree, props, shared);
  const output = stringify(result);

  expect(output.trim()).toBe(expectedOutput);

  // Verify that the speech content was extracted, even if empty
  expect(shared).toHaveProperty('__agentmark-mediaParts');
  const mediaParts = (shared as any)['__agentmark-mediaParts'];
  expect(mediaParts).toHaveLength(1);
  expect(mediaParts[0]).toEqual({
    type: "speech",
    content: ""
  });
});

test('SpeechPrompt with undefined props', async () => {
  const input = `
<User>
  <SpeechPrompt>{props.undefined}</SpeechPrompt>
</User>
`;

  const expectedOutput = "<User />";

  const tree = parse(input);
  const props = {};
  const shared = { __insideMessageType: "user" };
  const result = await transform(tree, props, shared);
  const output = stringify(result);

  expect(output.trim()).toBe(expectedOutput);

  // Verify that the speech content was extracted, even with undefined props
  expect(shared).toHaveProperty('__agentmark-mediaParts');
  const mediaParts = (shared as any)['__agentmark-mediaParts'];
  expect(mediaParts).toHaveLength(1);
  expect(mediaParts[0]).toEqual({
    type: "speech",
    content: ""
  });
});