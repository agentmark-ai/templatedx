import jsep from 'jsep';
import jsepObject from '@jsep-plugin/object';
import {
  MdxJsxFlowElement,
  MdxJsxTextElement,
} from 'mdast-util-mdx';
import { NODE_TYPES, MDX_JSX_ATTRIBUTE_TYPES } from './constants';
import { OperatorFunction } from './types';
import { TagPluginRegistry } from './tag-plugin-registry';
import { PluginContext } from './tag-plugin';
import { hasFunctionBody, getFunctionBody } from './ast-utils';
import { stringifyValue } from './utils';
import {
  isMdxJsxElement,
  isMdxJsxFlowElement,
  isMdxJsxTextElement,
  isParentNode,
} from './ast-utils';
import { FilterRegistry } from './filter-registry';
import { Scope } from './scope';
import type { 
  Root,
  Node, 
  Parent, 
  RootContent,
} from 'mdast';
import { mdxToMarkdown } from "mdast-util-mdx";
import { toMarkdown, Options } from 'mdast-util-to-markdown';

jsep.plugins.register(jsepObject);

const toMdxMarkdown = (tree: any, options?: Options) => {
  return toMarkdown(tree, {
    ...options,
    extensions: [mdxToMarkdown()]
  });
};

const nodeHelpers = {
  isMdxJsxElement,
  isMdxJsxFlowElement,
  isMdxJsxTextElement,
  isParentNode,
  toMarkdown: toMdxMarkdown,
  hasFunctionBody,
  getFunctionBody,
  NODE_TYPES,
};

export class NodeTransformer {
  private scope: Scope;
  private tagPluginRegistry: TagPluginRegistry;
  private filterRegistry: FilterRegistry;
  private useStaticRegistries: boolean;

  constructor(scope: Scope, tagPluginRegistry?: TagPluginRegistry, filterRegistry?: FilterRegistry) {
    this.scope = scope;
    this.useStaticRegistries = !tagPluginRegistry && !filterRegistry;
    this.tagPluginRegistry = tagPluginRegistry || new TagPluginRegistry();
    this.filterRegistry = filterRegistry || new FilterRegistry();
  }

  async transformNode(node: Node): Promise<Node | Node[]> {
    if (
      node.type === NODE_TYPES.MDX_TEXT_EXPRESSION ||
      node.type === NODE_TYPES.MDX_FLOW_EXPRESSION
    ) {
      return this.evaluateExpressionNode(node);
    }

    if (isMdxJsxElement(node)) {
      return await this.processMdxJsxElement(node);
    }

    if (this.isFragmentNode(node)) {
      const processedChildren = await Promise.all(
        (node as Parent).children.map(async (child) => {
          const childTransformer = new NodeTransformer(this.scope, this.useStaticRegistries ? undefined : this.tagPluginRegistry, this.useStaticRegistries ? undefined : this.filterRegistry);
          const result = await childTransformer.transformNode(child);
          return Array.isArray(result) ? result : [result];
        })
      );

      return processedChildren.flat();
    }

    if (isParentNode(node)) {
      const newNode = { ...node } as Parent;

      const processedChildren = await Promise.all(
        node.children.map(async (child) => {
          const childTransformer = new NodeTransformer(this.scope, this.useStaticRegistries ? undefined : this.tagPluginRegistry, this.useStaticRegistries ? undefined : this.filterRegistry);
          const result = await childTransformer.transformNode(child);
          return Array.isArray(result) ? result : [result];
        })
      );

      newNode.children = processedChildren.flat() as RootContent[];

      return newNode;
    }

    return node;
  }

  private isFragmentNode(node: Node): boolean {
    return (
      isMdxJsxElement(node) &&
      (node as any).name === null &&
      (node as any).children &&
      (node as any).children.length > 0
    );
  }

  private evaluateExpressionNode(node: any): Node | Node[] {
    const raw = node.value;
    const pipeMatch = raw.match(/^([^|]+)\|([^|]+)$/);
    const isFilter = pipeMatch && pipeMatch[1] && pipeMatch[2];
    
    if (isFilter) {
      try {
        const leftSide = pipeMatch[1].trim();
        const rightSide = pipeMatch[2].trim();
        
        let value;
        try {
          // Try to parse the left side as a JavaScript expression
          const expression = jsep(leftSide);
          value = this.evaluateJsepExpression(expression);
        } catch (error) {
          // If parsing fails, treat it as a variable
          value = this.resolveVariable(leftSide);
        }
        
        const filterExpression = jsep(rightSide);
        const result = this.applyFilter(filterExpression, value);
        
        return {
          type: NODE_TYPES.TEXT,
          value: String(result),
        } as Node;
      } catch (error) {
        throw new Error(`Error evaluating filter: ${(error as Error).message}`);
      }
    }
    
    try {
      const expression = jsep(raw);
      const result = this.evaluateJsepExpression(expression);
      
      return {
        type: NODE_TYPES.TEXT,
        value: String(result),
      } as Node;
    } catch (error) {
      throw new Error(`Error evaluating expression: ${(error as Error).message}`);
    }
  }

