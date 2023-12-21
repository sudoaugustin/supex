import path from 'path';
import archiver from 'archiver';
import arg from 'arg';
import chalk from 'chalk';
import chokidar from 'chokidar';
import jetpack from 'fs-jetpack';
import build, { Change } from 'src/build';
import { browsers } from 'src/consts';
import paths from 'src/paths';
import zip from 'src/zip';
import { Browser } from 'types';

type Command = 'build';

const args = arg({ '--help': Boolean, '--browser': String });
const command = args._[0] as Command;
const isBuild = command === 'build';
const $browsers = (args['--browser']?.split(',') || browsers) as Browser[];
const { version } = require('./package.json');

console.log(chalk.blue(chalk.bold(`Supex ${version}`)));

function buildForBrowsers(change?: Change) {
  return Promise.all($browsers.map(async (browser) => build({ browser, isBuild, change })));
}

isBuild && jetpack.remove(paths.output); // Clean the output dir to avoid `file already exits` error

// First buld for both build and watch
buildForBrowsers().then(() => {
  $browsers.forEach((browser) => {
    if (isBuild) {
      zip(browser);
    } else {
      import('web-ext').then(({ cmd }: any) => {
        cmd.run(
          {
            target: browser === 'chrome' ? 'chromium' : 'firefox-desktop',
            noInput: true,
            sourceDir: path.join(paths.output, browser),
          },
          { shouldExitProgram: false },
        );
      });
    }
  });
});

!isBuild &&
  chokidar.watch(paths.root, { ignored: paths.ignores, ignoreInitial: true }).on('all', (event, path) => {
    buildForBrowsers({ event, path });
  });
