import path from 'path';
import chalk from 'chalk';
import jetpack from 'fs-jetpack';
import { extensions, paths, patterns } from 'src/consts';
import treeify from 'treeify';

export default function checkFiles() {
  const files = jetpack.list(paths.root) || [];
  const requires = ['app', 'public', 'supex.json'].map(name => {
    const isMissing = !files.includes(name);
    return [`${isMissing ? chalk.red(`${name} ✘`) : chalk.green(name)}`, isMissing];
  });
  if (requires.some(([_, value]) => value)) {
    console.log('Missing requires files.');
    console.log(treeify.asTree(Object.fromEntries(requires), false, false));
    process.exit();
  }

  const unknowns = jetpack.find(paths.app, { matching: `*.{${extensions.script.toString()}}` }).filter(file => {
    const { icons, overrides, ...rest } = patterns;
    return ![...overrides, ...Object.values(rest), ...Object.values(icons), path.join('app', 'devtools', 'panels')].some(files.includes);
  });

  if (unknowns.length > 0) {
  }

  const unsupports = [];
}
