import type { Root } from 'mdast';
import jsep from 'jsep';

export interface ImportMap {
  [componentName: string]: string;
}

export interface ComponentASTs {
  [componentName: string]: Root['children'];
}

export type OperatorFunction = (
  left: any,
  nodeRight: jsep.Expression,
) => any;

export type ContentLoader = (modulePath: string) => Promise<string>;

export interface ExtractedField {
  name: string;
  value: any;
}
