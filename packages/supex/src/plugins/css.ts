import path from 'path';
import type { Compiler } from '@rspack/core';
import CleanCSS from 'clean-css';
import jetpack from 'fs-jetpack';
import { extensions, paths } from 'src/consts';
import { getConfig, hashFile, isStyleFile } from 'src/utils';
import ParentPlugin from './parent';

type PostCSSConfig = { plugins: { [k: string]: {} } | (string | [string, {}])[]; syntax: unknown };

const cleanCSS = new CleanCSS({});
const PLUGIN_NAME = 'SUPEX_CSS';

export default class SupexCSSPlugin extends ParentPlugin {
  apply(compiler: Compiler) {
    compiler.hooks.compilation.tap(PLUGIN_NAME, (compilation, { normalModuleFactory }) => {
      // compilation.hooks.buildModule.tap(PLUGIN_NAME, console.log);
      normalModuleFactory.hooks.resolve.tap(PLUGIN_NAME, async resolve => {
        if (isStyleFile(resolve.request)) {
          console.log(resolve);
          let css = '';
          const output = path.join(compiler.outputPath, hashFile(resolve.request, 'css'));
          const styleType = path.extname(resolve.request).replace('.', '') as (typeof extensions.style)[number];
          const isStyleModule = resolve.request.includes('.module.');
          if (styleType === 'css') {
            const postcss = require('postcss');
            const { plugins = [], ...options } = getConfig<PostCSSConfig>('postcss');
            const resolvedPlugins = (Array.isArray(plugins) ? plugins : Object.entries(plugins)).map(plugin => {
              if (typeof plugin === 'string') return require(plugin);
              const [name, options] = plugin;
              return Object.keys(options).length === 0 ? require(name) : require(name)(options);
            });
            const result = await postcss(resolvedPlugins).process(jetpack.read(resolve.request) || '', {
              ...options,
              to: output,
              from: resolve.request,
            });
            css = result.css;
          } else if (styleType === 'sass' || styleType === 'scss') {
            if (!this.options.packages.includes('sass')) throw `${resolve.request.replace(paths.root, '')} require 'sass' module.`;
            const sass = require('sass');
            const result = sass.compile(resolve.request);
            css = result.css;
          }
          !isStyleModule && jetpack.write(output, compiler.watchMode ? css : cleanCSS.minify(css).styles);
        }
      });
    });
  }
}
