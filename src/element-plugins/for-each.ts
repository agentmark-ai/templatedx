import { Node } from 'mdast';
import { ElementPlugin, PluginContext } from '../element-plugin';
import { Root } from 'mdast';
import { parse } from '../ast-utils';

export class ForEachPlugin extends ElementPlugin {
  async transform(
    props: Record<string, any>,
    children: Node[],
    context: PluginContext
  ): Promise<Node[] | Node> {
    const { scope, createNodeTransformer } = context;

    const arr = props['arr'];
    if (!Array.isArray(arr)) {
      throw new Error(`The 'arr' prop for <ForEach> must be an array.`);
    }

    if (children.length !== 1) {
      throw new Error(`ForEach expects exactly one child function.`);
    }

    const childNode = children[0];

    if (childNode.type !== 'mdxFlowExpression') {
      throw new Error('ForEach expects a function as its child.');
    }

    const expression = (childNode as any).value;

    // Extract the function parameter name and body code string from the expression
    const functionRegex = /^\s*\(\s*([a-zA-Z_$][0-9a-zA-Z_$]*)\s*\)\s*=>\s*\(\s*([\s\S]*)\s*\)\s*$/;
    const match = functionRegex.exec(expression);
    if (!match) {
      throw new Error('Child must be an arrow function of the form (param) => (body)');
    }

    const paramName = match[1];
    const functionBodyCode = match[2];

    const functionBodyTree = parse(functionBodyCode) as Root;


    const unwrappedNodes = this.unwrapFragments(functionBodyTree.children);

    const resultNodesPerItem = await Promise.all(
      arr.map(async (item: any, index: number) => {
        const itemScope = scope.createChild({ [paramName]: item});

        const itemTransformer = createNodeTransformer(itemScope);

        const processedChildren = await Promise.all(
          unwrappedNodes.map(async (child) => {
            const result = await itemTransformer.transformNode(child);
            return Array.isArray(result) ? result : [result];
          })
        );

        return processedChildren.flat();
      })
    );

    const resultNodes = resultNodesPerItem.flat();
    return resultNodes;
  }

  private unwrapFragments(nodes: Node[]): Node[] {
    const unwrappedNodes: Node[] = [];

    for (const node of nodes) {
      if (this.isFragmentNode(node)) {
        if ((node as Parent).children) {
          const childNodes = this.unwrapFragments((node as Parent).children);
          unwrappedNodes.push(...childNodes);
        }
      } else {
        unwrappedNodes.push(node);
      }
    }

    return unwrappedNodes;
  }

  private isFragmentNode(node: Node): boolean {
    return (
      node.type === 'mdxJsxFlowElement' &&
      (node as any).name === null
    );
  }
}
