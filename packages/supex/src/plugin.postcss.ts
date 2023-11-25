import type { Plugin } from 'esbuild';
import jetpack from 'fs-jetpack';
import { nanoid } from 'nanoid';
import path from 'path';
import { getConfig } from './utils';

type Config = { plugins: { [k: string]: {} } | (string | [string, {}])[]; syntax: unknown };

export default function postcss(): Plugin {
  return {
    name: 'postcss',
    setup: (build) => {
      const postcss = require('postcss');
      const { outdir = '' } = build.initialOptions;
      build.onLoad({ filter: /\.css$/ }, async (args) => {
        const input = args.path;
        const output = path.join(outdir, 'styles', `${path.basename(args.path, '.css')}.${nanoid()}.css`);
        const { plugins, ...options } = getConfig<Config>('postcss');
        const resolvedPlugins = (Array.isArray(plugins) ? plugins : Object.entries(plugins)).map((plugin) => {
          if (typeof plugin === 'string') return require(plugin);
          const [name, options] = plugin;
          return Object.keys(options).length === 0 ? require(name) : require(name)(options);
        });
        const result = await postcss(resolvedPlugins).process(jetpack.read(input), { ...options, to: input, from: output });
        return { contents: result.css, loader: 'css' };
      });
    },
  };
}
