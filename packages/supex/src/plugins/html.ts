import path from 'path';
import type { Plugin } from 'esbuild';
import jetpack from 'fs-jetpack';
import { paths, patterns } from 'src/consts';
import { generateMeta, getCSSImports, getExports, hashFile, isScriptFile, replaceString } from 'src/utils';
import { ESPluginOptions } from 'types';

const defaultHTML = `
  <!DOCTYPE html>
  <html lang="en">

  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  </head>

  <body></body>
  </html>`;

export default function html({ server, outdir, browser, isBuild }: ESPluginOptions): Plugin {
  return {
    name: 'supex-html',
    setup(build) {
      if (!isBuild) {
        jetpack.write(
          path.join(outdir, 'reload.js'),
          `new EventSource('${server}/esbuild').addEventListener('change', (e) => {
            const { added, removed, updated } = JSON.parse(e.data)
            if (!added.length && !removed.length && updated.every(path => path.includes('.css'))) {
              for (const link of document.getElementsByTagName("link")) {
                const url = new URL(link.href)
                if (updated.includes(url.pathname)) {
                  const next = link.cloneNode()
                  next.href = updated[0] + '?' + Math.random().toString(36).slice(2)
                  next.onload = () => link.remove()
                  link.parentNode.insertBefore(next, link.nextSibling)
                  return
                }
              }
            }

            location.reload();
          })`,
        );
      }

      build.onEnd(({ errors, metafile }) => {
        if (errors.length === 0 && metafile) {
          const appFiles = jetpack.find(paths.app);

          appFiles
            .filter(isScriptFile)
            .filter(file => !file.includes('app/contents/') && !file.includes('app/worker'))
            .forEach(async file => {
              const fileWithoutExt = file.split('.')[0];
              const name = path.basename(fileWithoutExt);
              const html = jetpack.read(`${path.join(paths.root, fileWithoutExt)}.html`) || defaultHTML;
              const output = path.join(outdir, fileWithoutExt.replace('app/', ''));
              const cssFiles = [
                ...getCSSImports(metafile.inputs, file).map(file => hashFile(file, 'css')),
                ...Object.values(metafile.outputs)
                  .filter(({ entryPoint, cssBundle }) => entryPoint === file && cssBundle)
                  .map(({ cssBundle = '' }) => cssBundle.replace(`.supex/${browser}/`, '')),
              ];
              const isOverride = patterns.overrides.some(pattern => file.includes(pattern));
              const { meta = {} } = isOverride ? await getExports(file) : {};

              if (isOverride) {
                const icon = appFiles.find(file => file.includes(`${fileWithoutExt}-icon`));
                if (icon) {
                  meta.icon = icon;
                  jetpack.copy(icon, path.join(outdir as string, 'icons', path.basename(icon)), { overwrite: true });
                }
              }

              jetpack.write(
                `${output}.html`,
                replaceString(html, {
                  // Warning: Only use relative path from html for safty.
                  '</head>': `${
                    cssFiles.length
                      ? cssFiles.map(cssFile => `<link href="${isBuild ? '' : server}/${cssFile}" rel="stylesheet" />`).join('\n')
                      : ''
                  } ${generateMeta(meta)} </head>`,
                  '</body>': `<script src="./${name}.js"></script> ${isBuild ? '' : '<script src="./reload.js"></script>'} </body>`,
                }),
              );
            });
        }
      });
    },
  };
}
