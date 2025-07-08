import { Node } from "mdast";
import { TagPlugin, PluginContext } from "../tag-plugin";

const USER = "user"; // Assuming this constant exists or should be imported

export const Tags = ['ImageAttachment', 'FileAttachment', 'SpeechPrompt'];

export class ExtractMediaPlugin extends TagPlugin {
  private readonly key = "__agentmark-mediaParts";

  async transform(
    props: Record<string, any>,
    children: Node[],
    pluginContext: PluginContext
  ): Promise<Node[]> {
    const { tagName, scope, createNodeTransformer } = pluginContext;
    
    if (!tagName) throw new Error("Missing tagName in pluginContext");
    
    const isInsideUser = scope.getShared("__insideMessageType");
    if (!(isInsideUser === USER)) {
      throw new Error(
        "ImageAttachment, FileAttachment, and SpeechPrompt tags must be inside User tag."
      );
    }

    const mediaParts = scope.getShared(this.key) || [];

    /* 
     * For ImageAttachment and FileAttachment, we need to ensure the required props
     * are defined (even if they are an empty string or passed from inputProps).
     * This allows for placeholders like image={props.image}, which resolve later during formatting.
     */
    if (tagName === "ImageAttachment") {
      const { image, mimeType } = props;
      if (image == undefined) {
        throw new Error("ImageAttachment must contain an image prop");
      }
      if (image) {
        mediaParts.push({
          type: "image",
          image,
          ...(mimeType && { mimeType }),
        });
      }
    } else if (tagName === "FileAttachment") {
      const { data, mimeType } = props;
      if (data == undefined || mimeType == undefined) {
        throw new Error("FileAttachment must contain data and mimeType props");
      }
      if (data && mimeType) {
        mediaParts.push({
          type: "file",
          data,
          mimeType
        });
      }
    } else if (tagName === "SpeechPrompt") {
      // For SpeechPrompt, we need to process the children content
      // and extract any meaningful content even if it's just expressions
      let speechContent = "";
      
      // Process children to extract the content
      if (children && children.length > 0) {
        const transformer = createNodeTransformer(scope);
        
        const processedChildren = await Promise.all(
          children.map(async (child) => {
            const result = await transformer.transformNode(child);
            return Array.isArray(result) ? result : [result];
          })
        );
        
        const flattenedChildren = processedChildren.flat();
        
        // Use toMarkdown to extract all content including processed expressions
        const { nodeHelpers } = pluginContext;
        speechContent = nodeHelpers.toMarkdown({
          type: 'root',
          children: flattenedChildren
        } as any).trim();
      }
      
      // Always add the speech prompt, even if content is empty
      // This ensures the tag is processed consistently
      mediaParts.push({
        type: "speech",
        content: speechContent || "", // Ensure we always have a string value
        ...(props.voice && { voice: props.voice }),
        ...(props.language && { language: props.language }),
      });
    }

    scope.setShared(this.key, mediaParts);
    return [];
  }
}