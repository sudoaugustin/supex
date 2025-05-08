import type { Compiler, RspackPluginInstance } from '@rspack/core';
import { ESPluginOptions } from 'types';

export default class ParentPlugin implements RspackPluginInstance {
  apply(compiler: Compiler) {}
  constructor(public options: ESPluginOptions) {}
}
