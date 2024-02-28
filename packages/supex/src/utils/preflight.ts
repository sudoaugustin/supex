import path from 'path';
import chalk from 'chalk';
import jetpack from 'fs-jetpack';
import { extensions, paths, patterns } from 'src/consts';
import treeify from 'treeify';
import { log } from '.';

export default function preflight() {
  const files = jetpack.list(paths.root) || [];
  const requires = ['app', 'public', 'supex.json'].map(name => {
    const isMissing = !files.includes(name);
    return [`${isMissing ? chalk.red(`${name} (not found)`) : chalk.green(name)}`, isMissing];
  });
  if (requires.some(([_, value]) => value)) {
    log.error('Missing requires files.');
    console.log(treeify.asTree(Object.fromEntries(requires), false, false));
    process.exit();
  }

  const appFiles = jetpack.find(paths.app, { matching: `*.{${extensions.script.toString()}}` });
  const unknowns = appFiles.filter(file => {
    const { icons, overrides, ...rest } = patterns;
    return [...overrides, ...Object.values(rest), ...Object.values(icons), path.join('app', 'devtools', 'panels')].every(
      pattern => !file.includes(pattern),
    );
  });

  if (unknowns.length > 0) {
    log.error('Please move or delete these files from /app.');
    console.log(
      treeify.asTree(
        unknowns.reduce((files, file) => ({ ...files, [file]: true }), {}),
        false,
        false,
      ),
    );
    process.exit();
  }
}
