import { TemplateDX } from '../../templatedx';
import { TagPlugin } from '../../tag-plugin';
import { expect, test } from 'vitest';
import type { Node } from 'mdast';
import type { PluginContext } from '../../tag-plugin';

// Custom tag plugin for testing
class TestPlugin extends TagPlugin {
  async transform(
    props: Record<string, any>,
    children: Node[],
    context: PluginContext
  ): Promise<Node[]> {
    return [{
      type: 'text',
      value: `Test: ${props.message || 'no message'}`
    }];
  }
}

// Another custom tag plugin 
class GreetingPlugin extends TagPlugin {
  async transform(
    props: Record<string, any>,
    children: Node[],
    context: PluginContext
  ): Promise<Node[]> {
    return [{
      type: 'text',
      value: `Hello, ${props.name || 'World'}!`
    }];
  }
}

// Custom filter function for testing
const customFilter = (input: string) => input.toUpperCase();
const prefixFilter = (input: string, prefix: string) => `${prefix}${input}`;

test('TemplateDX instances should be isolated', async () => {
  // Create two instances
  const instance1 = new TemplateDX();
  const instance2 = new TemplateDX();

  // Register different plugins to each instance
  instance1.registerTagPlugin(new TestPlugin(), ['Test']);
  instance2.registerTagPlugin(new GreetingPlugin(), ['Greeting']);

  instance1.registerFilterFunction('custom', customFilter);
  instance2.registerFilterFunction('prefix', prefixFilter);

  // Test that instance1 has TestPlugin but not GreetingPlugin
  expect(instance1.getTagPlugin('Test')).toBeDefined();
  expect(instance1.getTagPlugin('Greeting')).toBeUndefined();
  expect(instance1.getFilterFunction('custom')).toBeDefined();
  expect(instance1.getFilterFunction('prefix')).toBeUndefined();

  // Test that instance2 has GreetingPlugin but not TestPlugin
  expect(instance2.getTagPlugin('Greeting')).toBeDefined();
  expect(instance2.getTagPlugin('Test')).toBeUndefined();
  expect(instance2.getFilterFunction('prefix')).toBeDefined();
  expect(instance2.getFilterFunction('custom')).toBeUndefined();

  // Test processing with instance1
  const tree1 = await instance1.parse('<Test message="hello" />', '.', async () => '');
  const processed1 = await instance1.transform(tree1);
  const result1 = instance1.stringify(processed1);
  expect(result1).toBe('Test: hello\n');

  // Test processing with instance2
  const tree2 = await instance2.parse('<Greeting name="Alice" />', '.', async () => '');
  const processed2 = await instance2.transform(tree2);
  const result2 = instance2.stringify(processed2);
  expect(result2).toBe('Hello, Alice!\n');
});

test('TemplateDX instances should have builtin plugins', async () => {
  const instance = new TemplateDX();
  
  // Test that built-in plugins are available
  expect(instance.getTagPlugin('ForEach')).toBeDefined();
  expect(instance.getTagPlugin('If')).toBeDefined();
  expect(instance.getTagPlugin('Else')).toBeDefined();
  expect(instance.getTagPlugin('Raw')).toBeDefined();
  
  // Test that built-in filters are available
  expect(instance.getFilterFunction('capitalize')).toBeDefined();
  expect(instance.getFilterFunction('upper')).toBeDefined();
  expect(instance.getFilterFunction('lower')).toBeDefined();
  expect(instance.getFilterFunction('truncate')).toBeDefined();
  expect(instance.getFilterFunction('abs')).toBeDefined();
  expect(instance.getFilterFunction('join')).toBeDefined();
  expect(instance.getFilterFunction('round')).toBeDefined();
  expect(instance.getFilterFunction('replace')).toBeDefined();
  expect(instance.getFilterFunction('urlencode')).toBeDefined();
  expect(instance.getFilterFunction('dump')).toBeDefined();
});

test('TemplateDX instances should support ForEach plugin', async () => {
  const instance = new TemplateDX();
  
  const mdxContent = `
<ForEach arr={items}>
{(item, index) => (
  <p>Item {index}: {item}</p>
)}
</ForEach>
  `;
  
  const tree = await instance.parse(mdxContent, '.', async () => '');
  const processed = await instance.transform(tree, { items: ['apple', 'banana', 'cherry'] });
  const result = instance.stringify(processed);
  
  expect(result).toContain('Item 0: apple');
  expect(result).toContain('Item 1: banana');
  expect(result).toContain('Item 2: cherry');
});