  private evaluateJsepExpression(node: jsep.Expression): any {
    if (node.type === 'CallExpression') {
      return this.evaluateCallExpression(node as jsep.CallExpression);
    }

    if (node.type === 'Identifier') {
      return this.resolveVariable((node as jsep.Identifier).name);
    }

    if (node.type === 'MemberExpression') {
      return this.evaluateMemberExpression(node as jsep.MemberExpression);
    }

    if (node.type === 'ObjectExpression') {
      return this.evaluateObjectExpression(node as any);
    }

    if (node.type === 'ArrayExpression') {
      return this.evaluateArrayExpression(node as jsep.ArrayExpression);
    }

    if (node.type === 'BinaryExpression') {
      return this.evaluateBinaryExpression(node as jsep.BinaryExpression);
    }

    if (node.type === 'UnaryExpression') {
      return this.evaluateUnaryExpression(node as jsep.UnaryExpression);
    }

    if (node.type === 'Literal') {
      return (node as jsep.Literal).value;
    }

    throw new Error(`Unsupported expression type: ${node.type}`);
  }

  private evaluateCallExpression(node: jsep.CallExpression): any {
    const { callee } = node;
    if (!callee || callee.type !== 'Identifier') {
      throw new Error(`Only calls to registered filters are allowed.`);
    }

    const functionName = (callee as jsep.Identifier).name;
    const filterFunction = this.useStaticRegistries 
      ? FilterRegistry.get(functionName) 
      : this.filterRegistry.get(functionName);
    if (!filterFunction) {
      throw new Error(`Filter "${functionName}" is not registered.`);
    }

    const args = node.arguments.map((arg: jsep.Expression) => this.evaluateJsepExpression(arg));
    const [input, ...rest] = args;
    return filterFunction(input, ...rest);
  }

  resolveVariable(variablePath: string): any {
    if (!variablePath) {
      throw new Error(`Variable path cannot be empty.`);
    }

    const parts = variablePath.split('.');
    let current = this.scope.get(parts[0]);
    
    if (current === undefined) {
      throw new Error(`Variable "${parts[0]}" is not defined.`);
    }

    for (let i = 1; i < parts.length; i++) {
      if (current === null || current === undefined) {
        throw new Error(`Cannot access property "${parts[i]}" of ${current}.`);
      }
      current = current[parts[i]];
    }

    return current;
  }

  private applyFilter(filterExpression: jsep.Expression, value: any): any {
    if (filterExpression.type === 'CallExpression') {
      const callExpr = filterExpression as jsep.CallExpression;
      const { callee } = callExpr;
      if (!callee || callee.type !== 'Identifier') {
        throw new Error(`Only calls to registered filters are allowed.`);
      }

      const functionName = (callee as jsep.Identifier).name;
      const filterFunction = this.useStaticRegistries 
        ? FilterRegistry.get(functionName) 
        : this.filterRegistry.get(functionName);
      if (!filterFunction) {
        throw new Error(`Filter "${functionName}" is not registered.`);
      }

      const args = callExpr.arguments.map((arg: jsep.Expression) => this.evaluateJsepExpression(arg));
      return filterFunction(value, ...args);
    }

    if (filterExpression.type === 'Identifier') {
      const functionName = (filterExpression as jsep.Identifier).name;
      const filterFunction = this.useStaticRegistries 
        ? FilterRegistry.get(functionName) 
        : this.filterRegistry.get(functionName);
      if (!filterFunction) {
        throw new Error(`Filter "${functionName}" is not registered.`);
      }

      return filterFunction(value);
    }

    throw new Error(`Unsupported filter expression type: ${filterExpression.type}`);
  }

  private evaluateMemberExpression(node: jsep.MemberExpression): any {
    const object = this.evaluateJsepExpression(node.object);
    const property = node.computed 
      ? this.evaluateJsepExpression(node.property)
      : (node.property as jsep.Identifier).name;
    
    return object[property];
  }

  private evaluateObjectExpression(node: any): any {
    const result: any = {};
    for (const property of node.properties) {
      const key = property.key.type === 'Identifier' 
        ? property.key.name 
        : this.evaluateJsepExpression(property.key);
      const value = this.evaluateJsepExpression(property.value);
      result[key] = value;
    }
    return result;
  }

