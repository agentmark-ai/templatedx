import { Node, Parent } from "mdast";
import { ElementPlugin, PluginContext } from "../element-plugin";

export class MapPlugin extends ElementPlugin {
  async transform(
    props: Record<string, any>,
    children: Node[],
    context: PluginContext
  ): Promise<Node[] | Node> {
    const { scope, createNodeTransformer, nodeTypeHelpers } = context;
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
      throw new Error(`The 'arr' prop for <ForEach> must be an array.`);
    }

    const itemVariableName = props['as'] || 'item';
    const indexVariableName = props['indexAs'] || 'index';

    const resultNodesPerItem = await Promise.all(
      arr.map(async (item: any, index: number) => {
        const itemContext = scope.createChild(
          {
            [itemVariableName]: item,
            [indexVariableName]: index,
          }
        );
  
        const itemTransformer = createNodeTransformer(itemContext);
  
        const processedChildren = await Promise.all(
          children.map(async (child) => {
            const result = await itemTransformer.transformNode(child);
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
  }
}