test('TemplateDX instances should support If plugin', async () => {
  const instance = new TemplateDX();
  
  const mdxContent = `
<If condition={showMessage}>
  <p>Message is shown</p>
</If>
<Else>
  <p>Message is hidden</p>
</Else>
  `;
  
  const tree = await instance.parse(mdxContent, '.', async () => '');
  const processed = await instance.transform(tree, { showMessage: true });
  const result = instance.stringify(processed);
  
  expect(result).toContain('Message is shown');
  expect(result).not.toContain('Message is hidden');
});

test('TemplateDX instances should support filter functions', async () => {
  const instance = new TemplateDX();
  
  const mdxContent = `
<p>{message | capitalize}</p>
<p>{message | upper}</p>
<p>{message | lower}</p>
  `;
  
  const tree = await instance.parse(mdxContent, '.', async () => '');
  const processed = await instance.transform(tree, { message: 'hello world' });
  const result = instance.stringify(processed);
  
  expect(result).toContain('Hello world');
  expect(result).toContain('HELLO WORLD');
  expect(result).toContain('hello world');
});

test('TemplateDX instances should support custom filter functions', async () => {
  const instance = new TemplateDX();
  
  // Register a custom filter
  instance.registerFilterFunction('exclaim', (input: string) => `${input}!`);
  
  const mdxContent = `
<p>{message | exclaim}</p>
  `;
  
  const tree = await instance.parse(mdxContent, '.', async () => '');
  const processed = await instance.transform(tree, { message: 'hello world' });
  const result = instance.stringify(processed);
  
  expect(result).toContain('hello world!');
});

test('TemplateDX instances should support plugin removal', async () => {
  const instance = new TemplateDX();
  
  // Register a plugin
  instance.registerTagPlugin(new TestPlugin(), ['Test']);
  expect(instance.getTagPlugin('Test')).toBeDefined();
  
  // Remove the plugin
  instance.removeTagPlugin('Test');
  expect(instance.getTagPlugin('Test')).toBeUndefined();
  
  // Register a filter
  instance.registerFilterFunction('test', customFilter);
  expect(instance.getFilterFunction('test')).toBeDefined();
  
  // Remove the filter
  instance.removeFilterFunction('test');
  expect(instance.getFilterFunction('test')).toBeUndefined();
});

test('TemplateDX instances should support getting all plugins', async () => {
  const instance = new TemplateDX();
  
  // Register custom plugins
  instance.registerTagPlugin(new TestPlugin(), ['Test']);
  instance.registerTagPlugin(new GreetingPlugin(), ['Greeting']);
  instance.registerFilterFunction('custom', customFilter);
  instance.registerFilterFunction('prefix', prefixFilter);
  
  // Get all plugins
  const allTagPlugins = instance.getAllTagPlugins();
  const allFilterFunctions = instance.getAllFilterFunctions();
  
  // Should include both built-in and custom plugins
  expect(allTagPlugins.has('Test')).toBe(true);
  expect(allTagPlugins.has('Greeting')).toBe(true);
  expect(allTagPlugins.has('ForEach')).toBe(true);
  expect(allTagPlugins.has('If')).toBe(true);
  
  expect(allFilterFunctions.has('custom')).toBe(true);
  expect(allFilterFunctions.has('prefix')).toBe(true);
  expect(allFilterFunctions.has('capitalize')).toBe(true);
  expect(allFilterFunctions.has('upper')).toBe(true);
});

test('TemplateDX instances should support utility methods', async () => {
  const instance = new TemplateDX();
  
  const mdxContent = `
---
title: Test Document
---

# {title}

This is a test document.
  `;
  
  const tree = await instance.parse(mdxContent, '.', async () => '');
  const processed = await instance.transform(tree, { title: 'My Title' });
  
  // Test getFrontMatter
  const frontMatter = instance.getFrontMatter(tree);
  expect(frontMatter).toEqual({ title: 'Test Document' });
  
  // Test stringify
  const result = instance.stringify(processed);
  expect(result).toContain('# My Title');
  expect(result).toContain('This is a test document.');
  
  // Test compressAst
  const compressed = instance.compressAst(tree);
  expect(compressed).toBeDefined();
  expect(compressed.type).toBe('root');
});