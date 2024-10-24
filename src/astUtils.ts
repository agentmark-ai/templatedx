import { NODE_TYPES } from './constants';
import { unified } from 'unified';
import yaml from 'js-yaml';
import {
  MdxJsxFlowElement,
  MdxJsxTextElement,
} from 'mdast-util-mdx';
import type {
  Parent,
  Node,
  Root,
} from 'mdast';
import remarkParse from 'remark-parse';
import remarkMdx from 'remark-mdx';
import remarkFrontmatter from 'remark-frontmatter';
import remarkStringify from 'remark-stringify';

export const createBaseProcessor = () =>
  unified().use(remarkParse).use(remarkMdx).use(remarkFrontmatter);

export function isMdxJsxElement(
  node: Node
): node is MdxJsxFlowElement | MdxJsxTextElement {
  return isMdxJsxFlowElement(node) || isMdxJsxTextElement(node);
}

export function isMdxJsxFlowElement(node: Node): node is MdxJsxFlowElement {
  return node.type === NODE_TYPES.MDX_JSX_FLOW_ELEMENT;
}

export function isMdxJsxTextElement(node: Node): node is MdxJsxTextElement {
  return node.type === NODE_TYPES.MDX_JSX_TEXT_ELEMENT;
}

export function isParentNode(node: Node): node is Parent {
  return 'children' in node && Array.isArray(node.children);
}

export function compressAst(node: any): void {
  const propertiesToDelete = [
    'position',
    'start',
    'end',
    'loc',
    'range',
    'data',
    'meta',
    'raw',
    'extra',
    'comments',
  ];

  for (const prop of propertiesToDelete) {
    if (prop in node) {
      delete node[prop];
    }
  }

  if (Array.isArray(node.children)) {
    for (const child of node.children) {
      compressAst(child);
    }
  }

  if (Array.isArray(node.attributes)) {
    for (const attr of node.attributes) {
      compressAst(attr);
    }
  }

  for (const key in node) {
    if (
      node.hasOwnProperty(key) &&
      typeof node[key] === 'object' &&
      node[key] !== null
    ) {
      compressAst(node[key]);
    }
  }
}

export const getFrontMatter = (tree: Root) => {
  const frontmatterNode = tree.children.find(
    (node) => node.type === NODE_TYPES.YAML
  );
  return yaml.load(frontmatterNode?.value || '');
};

export function parseMDX(mdxContent: string): Root {
  const processor = unified().use(remarkParse).use(remarkMdx).use(remarkFrontmatter);
  return processor.parse(mdxContent) as Root;
}

export const stringifyMDX = (tree: Root): string => {
  const processor = createBaseProcessor().use(remarkStringify);
  return String(processor.stringify(tree));
};