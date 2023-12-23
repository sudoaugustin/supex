import path from 'path';
import type { Plugin } from 'esbuild';
import jetpack from 'fs-jetpack';
import type { Browser } from 'types';
import paths from '../consts/paths';
import { generateMeta, getExports, log, replaceString } from '../utils';

type Options = { appFiles: string[]; browser: Browser };

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

let t1: [number, number];

export default function html({ browser, appFiles }: Options): Plugin {
  return {
    name: 'postbuild',
    setup(build) {
      build.onStart(() => {
        t1 = process.hrtime();
      });

      build.onEnd(() => {
        (build.initialOptions.entryPoints as string[])
          .filter(file => !file.includes('app/contents/') && !file.includes('app/worker'))
          .forEach(async file => {
            const fileWithoutExt = file.split('.')[0];
            const name = path.basename(fileWithoutExt);
            const html = jetpack.read(`${fileWithoutExt}.html`) || defaultHTML;
            const output = fileWithoutExt.replace(paths.app, build.initialOptions.outdir as string);
            const isCSSExist = jetpack.exists(`${output}.css`);
            const isOverride = ['/app/home', '/app/bookmakrs', '/app/history'].some(pattern => file.includes(pattern));
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
                '</body>': `<script src="./${name}.js"></script> </body>`,
              }),
            );
          });

        log.success(t1, 'Compiled pages in $ms', browser);
      });
    },
  };
}
