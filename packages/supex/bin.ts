import path from 'path';
import arg from 'arg';
import chalk from 'chalk';
import esbuild from 'esbuild';
import jetpack from 'fs-jetpack';
import { browsers, extensions, paths } from 'src/consts';
import logger from 'src/plugins/logger';
import manifest from 'src/plugins/manifest';
import postbuild from 'src/plugins/postbuild';
import postcss from 'src/plugins/postcss';
import posthtml from 'src/plugins/posthtml';
import checkFiles from 'src/utils/checkFiles';
import { Browser } from 'types';

type Command = 'build';

const args = arg({ '--help': Boolean, '--browser': String });
const port = 2000;
const command = args._[0] as Command;
const isBuild = command === 'build';
const $browsers = (args['--browser']?.split(',') || browsers) as Browser[];
const { version } = require('./package.json');

console.log(chalk.blue(chalk.bold(`Supex ${version}`)));

checkFiles();

$browsers.forEach(async (browser, index) => {
  const outdir = path.join(paths.root, '.supex', browser);
  const options = { port, browser, isBuild, outdir };

  const context = await esbuild.context({
    outdir,
    bundle: true,
    minify: isBuild,
    plugins: [postcss(), posthtml(options), manifest(options), postbuild(options), logger(options)],
    logLevel: 'silent',
    sourcemap: isBuild ? false : 'inline',
    entryPoints: extensions.script.map(ext => `${paths.app}/**/*.${ext}`), // TODO: Check the project folder to compile only ts,tsx or js,jsx
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
    index === 0 && context.serve({ port, servedir: outdir });
  }
});
