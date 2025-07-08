import { NODE_TYPES, MDX_JSX_ATTRIBUTE_TYPES } from './constants';
import { getDirname, resolvePath, cloneObject } from './utils';
import { visit } from 'unist-util-visit';
import type { Root, RootContent, Paragraph, Parent, Node } from 'mdast';
import type { ComponentASTs, ContentLoader } from './types';
import { SKIP } from 'unist-util-visit';
import {
  isMdxJsxElement,
  isParentNode,
  parse,
} from './ast-utils';

export async function bundle(
  mdxContent: string,
  baseDir: string,
  contentLoader: ContentLoader
): Promise<Root> {
  const processedFiles = new Set<string>();
  const mainAbsolutePath = resolvePath(baseDir, '__PROMPTDX_IGNORE__.mdx');

  const { tree: mainTree, componentASTs } = await processMdxContent(
    mdxContent,
    mainAbsolutePath,
    new Set(),
    processedFiles,
    contentLoader
  );

  await inlineComponents(mainTree, componentASTs);

  return mainTree;
}

export async function bundleWithComponents(
  mdxContent: string,
  baseDir: string,
  contentLoader: ContentLoader
): Promise<{ tree: Root; componentASTs: ComponentASTs }> {
  const processedFiles = new Set<string>();
  const mainAbsolutePath = resolvePath(baseDir, '__PROMPTDX_IGNORE__.mdx');

  const { tree: mainTree, componentASTs } = await processMdxContent(
    mdxContent,
    mainAbsolutePath,
    new Set(),
    processedFiles,
    contentLoader
  );

  // Don't inline components here - we'll do it during transformation
  return { tree: mainTree, componentASTs };
}

async function processMdxContent(
  content: string,
  absolutePath: string,
  callStack: Set<string>,
  processedFiles: Set<string>,
  contentLoader: ContentLoader
): Promise<{ tree: Root; componentASTs: ComponentASTs }> {
  if (processedFiles.has(absolutePath)) {
    return { tree: { type: 'root', children: [] }, componentASTs: {} };
  }

  if (callStack.has(absolutePath)) {
    throw new Error(
      `Circular import detected: ${[...callStack, absolutePath].join(' -> ')}`
    );
  }

  callStack.add(absolutePath);

  const tree = parse(content);
  removeComments(tree);
  const imports = extractImports(tree, absolutePath);
  const componentASTs: ComponentASTs = {};

  for (const [componentName, sourcePath] of Object.entries(imports)) {
    const importAbsolutePath = resolvePath(getDirname(absolutePath), sourcePath);
    const importedContent = await contentLoader(importAbsolutePath);

    const { tree: componentTree, componentASTs: nestedComponentASTs } =
      await processMdxContent(
        importedContent,
        importAbsolutePath,
        new Set(callStack),
        processedFiles,
        contentLoader
      );

    Object.assign(componentASTs, nestedComponentASTs);
    componentASTs[componentName] = componentTree.children;
  }

  tree.children = tree.children.filter(
    (node: any) => node.type !== NODE_TYPES.MDX_JSX_ESM
  );
  processedFiles.add(absolutePath);
  callStack.delete(absolutePath);

  return { tree, componentASTs };
}

function removeComments(tree: Root): void {
  visit(tree, (node, index, parent) => {
    if (isCommentNode(node) && parent) {
      parent.children.splice(index!, 1);
      return [SKIP, index];
    }
  });
}

function isCommentNode(node: Node): boolean {
  if (
    node.type === NODE_TYPES.MDX_FLOW_EXPRESSION ||
    node.type === NODE_TYPES.MDX_TEXT_EXPRESSION
  ) {
    const value = (node as any).value.trim();
    return (
      (value.startsWith('/*') && value.endsWith('*/')) ||
      value.startsWith('//')
    );
  }
  return false;
}

