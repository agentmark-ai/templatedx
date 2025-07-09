import { expect, test } from 'vitest';
import { 
  transform, 
  stringify, 
  TagPlugin, 
  TagPluginRegistry, 
  FilterRegistry, 
  PluginContext 
} from '../../index';
import { parse } from '../../ast-utils';
import { Node } from 'mdast';

// Test backwards compatibility with static API
class BackwardsCompatibilityPlugin extends TagPlugin {
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
          value: `BackwardsCompatibility: ${props.message || 'default'}`
        }
      ]
    } as Node;
  }
}

const backwardsCompatibilityFilter = (input: string) => `BC: ${input}`;

test('Static TagPluginRegistry API should still work', async () => {
  // Register using the old static API
  TagPluginRegistry.register(new BackwardsCompatibilityPlugin(), ['BackwardsCompatibilityTag']);
  
  // Test that the plugin works with the old transform function
  const tree = parse('<BackwardsCompatibilityTag message="hello" />');
  const result = await transform(tree);
  const output = stringify(result);
  
  expect(output).toContain('BackwardsCompatibility: hello');
  
  // Clean up
  TagPluginRegistry.remove('BackwardsCompatibilityTag');
});

test('Static FilterRegistry API should still work', async () => {
  // Register using the old static API
  FilterRegistry.register('backwardsCompatibilityFilter', backwardsCompatibilityFilter);
  
  // Test that the filter works with the old transform function
  const tree = parse('{"hello" | backwardsCompatibilityFilter}');
  const result = await transform(tree);
  const output = stringify(result);
  
  expect(output).toContain('BC: hello');
  
  // Clean up
  FilterRegistry.remove('backwardsCompatibilityFilter');
});

test('Built-in plugins should still work with static API', async () => {
  // Test that built-in plugins work with the old API
  const tree = parse(`
    <If condition={true}>
      This should show
    </If>
    <If condition={false}>
      This should not show
    </If>
  `);
  
  const result = await transform(tree, {});
  const output = stringify(result);
  
  expect(output).toContain('This should show');
  expect(output).not.toContain('This should not show');
});

test('Built-in filters should still work with static API', async () => {
  // Test that built-in filters work with the old API
  const tree = parse('{"hello world" | capitalize}');
  const result = await transform(tree, {});
  const output = stringify(result);
  
  expect(output).toContain('Hello world');
});

test('Static and instance APIs should not interfere with each other', async () => {
  // Register a plugin via static API
  TagPluginRegistry.register(new BackwardsCompatibilityPlugin(), ['StaticTag']);
  
  // Create an instance API
  const engine = new (await import('../../index')).TemplateDX();
  
  // Register a different plugin via instance API
  class InstancePlugin extends TagPlugin {
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
            value: `Instance: ${props.message || 'default'}`
          }
        ]
      } as Node;
    }
  }
  
  engine.registerTagPlugin(new InstancePlugin(), ['InstanceTag']);
  
  // Test that each API uses its own plugins
  const staticTree = parse('<StaticTag message="static" />');
  const instanceTree = parse('<InstanceTag message="instance" />');
  
  const staticResult = await transform(staticTree);
  const instanceResult = await engine.transform(instanceTree);
  
  const staticOutput = stringify(staticResult);
  const instanceOutput = engine.stringify(instanceResult);
  
  expect(staticOutput).toContain('BackwardsCompatibility: static');
  expect(instanceOutput).toContain('Instance: instance');
  
  // Clean up
  TagPluginRegistry.remove('StaticTag');
});