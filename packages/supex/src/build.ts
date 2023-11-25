import path from 'path';
import chalk from 'chalk';
import jetpack from 'fs-jetpack';
import keys from 'src/keys';
import type { Browser } from 'types';
import paths from './paths';

type Args = { browser: Browser; isBuild: boolean };

export default async function build({ browser, isBuild }: Args) {
  const start = new Date().getMilliseconds();
  const manifest = browser === 'firefox' ? 2 : 3;
  const $keys = keys({ browser, manifest, isBuild });
  const $package = jetpack.read(paths.config, 'json');
  const getValue = (v: any) => !!v && (v[browser] || v.default || v);

  // Build manifest.json
  Promise.all(
    $keys.map(async ({ name, require, process, validate }) => {
      const value = process ? await process($package[name]) : getValue($package[name]);
      const message = require && !value ? `'${name}' is missing in package.json` : validate?.(value);
      if (message) throw message;
      return [name, value];
    }),
  )
    .then((values) => {
      const properties = [['manifest_version', manifest], ...values.filter(([name, value]) => !!value)];
      jetpack.write(path.join(paths.output, browser, 'manifest.json'), Object.fromEntries(properties));
      const stop = new Date().getMilliseconds();
      console.log(`🦄 Done for ${browser} in ${stop - start}ms`);
    })
    .catch((err) => {
      if (Array.isArray(err)) {
        err.forEach(({ text, location }: any) => {
          const rootFolder = paths.root.split('/').pop();
          const { file, line, column } = location;
          console.log(chalk.red(`🚫 ${text} (${file.split(`${rootFolder}/`)[1]}:${line}:${column}) [${browser}]`));
        });
      } else console.log(chalk.red(`🚫 ${err} [${browser}]`));
    });
}