function extractImports(tree: Root, absolutePath: string): Record<string, string> {
  const imports: Record<string, string> = {};

  visit(tree, NODE_TYPES.MDX_JSX_ESM, (node: any) => {
    const estree = node.data?.estree;

    if (!estree) {
      throw new Error(`No ESTree found in ${absolutePath}`);
    }

    for (const stmt of estree.body) {
      if (stmt.type === 'ImportDeclaration') {
        const defaultSpecifier = stmt.specifiers.find(
          (spec: any) => spec.type === 'ImportDefaultSpecifier'
        );

        if (
          stmt.specifiers.some(
            (spec: any) => spec.type !== 'ImportDefaultSpecifier'
          )
        ) {
          throw new Error(
            `Only default imports are supported. Invalid import in ${absolutePath}: ${node.value.trim()}`
          );
        }

        if (defaultSpecifier) {
          const importedName = defaultSpecifier.local.name;
          const source = stmt.source.value as string;
          imports[importedName] = source;
        } else {
          throw new Error(
            `Invalid import in ${absolutePath}: ${node.value.trim()}`
          );
        }
      } else if (stmt.type.startsWith('Export')) {
        throw new Error(
          `Exports are not supported. Found in ${absolutePath}: ${node.value.trim()}`
        );
      }
    }
  });

  return imports;
}

async function inlineComponents(
  tree: Root,
  componentASTs: ComponentASTs
): Promise<void> {
  let hasReplacements: boolean;

  do {
    hasReplacements = inlineJsxElements(tree, componentASTs);
  } while (hasReplacements);
}

function inlineJsxElements(
  tree: Root | Parent,
  componentASTs: ComponentASTs,
  parentProps: Record<string, any> = {}
): boolean {
  let replaced = false;

  visit(
    tree,
    [NODE_TYPES.MDX_JSX_FLOW_ELEMENT, NODE_TYPES.MDX_JSX_TEXT_ELEMENT],
    (node: any, index, parent) => {
      const componentName = node.name;
      if (componentASTs[componentName]) {
        const componentNodes = cloneObject(componentASTs[componentName]);
        const props = extractRawProps(node, parentProps);
        const childrenContent = node.children || [];

        const processedComponentNodes = componentNodes.map((childNode: any) =>
          inlineComponentsAndResolveProps(
            childNode,
            props,
            childrenContent,
            componentASTs
          )
        );

        parent.children.splice(index, 1, ...processedComponentNodes.flat());
        replaced = true;
      }
    }
  );

  return replaced;
}

export function extractRawProps(
  node: any,
  parentProps: Record<string, any>
): Record<string, any> {
  const props: Record<string, any> = {};

  for (const attr of node.attributes) {
    if (attr.type === MDX_JSX_ATTRIBUTE_TYPES.MDX_JSX_ATTRIBUTE) {
      if (attr.value === null || typeof attr.value === 'string') {
        props[attr.name] = JSON.stringify(attr.value || '');
      } else if (attr.value.type === MDX_JSX_ATTRIBUTE_TYPES.MDX_JSX_ATTRIBUTE_VALUE_EXPRESSION) {
        const { value: resolvedValue } = substitutePropsInExpression(
          attr.value.value,
          parentProps
        );
        props[attr.name] = resolvedValue;
      }
    } else if (attr.type === MDX_JSX_ATTRIBUTE_TYPES.MDX_JSX_EXPRESSION_ATTRIBUTE) {
      throw new Error(
        `Only literal attribute values are supported. Invalid attribute in component <${node.name}>.`
      );
    }
  }

  return props;
}

