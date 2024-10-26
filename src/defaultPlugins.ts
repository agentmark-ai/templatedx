import { registerPlugin } from './pluginRegistry';
import type {
  Parent,
  Node,
  Literal
} from 'mdast';

registerPlugin('Map', async (props, children, pluginAPI) => {
  const { createNodeTransformer, getContext, nodeTypeHelpers } = pluginAPI;
  const context = getContext();
  const { NODE_TYPES } = nodeTypeHelpers;
  function areAllListItems(resultNodesPerItem: Node[][]): boolean {
    return resultNodesPerItem.every((processedNodes) =>
      processedNodes.every(
        (n: Node) =>
          n.type === NODE_TYPES.LIST || n.type === NODE_TYPES.LIST_ITEM
      )
    );
  }

  function collectListItems(resultNodesPerItem: Node[][]): Node[] {
    return resultNodesPerItem.flatMap((processedNodes) =>
      processedNodes.flatMap((n: Node) => {
        if (n.type === NODE_TYPES.LIST) {
          return (n as Parent).children;
        } else if (n.type === NODE_TYPES.LIST_ITEM) {
          return n;
        } else {
          return [];
        }
      })
    );
  }

  const arr = props['arr'];
  if (!Array.isArray(arr)) {
    throw new Error(`The 'arr' prop for <Map> must be an array.`);
  }

  const itemVariableName = props['as'] || 'item';
  const indexVariableName = props['indexAs'] || 'index';

  const resultNodesPerItem = await Promise.all(
    arr.map(async (item: any, index: number) => {
      context[itemVariableName] = item;
      context[indexVariableName] = index;
      const processedChildren = await Promise.all(
        children.map(async (child) => {
          const transformer = createNodeTransformer(context);
          const result = await transformer.transformNode(child);
          return Array.isArray(result) ? result : [result];
        })
      );

      return processedChildren.flat();
    })
  );
  const resultNodes = resultNodesPerItem.flat();
  if (areAllListItems(resultNodesPerItem)) {
    return [
      {
        type: NODE_TYPES.LIST,
        ordered: false,
        spread: false,
        children: collectListItems(resultNodesPerItem),
      } as Node,
    ];
  } else {
    return resultNodes;
  }
});

registerPlugin('PromptDX.Conditional', async (_props, children, pluginAPI) => {
  const { nodeTypeHelpers, createNodeTransformer, getContext } = pluginAPI;
  const { NODE_TYPES, isMdxJsxElement } = nodeTypeHelpers;
  const context = getContext();
  let conditionMet = false;
  let resultNodes: Node[] = [];

  function isWhitespace(node: Node) {
    return node.type === NODE_TYPES.TEXT &&
      /^\s*$/.test((node as Literal).value);
  }

  for (const child of children) {
    if (isWhitespace(child)) continue;

    if (!isMdxJsxElement(child)) {
      throw new Error(
        `Invalid node type '${child.type}' inside <Conditional> component.`
      );
    }
    const childTransformer = createNodeTransformer(context);

    const elementName = (child as any).name;
    const childProps = childTransformer.evaluateProps(child as any);

    if (
      (elementName === 'If' || elementName === 'ElseIf') &&
      !conditionMet
    ) {
      const condition = childProps['condition'];
      if (typeof condition !== 'boolean') {
        throw new Error(
          `The 'condition' prop for <${elementName}> must be a boolean.`
        );
      }

      if (condition) {
        conditionMet = true;
        const processedChildren = [];
        for (const grandChild of (child as Parent).children) {
          const grandChildTransformer = createNodeTransformer(context);
          const result = await grandChildTransformer.transformNode(grandChild);
          processedChildren.push(
            ...(Array.isArray(result) ? result : [result])
          );
        }
        resultNodes = processedChildren;
        break;
      }
    } else if (elementName === 'Else' && !conditionMet) {
      conditionMet = true;
      const processedChildren = [];
      for (const grandChild of (child as Parent).children) {
        const grandChildTransformer = createNodeTransformer(context);
        const result = await grandChildTransformer.transformNode(grandChild);
        processedChildren.push(
          ...(Array.isArray(result) ? result : [result])
        );
      }
      resultNodes = processedChildren;
      break;
    } else if (!conditionMet) {
      throw new Error(
        `Unexpected element <${elementName}> inside <Conditional> component.`
      );
    }
  }

  return resultNodes;
});