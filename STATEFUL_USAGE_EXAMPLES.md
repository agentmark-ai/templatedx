# TemplatedX Stateful Usage Examples

TemplatedX now supports stateful instances, allowing you to create multiple independent instances, each with their own plugin and filter registrations.

## Basic Usage

### Creating Multiple Independent Instances

```typescript
import { TemplatedX, TagPlugin, PluginContext } from '@agentmark/templatedx';
import type { Node } from 'mdast';

// Create multiple independent instances
const instance1 = new TemplatedX();
const instance2 = new TemplatedX();

// Each instance starts with all built-in plugins and filters
console.log(instance1.getTagPlugin('If')); // Built-in conditional plugin
console.log(instance1.getFilter('upper')); // Built-in uppercase filter
```

### Independent Plugin Registration

```typescript
// Create custom plugins
class CustomPlugin1 extends TagPlugin {
  async transform(props: Record<string, any>, children: Node[], context: PluginContext): Promise<Node[] | Node> {
    return {
      type: "paragraph",
      children: [{ type: "text", value: "Output from Plugin 1" }],
    };
  }
}

class CustomPlugin2 extends TagPlugin {
  async transform(props: Record<string, any>, children: Node[], context: PluginContext): Promise<Node[] | Node> {
    return {
      type: "paragraph", 
      children: [{ type: "text", value: "Output from Plugin 2" }],
    };
  }
}

// Register different plugins on each instance
instance1.registerTagPlugin(new CustomPlugin1(), ['MyTag']);
instance2.registerTagPlugin(new CustomPlugin2(), ['MyTag']);

// Each instance will handle the same tag differently
const content = `<MyTag />`;
const tree = parse(content);

const result1 = await instance1.transform(tree);
const result2 = await instance2.transform(tree);

console.log(instance1.stringify(result1)); // "Output from Plugin 1"
console.log(instance2.stringify(result2)); // "Output from Plugin 2"
```

### Independent Filter Registration

```typescript
// Register different filters with the same name
instance1.registerFilter('format', (input: string) => `[Instance1] ${input}`);
instance2.registerFilter('format', (input: string) => `[Instance2] ${input}`);

const filterContent = `{format("hello")}`;
const filterTree = parse(filterContent);

const filterResult1 = await instance1.transform(filterTree);
const filterResult2 = await instance2.transform(filterTree);

console.log(instance1.stringify(filterResult1)); // "[Instance1] hello"
console.log(instance2.stringify(filterResult2)); // "[Instance2] hello"
```

### Plugin Management

```typescript
const instance = new TemplatedX();

// Check if a plugin exists
if (instance.getTagPlugin('MyPlugin')) {
  console.log('MyPlugin is registered');
}

// Remove a plugin
instance.removeTagPlugin('MyPlugin');

// Get all registered plugins
const allPlugins = instance.getAllTagPlugins();
console.log('Registered plugins:', Array.from(allPlugins.keys()));

// Clear all plugins
instance.clearTagPlugins();

// Same methods work for filters
instance.registerFilter('myFilter', (input) => input.toUpperCase());
instance.removeFilter('myFilter');
const allFilters = instance.getAllFilters();
instance.clearFilters();
```

### Use Case: Multi-Tenant Applications

```typescript
// Different tenants can have different plugin configurations
class TenantAPlugin extends TagPlugin {
  async transform(props: Record<string, any>, children: Node[], context: PluginContext): Promise<Node[] | Node> {
    return { type: "paragraph", children: [{ type: "text", value: "Tenant A Branding" }] };
  }
}

class TenantBPlugin extends TagPlugin {
  async transform(props: Record<string, any>, children: Node[], context: PluginContext): Promise<Node[] | Node> {
    return { type: "paragraph", children: [{ type: "text", value: "Tenant B Branding" }] };
  }
}

const tenantAProcessor = new TemplatedX();
const tenantBProcessor = new TemplatedX();

tenantAProcessor.registerTagPlugin(new TenantAPlugin(), ['Branding']);
tenantBProcessor.registerTagPlugin(new TenantBPlugin(), ['Branding']);

// Each tenant gets their own customized output
const template = `<Branding />`;
// Process with different instances for different tenants
```

### Use Case: Feature Toggles

```typescript
const baseInstance = new TemplatedX();
const advancedInstance = new TemplatedX();

// Advanced instance has additional plugins
class AdvancedChartPlugin extends TagPlugin {
  async transform(props: Record<string, any>, children: Node[], context: PluginContext): Promise<Node[] | Node> {
    return { type: "paragraph", children: [{ type: "text", value: "Advanced Chart Component" }] };
  }
}

advancedInstance.registerTagPlugin(new AdvancedChartPlugin(), ['AdvancedChart']);

// Base users get basic functionality, premium users get advanced features
const hasAdvancedFeatures = true;
const processor = hasAdvancedFeatures ? advancedInstance : baseInstance;
```

## Backward Compatibility

The original static API still works for backward compatibility:

```typescript
import { TagPluginRegistry, FilterRegistry, transform, parse } from '@agentmark/templatedx';

// Old way (still works)
TagPluginRegistry.register(new MyPlugin(), ['MyTag']);
FilterRegistry.register('myFilter', (input) => input);

const tree = parse(content);
const result = await transform(tree);
```

But the new stateful approach is recommended for new projects:

```typescript
import { TemplatedX } from '@agentmark/templatedx';

// New way (recommended)
const templatedx = new TemplatedX();
templatedx.registerTagPlugin(new MyPlugin(), ['MyTag']);
templatedx.registerFilter('myFilter', (input) => input);

const tree = await templatedx.parse(content, baseDir, contentLoader);
const result = await templatedx.transform(tree);
```