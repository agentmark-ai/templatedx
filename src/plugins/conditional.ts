import { Node } from "mdast";
import { ElementPlugin, PluginContext } from "../element-plugin";

export class ConditionalPlugin extends ElementPlugin {
  async transform(
    props: Record<string, any>,
    children: Node[],
    context: PluginContext
  ): Promise<Node[] | Node> {
    const { scope, createNodeTransformer, elementName } = context;

    if (!elementName) {
      throw new Error("The 'elementName' must be provided in the context.");
    }

    let conditionMet = scope.getLocal("conditionMet");
    if (conditionMet === undefined) {
      scope.setLocal("conditionMet", false);
      conditionMet = false;
    }

    if (conditionMet) {
      return [];
    }

    let shouldRender = false;

    if (elementName === "If" || elementName === "ElseIf") {
      const condition = props["condition"];
      if (typeof condition !== "boolean") {
        throw new Error(
          `The 'condition' prop for <${elementName}> must be a boolean.`
        );
      }
      if (condition) {
        shouldRender = true;
      }
    } else if (elementName === "Else") {
      shouldRender = true;
    } else {
      throw new Error(`Unsupported element type: ${elementName}`);
    }

    if (shouldRender) {
      scope.setLocal("conditionMet", true);
      const childScope = scope.createChild();
      const transformer = createNodeTransformer(childScope);

      const results: Node[] = [];
      for (const child of children) {
        const transformed = await transformer.transformNode(child);
        if (Array.isArray(transformed)) {
          results.push(...transformed);
        } else if (transformed) {
          results.push(transformed);
        }
      }

      return results;
    }

    return [];
  }
}
