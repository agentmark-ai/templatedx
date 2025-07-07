# ForEach Component Bundling Fix

## Problem Description

The `ForEach` tag was not properly bundling components when they were used within ForEach children. This caused imported components like `MessageItem` to remain as JSX tags instead of being inlined with their content.

### Example of the Issue

```mdx
import MessageItem from './message-item';

<ForEach arr={props.messageHistory}>
  {(item) => (
    <MessageItem item={item} />
  )}
</ForEach>
```

**Expected Behavior**: `MessageItem` should be bundled (inlined) with its content.
**Actual Behavior**: `<MessageItem item={item} />` remained as-is without bundling.

## Root Cause

The issue was in the **order of operations** between bundling and tag plugin transformation:

1. **Bundling** happened first and processed imports
2. **Component inlining** processed the main tree, but couldn't find component references inside ForEach children
3. **ForEach transformation** happened later and created new component nodes
4. These new component references were never processed by the bundling system

## Solution

Modified the bundling system to handle **recursive component inlining** after tag plugin transformations:

### 1. Updated Bundler API

Enhanced `bundle()` function to accept transformation parameters:

```typescript
export async function bundle(
  mdxContent: string,
  baseDir: string,
  contentLoader: ContentLoader,
  transformProps?: Record<string, any>,  // NEW
  shared?: Record<string, any>          // NEW
): Promise<Root>
```

### 2. Integrated Transformation with Bundling

When transform props are provided, the bundler now:
1. Performs initial component bundling
2. Runs tag plugin transformations (including ForEach)
3. Performs **recursive component bundling** on transformed content

### 3. Enhanced ForEach Plugin

Updated ForEach plugin to handle component bundling within its scope:
- Added `componentASTs` to plugin context
- ForEach now performs component inlining after variable resolution
- This ensures components are bundled with the correct scope variables

## Test Results

✅ **Working Test**: `src/test/for-each-bundle-working/`
- ForEach correctly iterates over arrays
- Components are properly bundled/inlined
- Static props are resolved correctly

### Test Example

**Input**:
```mdx
<ForEach arr={props.items}>
  {(item) => (
    <SimpleComponent text="Hello" />
  )}
</ForEach>
```

**Output**:
```mdx
## Hello Component

## Hello Component

## Hello Component
```

## Current Status

✅ **Fixed**: ForEach bundling with static props
✅ **All existing tests pass**: No regression in functionality
⚠️ **Limitation**: Dynamic scope variables (like `item` from ForEach) require additional work for full resolution

## Usage

The fix is automatically applied when using the bundler with transformation:

```typescript
// This now works correctly
const tree = await parse(input, baseDir, loader, transformProps);
```

## Files Modified

1. `src/bundler.ts` - Enhanced to support recursive bundling
2. `src/transformer.ts` - Added componentASTs support
3. `src/tag-plugins/for-each.ts` - Enhanced to handle component bundling
4. `src/tag-plugin.ts` - Added componentASTs to plugin context
5. `src/test/for-each-bundle-working/` - Working test suite

The ForEach bundling functionality is now working correctly for static props and basic component inlining scenarios.