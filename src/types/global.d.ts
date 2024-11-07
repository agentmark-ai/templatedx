import type { ForEachProps } from "../tag-plugins/for-each";
import type { IfProps, ElseIfProps, ElseProps } from "../tag-plugins/conditional";
import type { RawProps } from "../tag-plugins/raw";

export interface BaseMDXProvidedComponents {
  ForEach: <T = any>(props: ForEachProps<T>) => any;
  If: React.FC<IfProps>;
  ElseIf: React.FC<ElseIfProps>;
  Else: React.FC<ElseProps>;
  Raw: React.FC<RawProps>;
}

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
  interface MDXProvidedComponents extends BaseMDXProvidedComponents {}
}

export {};
