import { ForEachPlugin, Tags as ForEachTags } from './components-plugins/for-each';
import { ConditionalPlugin, Tags as ConditionalTags } from './components-plugins/conditional';
import { RawPlugin, Tags as RawTags } from './components-plugins/raw';
import { ComponentPluginRegistry } from './component-plugin-registry';

import { FilterRegistry } from "./filter-registry";
import {
  capitalize,
  upper,
  lower,
  truncate,
  abs,
  join,
  round,
  replace,
  urlencode,
  dump,
} from "./filter-plugins";


ComponentPluginRegistry.register(new ForEachPlugin(), ForEachTags);
ComponentPluginRegistry.register(new ConditionalPlugin(), ConditionalTags);
ComponentPluginRegistry.register(new RawPlugin(), RawTags);

FilterRegistry.register("capitalize", capitalize);
FilterRegistry.register("upper", upper);
FilterRegistry.register("lower", lower);
FilterRegistry.register("truncate", truncate);
FilterRegistry.register("abs", abs);
FilterRegistry.register("join", join);
FilterRegistry.register("round", round);
FilterRegistry.register("replace", replace);
FilterRegistry.register("urlencode", urlencode);
FilterRegistry.register("dump", dump)