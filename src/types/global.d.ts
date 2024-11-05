import { ForEachProps } from "../element-plugins/for-each";
import type { IfProps, ElseIfProps, ElseProps } from "../element-plugins/conditional";
import type { RawProps } from "../element-plugins/raw";

declare global {

  interface MDXProvidedComponents {
    ForEach: <T = any>(props: ForEachProps<T>) => any;
    If: React.FC<IfProps>;
    ElseIf: React.FC<ElseIfProps>;
    Else: React.FC<ElseProps>;
    Raw: React.FC<RawProps>;
  }

  interface MessageItem {
    role: 'user' | 'assistant';
    message: string;
    // Add other properties if necessary
  }
}

export {}; // Ensures this file is treated as a module
