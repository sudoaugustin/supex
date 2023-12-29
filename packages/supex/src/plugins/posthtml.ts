import path from 'path';
import type { Plugin } from 'esbuild';
import jetpack from 'fs-jetpack';
import { paths, patterns } from 'src/consts';
import { generateMeta, getExports, isScriptFile, replaceString } from 'src/utils';
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

export default function html({ port, outdir, isBuild }: ESPluginOptions): Plugin {
  return {
    name: 'posthtml',
    setup(build) {
      if (!isBuild) {
        jetpack.write(
          path.join(outdir, 'reload.js'),
          `new EventSource('http://localhost:${port}/esbuild').addEventListener('change', () => location.reload())`,
        );
      }
      build.onEnd(error => {
        if (error.errors.length === 0) {
          const appFiles = jetpack.find(paths.app);

          appFiles
            .filter(isScriptFile)
            .filter(file => !file.includes('app/contents/') && !file.includes('app/worker'))
            .forEach(async file => {
              const fileWithoutExt = file.split('.')[0];
              const name = path.basename(fileWithoutExt);
              const html = jetpack.read(`${path.join(paths.root, fileWithoutExt)}.html`) || defaultHTML;
              const output = path.join(build.initialOptions.outdir as string, fileWithoutExt.replace('app/', ''));
              const isCSSExist = jetpack.exists(`${output}.css`);
              const isOverride = patterns.overrides.some(pattern => file.includes(pattern));
              const { meta = {} } = isOverride ? await getExports(file) : {};

              if (isOverride) {
                const icon = appFiles.find(file => file.includes(`${fileWithoutExt}-icon`));
                if (icon) {
                  meta.icon = icon;
                  jetpack.copy(icon, path.join(build.initialOptions.outdir as string, 'icons', path.basename(icon)), { overwrite: true });
                }
              }

              jetpack.write(
                `${output}.html`,
                replaceString(html, {
                  // Warning: Only use relative path from html for safty.
                  '</head>': `${isCSSExist ? `<link href="./${name}.css" rel="stylesheet" />` : ''} ${generateMeta(meta)} </head>`,
                  '</body>': `<script src="./${name}.js"></script> ${isBuild ? '' : '<script src="./reload.js"></script>'} </body>`,
                }),
              );
            });
        }
      });
    },
  };
}
