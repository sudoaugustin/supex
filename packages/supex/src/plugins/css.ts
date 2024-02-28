import path from 'path';
import CleanCSS from 'clean-css';
import { Plugin } from 'esbuild';
import jetpack from 'fs-jetpack';
import { extensions, paths } from 'src/consts';
import { getConfig, hashFile } from 'src/utils';
import { ESPluginOptions } from 'types';

type PostCSSConfig = { plugins: { [k: string]: {} } | (string | [string, {}])[]; syntax: unknown };

const cleanCSS = new CleanCSS({});

export default function css({ outdir, isBuild, packages }: ESPluginOptions): Plugin {
  return {
    name: 'supex-css',
    setup: build => {
      build.onLoad({ filter: /\.(css|sass|scss)$/, namespace: 'file' }, async ({ path: input }) => {
        let css = '';
        const type = path.extname(input).replace('.', '') as (typeof extensions.style)[number];
        const output = path.join(outdir, hashFile(input, 'css'));
        const isModule = input.includes('.module.');

        if (type === 'css') {
          const postcss = require('postcss');
          const { plugins = [], ...options } = getConfig<PostCSSConfig>('postcss');
          const resolvedPlugins = (Array.isArray(plugins) ? plugins : Object.entries(plugins)).map(plugin => {
            if (typeof plugin === 'string') return require(plugin);
            const [name, options] = plugin;
            return Object.keys(options).length === 0 ? require(name) : require(name)(options);
          });
          const result = await postcss(resolvedPlugins).process(jetpack.read(input) || '', { ...options, to: output, from: input });
          css = result.css;
        } else if (type === 'sass' || type === 'scss') {
          if (!packages.includes('sass')) throw `${input.replace(paths.root, '')} require 'sass' module.`;
          const sass = require('sass');
          const result = sass.compile(input);
          css = result.css;
        }

        !isModule && jetpack.write(output, isBuild ? cleanCSS.minify(css).styles : css);

        return { contents: isModule ? css : '', loader: isModule ? 'local-css' : 'empty' } as const;
      });

      // build.onLoad({ filter: /\.(css|sass|scss)$/, namespace: 'file' }, async ({ path: input }) => {
      //   if (packages.includes('sass')) {
      //     const sass = require('sass');
      //     const result = sass.compile(input);
      //     return emptyResult;
      //   }
      // });
    },
  };
}
