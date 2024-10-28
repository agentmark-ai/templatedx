import { Plugin } from 'unified';
import { Root } from 'mdast';
import { visit } from 'unist-util-visit';
import {
  MdxJsxFlowElement,
  MdxJsxTextElement,
} from 'mdast-util-mdx-jsx';
import stringify from 'remark-stringify';
import { unified } from 'unified';

export interface ExtractedField {
  name: string;
  content: string;
}

interface ExtractFieldsOptions {
  fields: string[];
  storage: ExtractedField[];
}

const extractFields: Plugin<[ExtractFieldsOptions], Root> = (options) => {
  const { fields, storage } = options;

  return (tree: Root) => {
    visit(
      tree,
      ['mdxJsxFlowElement', 'mdxJsxTextElement'],
      (node) => {
        if (
          (node.type === 'mdxJsxFlowElement' || node.type === 'mdxJsxTextElement') &&
          typeof (node as MdxJsxFlowElement | MdxJsxTextElement).name === 'string'
        ) {
          const jsxNode = node as MdxJsxFlowElement | MdxJsxTextElement;
          const name = jsxNode.name || '';

          if (fields.includes(name)) {
            const extractedContent = unified()
              .use(stringify)
              .stringify({ type: 'root', children: jsxNode.children })
              .trim();

            storage.push({ name, content: extractedContent });
          }
        }
      }
    );
  };
};

export default extractFields;
