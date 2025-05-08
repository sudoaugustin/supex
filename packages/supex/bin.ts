import path from 'path';
import { rspack } from '@rspack/core';
import arg from 'arg';
import chalk from 'chalk';
import esbuild from 'esbuild';
import { solidPlugin } from 'esbuild-plugin-solid';
import jetpack from 'fs-jetpack';
import { InspectTreeResult } from 'fs-jetpack/types';
import glob from 'glob';
import { browsers, extensions, paths } from 'src/consts';
import SupexCSSPlugin from 'src/plugins/css';
import SupexHTMLPlugin from 'src/plugins/html';
import logger from 'src/plugins/logger';
import manifest from 'src/plugins/manifest';
import postbuild from 'src/plugins/postbuild';
import { getPort } from 'src/utils';
import preflight from 'src/utils/preflight';
import { Browser } from 'types';

type Command = 'build';

const args = arg({ '--browser': String, '--headless': Boolean });
const command = args._[0] as Command;
const isBuild = command === 'build';
const $browsers = (args['--browser']?.split(',') || browsers) as Browser[];
const isHeadless = !!args['--headless'];
const { version } = require('./package.json');

console.log(chalk.blue(chalk.bold(`Supex ${version}`)));

preflight();

async function main() {
  const { dependencies = {}, devDependencies = {} } = jetpack.read(path.join(paths.root, 'package.json'), 'json');
  const port = await getPort();
  const entries = glob
    .sync(`app/**/*.{${extensions.script.toString()}}`)
    .reduce((entries, entry) => ({ ...entries, [entry.split('.')[0].replace('app/', '')]: path.join(paths.root, entry) }), {});
  const packages = Object.keys({ ...dependencies, ...devDependencies });

  jetpack.remove(paths.output);
  $browsers.forEach(async (browser, index) => {
    const outdir = path.join(paths.output, browser);
    const options = { browser, isBuild, outdir, server: `http://localhost:${port}`, packages };
    const isSolid = packages.includes('solid-js');

    const compiler = rspack({
      entry: entries,
      output: { path: path.join(paths.output, browser) },
      mode: isBuild ? 'production' : 'development',
      module: {
        rules: [
          {
            test: /\.ts$/,
            type: 'javascript/auto',
            exclude: [/node_modules/],
            use: {
              loader: 'builtin:swc-loader',
              options: { jsc: { parser: { syntax: 'typescript' } } },
            },
          },
          {
            test: /\.jsx$|\.tsx$/,
            type: 'javascript/auto',
            use: {
              loader: 'builtin:swc-loader',
              options: {
                jsc: {
                  parser: { jsx: true, syntax: 'ecmascript' },
                  transform: {
                    react: {
                      pragma: 'React.createElement',
                      pragmaFrag: 'React.Fragment',
                      throwIfNamespace: true,
                      development: false,
                      useBuiltins: false,
                    },
                  },
                },
              },
            },
          },
        ],
      },
      resolve: {
        tsConfig: path.resolve(paths.root, './tsconfig.json'),
      },
      experiments: { css: true },
      plugins: [new SupexCSSPlugin(options), new SupexHTMLPlugin(options)],
    });

    compiler.run((err, stats) => {
      // console.log(stats);
    });

    // const compiler = rspack({ entry: extensions.script.map(ext => `${paths.app}/**/*.${ext}`) });
    // const context = await esbuild.context({
    //   outdir,
    //   bundle: true,
    //   minify: isBuild,
    //   plugins: [
    //     isSolid && solidPlugin(),
    //     css(options),
    //     html(options),
    //     manifest(options),
    //     postbuild({ ...options, isHeadless }),
    //     logger(options),
    //   ].filter(Boolean),
    //   logLevel: 'silent',
    //   metafile: true,
    //   loader: { '.css': 'empty' },
    //   sourcemap: isBuild ? false : 'inline',
    //   entryPoints: extensions.script.map(ext => `${paths.app}/**/*.${ext}`), // TODO: Check the project folder to compile only ts,tsx or js,jsx
    //   ...(isSolid ? { jsx: 'preserve', jsxImportSource: 'solid-js' } : { jsx: 'automatic' }),
    // });
    // if (isBuild) {
    //   jetpack.remove(outdir);
    //   context
    //     .rebuild()
    //     .catch(() => {
    //       //Don't do anything. Logger plugin covered it.
    //     })
    //     .finally(() => context.dispose());
    // } else {
    //   await context.watch();
    //   // Serve only once to save resources.
    //   index === 0 && context.serve({ port, servedir: outdir });
    // }
  });
}

main();
