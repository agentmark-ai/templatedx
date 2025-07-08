# SpeechPrompt Bug Fix Summary

## Problem
The `<SpeechPrompt>{props.var}</SpeechPrompt>` tag was causing errors when used alone, but worked when additional text content was added (like `<SpeechPrompt>- {props.var}</SpeechPrompt>`).

## Root Cause
The issue was that `SpeechPrompt` was not a registered tag plugin in the system. When unregistered tags contain only expressions as children (like `{props.var}`), the default processing logic was not handling them correctly, leading to errors during transformation.

## Solution
Created and registered a new `ExtractMediaPlugin` that properly handles `SpeechPrompt`, `ImageAttachment`, and `FileAttachment` tags:

### 1. Created New Plugin (`src/tag-plugins/extract-media.ts`)
- Extended the existing `ExtractMediaPlugin` concept to handle all three tag types
- Added proper processing of `SpeechPrompt` content including expressions
- Ensures all media parts are extracted to shared scope for later use
- Handles edge cases like empty content and undefined properties

### 2. Registered the Plugin (`src/register-builtin-plugins.ts`)
- Added the new plugin to the built-in plugin registry
- Now `SpeechPrompt`, `ImageAttachment`, and `FileAttachment` are all properly recognized

### 3. Key Features of the Fix
- **Expression Handling**: Properly processes expressions like `{props.var}` within tags
- **Content Extraction**: Uses `nodeHelpers.toMarkdown()` to extract all content types
- **Validation**: Ensures tags are only used within `User` context
- **Consistent Behavior**: Works regardless of whether content is pure expressions or mixed text

### 4. Test Coverage (`src/test/speech-prompt/speechPrompt.test.ts`)
Added comprehensive tests covering:
- Expression-only content: `<SpeechPrompt>{props.var}</SpeechPrompt>`
- Mixed content: `<SpeechPrompt>- {props.var}</SpeechPrompt>`
- Empty content scenarios
- Undefined property handling

## Result
The `<SpeechPrompt>{props.var}</SpeechPrompt>` pattern now works correctly without errors:
- Content is properly extracted from expressions
- No more need for workaround text like adding `-` prefix
- Consistent behavior across all media attachment tag types
- All existing functionality remains intact (all 31 test files still pass)

## Usage
```tsx
// These all work correctly now:
<SpeechPrompt>{props.text}</SpeechPrompt>
<SpeechPrompt>Hello {props.name}</SpeechPrompt>
<SpeechPrompt>{props.dynamicContent}</SpeechPrompt>

// Media parts are extracted to shared scope:
// { type: "speech", content: "extracted content" }
```