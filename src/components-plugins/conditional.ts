import { Node } from "mdast";
import { ComponentPlugin, PluginContext } from "../component-plugin";

export interface IfProps {
  condition: boolean;
  children: any;
}

export interface ElseIfProps {
  condition: boolean;
  children: any;
}

export interface ElseProps {
  children: any;
}

export const Tags = ['If', 'ElseIf', 'Else'];

export class ConditionalPlugin extends ComponentPlugin {
  async transform(
    props: Record<string, any>,
    children: Node[],
    context: PluginContext
  ): Promise<Node[] | Node> {
    const { scope, createNodeTransformer, componentName } = context;

    if (!componentName) {
      throw new Error("The 'componentName' must be provided in the context.");
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

    if (componentName === "If" || componentName === "ElseIf") {
      const condition = props["condition"];
      if (typeof condition !== "boolean") {
        throw new Error(
          `The 'condition' prop for <${componentName}> must be a boolean.`
        );
      }
      if (condition) {
        shouldRender = true;
      }
    } else if (componentName === "Else") {
      shouldRender = true;
    } else {
      throw new Error(`Unsupported element type: ${componentName}`);
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
