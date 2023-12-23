import path from 'path';
import esbuild from 'esbuild';
import type { BuildOptions } from 'types';
import { extensions } from './consts';
import paths from './consts/paths';
import postbuild from './plugins/postbuild';
import postcss from './plugins/postcss';

export default async function buildPages({ outdir, browser, isBuild, appFiles }: BuildOptions) {
  const scriptFiles = appFiles
    .filter(file => extensions.script.includes(file.split('.')[1]))
    // Custom bookmakrs and history pages are only supported in chrome.
    .filter(file => (browser === 'chrome' ? true : !file.includes('app/bookmarks.') && !file.includes('app/history.')))
    .map($path => path.join(paths.root, $path));

  const context = await esbuild.context({
    entryPoints: scriptFiles,
    outdir,
    bundle: true,
    minify: isBuild,
    plugins: [postcss(), postbuild({ appFiles, browser })],
    logLevel: 'silent',
    sourcemap: isBuild ? false : 'inline',
  });

  return context.watch();
  // return isBuild ? context.rebuild() : context.watch();
}
