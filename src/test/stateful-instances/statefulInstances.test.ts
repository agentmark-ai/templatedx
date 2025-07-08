import { expect, test } from 'vitest'
import { TemplatedX, TagPlugin, PluginContext } from "../../index";
import { parse } from "../../ast-utils";
import { Node } from "mdast";

class TestPluginA extends TagPlugin {
  async transform(
    _props: Record<string, any>,
    children: Node[],
    context: PluginContext
  ): Promise<Node[] | Node> {
    return {
      type: "paragraph",
      children: [
        {
          type: "text",
          value: "TestPluginA output",
        },
      ],
    };
  }
}

class TestPluginB extends TagPlugin {
  async transform(
    _props: Record<string, any>,
    children: Node[],
    context: PluginContext
  ): Promise<Node[] | Node> {
    return {
      type: "paragraph",
      children: [
        {
          type: "text",
          value: "TestPluginB output",
        },
      ],
    };
  }
}

const testInput = `<TestPlugin />`;

test('multiple TemplatedX instances should have independent plugin registrations', async () => {
  const instance1 = new TemplatedX();
  const instance2 = new TemplatedX();

  // Register different plugins on each instance
  instance1.registerTagPlugin(new TestPluginA(), ['TestPlugin']);
  instance2.registerTagPlugin(new TestPluginB(), ['TestPlugin']);

  const tree = parse(testInput);

  // Each instance should produce different output
  const processed1 = await instance1.transform(tree);
  const processed2 = await instance2.transform(tree);

  const output1 = instance1.stringify(processed1);
  const output2 = instance2.stringify(processed2);

  expect(output1).toContain("TestPluginA output");
  expect(output2).toContain("TestPluginB output");
  expect(output1).not.toEqual(output2);
});

test('TemplatedX instances should not affect each other when plugins are removed', async () => {
  const instance1 = new TemplatedX();
  const instance2 = new TemplatedX();

  // Both instances start with the same plugin
  instance1.registerTagPlugin(new TestPluginA(), ['TestPlugin']);
  instance2.registerTagPlugin(new TestPluginA(), ['TestPlugin']);

  // Remove plugin from instance1 only
  instance1.removeTagPlugin('TestPlugin');

  const tree = parse(testInput);

  const processed1 = await instance1.transform(tree);
  const processed2 = await instance2.transform(tree);

  const output1 = instance1.stringify(processed1);
  const output2 = instance2.stringify(processed2);

  // instance1 should not transform the tag (no plugin registered)
  expect(output1).toContain("<TestPlugin");
  // instance2 should still transform the tag
  expect(output2).toContain("TestPluginA output");
});

test('TemplatedX instances should have independent filter registrations', async () => {
  const instance1 = new TemplatedX();
  const instance2 = new TemplatedX();

  // Register different filters on each instance
  instance1.registerFilter('test', (input: string) => `Filter1: ${input}`);
  instance2.registerFilter('test', (input: string) => `Filter2: ${input}`);

  const filterInput = `{test("hello")}`;
  const tree = parse(filterInput);

  const processed1 = await instance1.transform(tree);
  const processed2 = await instance2.transform(tree);

  const output1 = instance1.stringify(processed1);
  const output2 = instance2.stringify(processed2);

  expect(output1).toContain("Filter1: hello");
  expect(output2).toContain("Filter2: hello");
  expect(output1).not.toEqual(output2);
});

test('TemplatedX instances should start with built-in plugins and filters', async () => {
  const instance = new TemplatedX();

  // Should have built-in tag plugins
  expect(instance.getTagPlugin('If')).toBeDefined();
  expect(instance.getTagPlugin('ForEach')).toBeDefined();

  // Should have built-in filters  
  expect(instance.getFilter('upper')).toBeDefined();
  expect(instance.getFilter('lower')).toBeDefined();
  expect(instance.getFilter('capitalize')).toBeDefined();

  // Test a built-in filter
  const filterInput = `{upper("hello")}`;
  const tree = parse(filterInput);
  const processed = await instance.transform(tree);
  const output = instance.stringify(processed);

  expect(output).toContain("HELLO");
});