export function substitutePropsInExpression(
  expression: string,
  props: Record<string, any>,
): { value: string; isLiteral: boolean } {
  const propRegex = /props\.(\w+)/g;
  const visitedProps = new Set();
  let currentExpression = expression;

  const substitute = (expr: string): string => {
    return expr.replace(propRegex, (match, propName) => {
      if (visitedProps.has(propName)) {
        throw new Error(`Circular reference detected for property '${propName}'.`);
      }
      if (props.hasOwnProperty(propName)) {
        visitedProps.add(propName);
        const propValue = props[propName];
        if (typeof propValue === 'string') {
          return substitute(propValue);
        } else {
          return String(propValue);
        }
      } else {
        return match;
      }
    });
  };

  try {
    currentExpression = substitute(currentExpression);
  } catch (error) {
    throw new Error(`Error substituting props in expression: ${(error as Error).message}`);
  }

  const isLiteral = /^['"].*['"]$|^\d+(\.\d+)?$/.test(currentExpression);

  return { value: currentExpression, isLiteral };
}

// Enhanced version for nested props - used specifically by ForEach
export function substitutePropsInExpressionEnhanced(
  expression: string,
  props: Record<string, any>,
): { value: string; isLiteral: boolean } {
  const propRegex = /props\.([a-zA-Z_$][a-zA-Z0-9_$]*(?:\.[a-zA-Z_$][a-zA-Z0-9_$]*)*)/g;
  const visitedProps = new Set();
  let currentExpression = expression;

  const substitute = (expr: string): string => {
    return expr.replace(propRegex, (match, propPath) => {
      if (visitedProps.has(propPath)) {
        throw new Error(`Circular reference detected for property '${propPath}'.`);
      }
      
      const pathParts = propPath.split('.');
      const topLevelProp = pathParts[0];
      
      if (props.hasOwnProperty(topLevelProp)) {
        visitedProps.add(propPath);
        
        // Start with the top-level prop value
        let propValue = props[topLevelProp];
        
        // If the top-level prop value is a string that looks like JSON, try to parse it
        if (typeof propValue === 'string') {
          try {
            propValue = JSON.parse(propValue);
          } catch (error) {
            // If parsing fails, use the string value as is
          }
        }
        
        // Navigate through the remaining path parts
        for (let i = 1; i < pathParts.length; i++) {
          const part = pathParts[i];
          if (propValue && typeof propValue === 'object' && part in propValue) {
            propValue = propValue[part];
          } else {
            // If we can't navigate to the property, return the original match
            return match;
          }
        }
        
        if (typeof propValue === 'string') {
          return substitute(propValue);
        } else {
          return String(propValue);
        }
      } else {
        return match;
      }
    });
  };

  try {
    currentExpression = substitute(currentExpression);
  } catch (error) {
    throw new Error(`Error substituting props in expression: ${(error as Error).message}`);
  }

  const isLiteral = /^['"].*['"]$|^\d+(\.\d+)?$/.test(currentExpression);

  return { value: currentExpression, isLiteral };
}

export function inlineComponentsAndResolveProps(
  node: Node,
  props: Record<string, any>,
  childrenContent: RootContent[],
  componentASTs: ComponentASTs
): Node | Node[] {
  if (
    node.type === NODE_TYPES.MDX_TEXT_EXPRESSION ||
    node.type === NODE_TYPES.MDX_FLOW_EXPRESSION
  ) {
    if ((node as any).value === 'props.children') {
      const childrenTree: Root = { type: 'root', children: [...childrenContent] };
      inlineComponents(childrenTree, componentASTs);
      return combinedNodesIntoParagraph(childrenTree.children);
    } else if ((node as any).value.includes('props.')) {
      const { value: resolvedValue, isLiteral } = substitutePropsInExpressionEnhanced(
        (node as any).value,
        props
      );

      if (isLiteral) {
        return {
          type: NODE_TYPES.TEXT,
          value: JSON.parse(resolvedValue),
        } as Node;
      } else {
        return {
          type: NODE_TYPES.TEXT,
          value: resolvedValue,
        } as Node;
      }
    }
  }

  if (isMdxJsxElement(node)) {
    const componentName = node.name!;
    if (componentASTs[componentName]) {
      const componentNodes = cloneObject(componentASTs[componentName]);
      // Use the props passed in directly instead of re-extracting them
      // This allows the transformer to provide correctly resolved props
      const childrenContent = node.children || [];

      const processedComponentNodes = componentNodes.map((childNode: any) =>
        inlineComponentsAndResolveProps(
          childNode,
          props, // Use the props as provided, don't re-extract
          childrenContent,
          componentASTs
        )
      );

      return processedComponentNodes.flat();
    }
  }

  if (isParentNode(node)) {
    const newNode = node as Parent;
    newNode.children = newNode.children.flatMap((child) =>
      inlineComponentsAndResolveProps(
        child,
        props,
        childrenContent,
        componentASTs
      )
    ) as RootContent[];
  }

  return node;
}

export function combinedNodesIntoParagraph(nodes: RootContent[]): RootContent[] {
  const contentChildren: RootContent[] = [];

  nodes.forEach((node, index) => {
    if (node.type === NODE_TYPES.PARAGRAPH || node.type === NODE_TYPES.LIST) {
      contentChildren.push(...(node as Parent).children);
    } else {
      contentChildren.push(node);
    }

    if (index !== nodes.length - 1) {
      contentChildren.push({ type: NODE_TYPES.TEXT, value: '\n' });
    }
  });

  if (contentChildren.length > 0) {
    return [
      {
        type: NODE_TYPES.PARAGRAPH,
        children: contentChildren,
      } as Paragraph,
    ];
  }

  return [];
}
