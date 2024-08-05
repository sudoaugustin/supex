import path from 'path';
import arg from 'arg';
import chalk from 'chalk';
import esbuild from 'esbuild';
import { solidPlugin } from 'esbuild-plugin-solid';
import jetpack from 'fs-jetpack';
import { browsers, extensions, paths } from 'src/consts';
import css from 'src/plugins/css';
import html from 'src/plugins/html';
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

const { dependencies = {}, devDependencies = {} } = jetpack.read(path.join(paths.root, 'package.json'), 'json');

const packages = Object.keys({ ...dependencies, ...devDependencies });

$browsers.forEach(async (browser, index) => {
  const port = await getPort();
  const outdir = path.join(paths.root, '.supex', browser);
  const options = { browser, isBuild, outdir, server: `http://localhost:${port}`, packages };
  const isSolid = packages.includes('solid-js');

  const context = await esbuild.context({
    outdir,
    bundle: true,
    minify: isBuild,
    plugins: [
      isSolid && solidPlugin(),
      css(options),
      html(options),
      manifest(options),
      postbuild({ ...options, isHeadless }),
      logger(options),
    ].filter(Boolean),
    logLevel: 'silent',
    metafile: true,
    loader: { '.css': 'empty' },
    sourcemap: isBuild ? false : 'inline',
    entryPoints: extensions.script.map(ext => `${paths.app}/**/*.${ext}`), // TODO: Check the project folder to compile only ts,tsx or js,jsx
    ...(isSolid ? { jsx: 'preserve', jsxImportSource: 'solid-js' } : { jsx: 'automatic' }),
    define: { BROWSER: `${browser}` },
  });

  if (isBuild) {
    jetpack.remove(outdir);
    context
      .rebuild()
      .catch(() => {
        //Don't do anything. Logger plugin covered it.
      })
      .finally(() => context.dispose());
  } else {
    await context.watch();
    // Serve only once to save resources.
    index === 0 && context.serve({ port, servedir: outdir });
  }
});
