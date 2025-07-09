import { expect, test } from 'vitest';
import { TemplateDX, TagPlugin, PluginContext } from '../../index';
import { parse } from '../../ast-utils';
import { Node } from 'mdast';

// Test plugin for instance A
class TestPluginA extends TagPlugin {
  async transform(
    props: Record<string, any>,
    children: Node[],
    context: PluginContext
  ): Promise<Node[] | Node> {
    return {
      type: 'paragraph',
      children: [
        {
          type: 'text',
          value: `Plugin A: ${props.message || 'default'}`
        }
      ]
    } as Node;
  }
}

// Test plugin for instance B
class TestPluginB extends TagPlugin {
  async transform(
    props: Record<string, any>,
    children: Node[],
    context: PluginContext
  ): Promise<Node[] | Node> {
    return {
      type: 'paragraph',
      children: [
        {
          type: 'text',
          value: `Plugin B: ${props.message || 'default'}`
        }
      ]
    } as Node;
  }
}

// Test filter for instance A
const testFilterA = (input: string) => `A: ${input}`;

// Test filter for instance B
const testFilterB = (input: string) => `B: ${input}`;

test('Multiple TemplateDX instances should have independent plugin registries', async () => {
  // Create two instances
  const engineA = new TemplateDX();
  const engineB = new TemplateDX();

  // Register different plugins to each instance
  engineA.registerTagPlugin(new TestPluginA(), ['TestTag']);
  engineB.registerTagPlugin(new TestPluginB(), ['TestTag']);

  // Test that each instance uses its own plugin
  const tree = parse('<TestTag message="hello" />');
  
  const resultA = await engineA.transform(tree);
  const resultB = await engineB.transform(tree);

  const outputA = engineA.stringify(resultA);
  const outputB = engineB.stringify(resultB);

  expect(outputA).toContain('Plugin A: hello');
  expect(outputB).toContain('Plugin B: hello');
});

test('Multiple TemplateDX instances should have independent filter registries', async () => {
  // Create two instances
  const engineA = new TemplateDX();
  const engineB = new TemplateDX();

  // Register different filters to each instance
  engineA.registerFilterFunction('testFilter', testFilterA);
  engineB.registerFilterFunction('testFilter', testFilterB);

  // Test that each instance uses its own filter
  const tree = parse('{"hello" | testFilter}');
  
  const resultA = await engineA.transform(tree);
  const resultB = await engineB.transform(tree);

  const outputA = engineA.stringify(resultA);
  const outputB = engineB.stringify(resultB);

  expect(outputA).toContain('A: hello');
  expect(outputB).toContain('B: hello');
});

test('TemplateDX instances should have built-in plugins by default', async () => {
  const engine = new TemplateDX();
  
  // Test that built-in plugins are available
  expect(engine.getTagPlugin('If')).toBeDefined();
  expect(engine.getTagPlugin('ForEach')).toBeDefined();
  expect(engine.getFilterFunction('capitalize')).toBeDefined();
  expect(engine.getFilterFunction('upper')).toBeDefined();
});

test('TemplateDX instances should allow removing and adding plugins', async () => {
  const engine = new TemplateDX();
  
  // Initially should have the built-in If plugin
  expect(engine.getTagPlugin('If')).toBeDefined();
  
  // Remove the If plugin
  engine.removeTagPlugin('If');
  expect(engine.getTagPlugin('If')).toBeUndefined();
  
  // Add a custom plugin
  engine.registerTagPlugin(new TestPluginA(), ['CustomTag']);
  expect(engine.getTagPlugin('CustomTag')).toBeDefined();
});

test('TemplateDX instances should allow removing and adding filters', async () => {
  const engine = new TemplateDX();
  
  // Initially should have the built-in capitalize filter
  expect(engine.getFilterFunction('capitalize')).toBeDefined();
  
  // Remove the capitalize filter
  engine.removeFilterFunction('capitalize');
  expect(engine.getFilterFunction('capitalize')).toBeUndefined();
  
  // Add a custom filter
  engine.registerFilterFunction('customFilter', testFilterA);
  expect(engine.getFilterFunction('customFilter')).toBeDefined();
});

test('TemplateDX should support all core operations', async () => {
  const engine = new TemplateDX();
  
  // Test parse
  const tree = parse('# Hello World');
  expect(tree.type).toBe('root');
  
  // Test stringify
  const output = engine.stringify(tree);
  expect(output).toContain('# Hello World');
  
  // Test getFrontMatter
  const frontmatterTree = parse('---\ntitle: Test\n---\n# Content');
  const frontmatter = engine.getFrontMatter(frontmatterTree);
  expect(frontmatter?.title).toBe('Test');
  
  // Test compressAst
  const compressed = engine.compressAst(tree);
  expect(compressed.type).toBe('root');
});

test('TemplateDX should work with conditional tags', async () => {
  const engine = new TemplateDX();
  
  const tree = parse(`
    <If condition={true}>
      This should show
    </If>
    <If condition={false}>
      This should not show
    </If>
  `);
  
  const result = await engine.transform(tree, {});
  const output = engine.stringify(result);
  
  expect(output).toContain('This should show');
  expect(output).not.toContain('This should not show');
});

test('TemplateDX should work with ForEach tags', async () => {
  const engine = new TemplateDX();
  
  const tree = parse(`
    <ForEach arr={items}>
      {(item) => (
        <>
          Item: {item}
        </>
      )}
    </ForEach>
  `);
  
  const result = await engine.transform(tree, {}, { items: ['a', 'b', 'c'] });
  const output = engine.stringify(result);
  
  expect(output).toContain('Item: a');
  expect(output).toContain('Item: b');
  expect(output).toContain('Item: c');
});

test('TemplateDX should work with filters', async () => {
  const engine = new TemplateDX();
  
  const tree = parse('{"hello world" | capitalize}');
  const result = await engine.transform(tree, {});
  const output = engine.stringify(result);
  
  expect(output).toContain('Hello world');
});