  private evaluateArrayExpression(node: jsep.ArrayExpression): any {
    return node.elements.map((element: jsep.Expression | null) => element ? this.evaluateJsepExpression(element) : null);
  }

  private evaluateBinaryExpression(node: jsep.BinaryExpression): any {
    const left = this.evaluateJsepExpression(node.left);
    const right = this.evaluateJsepExpression(node.right);
    
    const operators: Record<string, OperatorFunction> = {
      '+': (l, r) => (l as any) + (r as any),
      '-': (l, r) => (l as any) - (r as any),
      '*': (l, r) => (l as any) * (r as any),
      '/': (l, r) => (l as any) / (r as any),
      '%': (l, r) => (l as any) % (r as any),
      '==': (l, r) => l == r,
      '!=': (l, r) => l != r,
      '===': (l, r) => l === r,
      '!==': (l, r) => l !== r,
      '<': (l, r) => l < r,
      '<=': (l, r) => l <= r,
      '>': (l, r) => l > r,
      '>=': (l, r) => l >= r,
      '&&': (l, r) => l && r,
      '||': (l, r) => l || r,
    };

    const operator = operators[node.operator];
    if (!operator) {
      throw new Error(`Unsupported binary operator: ${node.operator}`);
    }

    return operator(left, right);
  }

  private evaluateUnaryExpression(node: jsep.UnaryExpression): any {
    const argument = this.evaluateJsepExpression(node.argument);
    
    const operators: Record<string, (x: any) => any> = {
      '-': (x) => -x,
      '+': (x) => +x,
      '!': (x) => !x,
    };

    const operator = operators[node.operator];
    if (!operator) {
      throw new Error(`Unsupported unary operator: ${node.operator}`);
    }

    return operator(argument);
  }

  private async processMdxJsxElement(
    node: MdxJsxFlowElement | MdxJsxTextElement
  ): Promise<Node | Node[]> {
    try {
      const tagName = node.name!;
      const plugin = this.useStaticRegistries 
        ? TagPluginRegistry.get(tagName) 
        : this.tagPluginRegistry.get(tagName);
      if (plugin) {
        const props = this.evaluateProps(node);
        const pluginContext: PluginContext = {
          createNodeTransformer: (scope: Scope) => new NodeTransformer(scope, this.useStaticRegistries ? undefined : this.tagPluginRegistry, this.useStaticRegistries ? undefined : this.filterRegistry),
          scope: this.scope,
          tagName,
          nodeHelpers,
        };
        const result = await plugin.transform(props, node.children, pluginContext);
        return result;
      } else {
        const newNode = { ...node } as Parent;

        const processedChildren = await Promise.all(
          node.children.map(async (child: any) => {
            const childTransformer = new NodeTransformer(this.scope, this.useStaticRegistries ? undefined : this.tagPluginRegistry, this.useStaticRegistries ? undefined : this.filterRegistry);
            const result = await childTransformer.transformNode(child);
            return Array.isArray(result) ? result : [result];
          })
        );

        newNode.children = processedChildren.flat() as RootContent[];
        return newNode;
      }
    } catch (error) {
      throw new Error(
        `Error processing MDX JSX Element: ${(error as Error).message}`
      );
    }
  }

  evaluateProps(node: any): Record<string, any> {
    const props: Record<string, any> = {};
    
    (node.attributes || []).forEach((attr: any) => {
      if (attr.type === MDX_JSX_ATTRIBUTE_TYPES.MDX_JSX_EXPRESSION_ATTRIBUTE) {
        const expression = jsep(attr.value);
        props[attr.name] = this.evaluateJsepExpression(expression);
      } else if (attr.type === MDX_JSX_ATTRIBUTE_TYPES.MDX_JSX_ATTRIBUTE) {
        const value = attr.value;
        if (value && value.type === MDX_JSX_ATTRIBUTE_TYPES.MDX_JSX_ATTRIBUTE_VALUE_EXPRESSION) {
          const expression = jsep(value.value);
          props[attr.name] = this.evaluateJsepExpression(expression);
        } else {
          props[attr.name] = value ? stringifyValue(value) : true;
        }
      }
    });

    return props;
  }
}

export const transformTree = async (
  tree: Root,
  props: Record<string, any> = {},
  shared: Record<string, any> = {},
  tagPluginRegistry?: TagPluginRegistry,
  filterRegistry?: FilterRegistry
): Promise<Root> => {
  const scope = new Scope({ props }, shared);
  const transformer = new NodeTransformer(scope, tagPluginRegistry, filterRegistry);
  const processedTree = await transformer.transformNode(tree);
  return processedTree as Root;
};
