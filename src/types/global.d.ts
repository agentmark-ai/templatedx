import type { ForEachProps } from "../components-plugins/for-each";
import type { IfProps, ElseIfProps, ElseProps } from "../components-plugins/conditional";
import type { RawProps } from "../components-plugins/raw";

declare global {
  const capitalize: TemplateDX.Filters['capitalize'];
  const upper: TemplateDX.Filters['upper'];
  const lower: TemplateDX.Filters['lower'];
  const truncate: TemplateDX.Filters['truncate'];
  const abs: TemplateDX.Filters['abs'];
  const join: TemplateDX.Filters['join'];
  const round: TemplateDX.Filters['round'];
  const replace: TemplateDX.Filters['replace'];
  const urlencode: TemplateDX.Filters['urlencode'];
  const dump: TemplateDX.Filters['dump'];

  interface MDXProvidedComponents {
    ForEach: <T = any>(props: ForEachProps<T>) => any;
    If: React.FC<IfProps>;
    ElseIf: React.FC<ElseIfProps>;
    Else: React.FC<ElseProps>;
    Raw: React.FC<RawProps>;
  }
}

export {};
