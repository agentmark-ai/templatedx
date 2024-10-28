import { MapPlugin } from './element-plugins/for-each';
import { ConditionalPlugin } from './element-plugins/conditional';
import { RawPlugin } from './element-plugins/raw';
import { ElementPluginRegistry } from './element-plugin-registry';

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
} from "./filter-plugins";


ElementPluginRegistry.register(new MapPlugin(), ['ForEach']);
ElementPluginRegistry.register(new ConditionalPlugin(), ['If', 'ElseIf', 'Else']);
ElementPluginRegistry.register(new RawPlugin(), ['Raw']);

FilterRegistry.register("capitalize", capitalize);
FilterRegistry.register("upper", upper);
FilterRegistry.register("lower", lower);
FilterRegistry.register("truncate", truncate);
FilterRegistry.register("abs", abs);
FilterRegistry.register("join", join);
FilterRegistry.register("round", round);
FilterRegistry.register("replace", replace);
FilterRegistry.register("urlencode", urlencode);