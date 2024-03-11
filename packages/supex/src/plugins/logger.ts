import { Plugin } from 'esbuild';
import { log } from 'src/utils';
import { ESPluginOptions } from 'types';

let t1: [number, number];

export default function logger({ browser }: ESPluginOptions): Plugin {
  return {
    name: 'logger',
    setup: build => {
      build.onStart(() => {
        t1 = process.hrtime();
      });
      build.onEnd(error => {
        if (error.errors.length === 0) {
          log.success(t1, 'Compiled in $ms', browser);
        } else {
          log.error(error, browser);
        }
      });
    },
  };
}
