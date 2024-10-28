import { MapPlugin } from './plugins/for-each';
import { ConditionalPlugin } from './plugins/conditional';
import { ElementPluginRegistry } from './element-plugin-registry';

ElementPluginRegistry.register(new MapPlugin(), ['ForEach']);
ElementPluginRegistry.register(new ConditionalPlugin(), ['If', 'ElseIf', 'Else']);