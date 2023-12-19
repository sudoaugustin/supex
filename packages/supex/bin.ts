import arg from 'arg';
import chokidar from 'chokidar';
import jetpack from 'fs-jetpack';
import build from 'src/build';
import paths from 'src/paths';

type Command = 'build' | 'version';

const args = arg({ '--help': Boolean, '--browser': String });
const command = args._[0] as Command;

if (command === 'version') {
  const { version } = require('./package.json');
  console.log(`Supex v${version}`);
} else {
  const isBuild = command === 'build';
  function buildForBrowsers(isBuild = false) {
    browsers.map((browser) => build({ browser, isBuild }));
  }

  const browsers = (['chrome', 'firefox'] as const).filter((browser) => {
    const $browser = args['--browser'];
    return $browser ? $browser === browser : true;
  });
  isBuild && jetpack.remove(paths.output);
  buildForBrowsers(isBuild); // First build for both watch and build mode.
  !isBuild && chokidar.watch(paths.root, { ignored: paths.ignores }).on('change', buildForBrowsers); // If watch mode, listen for file changes and rebuild.
}
