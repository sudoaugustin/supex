import path from 'path';
import chalk from 'chalk';
import jetpack from 'fs-jetpack';
import keys from 'src/keys';
import type { Browser } from 'types';
import { BrowserObj } from 'types/utils';
import paths from './paths';
import { logError, logSuccess } from './utils/log';

type Args = { browser: Browser; isBuild: boolean; change?: Change };

type IsInvalidArgs = { name: string; process: boolean; changePath: string };

export type Change = { event: 'change' | 'add' | 'addDir' | 'unlink' | 'unlinkDir'; path: string };

const cache = {} as BrowserObj<{ [k: string]: unknown }>;

function isInvalid({ name, process, changePath }: IsInvalidArgs) {
  switch (name) {
    case 'commands':
    case 'incognito':
    case 'permissions':
    case 'optional_permissions':
    case 'host_permissions':
      return changePath === paths.config;

    case 'icons':
      return changePath.split('.')[0] === path.join(paths.app, 'icon');

    case 'declarative_net_request':
      return path.dirname(changePath) === path.join(paths.app, 'request-rules');

    case 'web_accessible_resources':
      return changePath.includes(path.join(paths.root, 'public'));

    default:
      return process ? true : changePath === paths.config;
  }
}

export default async function build({ browser, isBuild, change }: Args) {
  const startTime = process.hrtime();
  const config = jetpack.read(paths.config, 'json');
  const manifest = browser === 'firefox' ? 2 : 3;
  const getValue = (v: any) => !!v && (v[browser] || v.default || v);

  return Promise.all(
    keys({ browser, manifest, isBuild }).map(async ({ name, process }) => {
      const invalid = change ? isInvalid({ name, process: !!process, changePath: change.path }) : true;
      const value = invalid ? (process ? await process(config[name], config) : getValue(config[name])) : cache[browser][name];
      return [name, value];
    }),
  )
    .then((values) => {
      const result = Object.fromEntries([['manifest_version', manifest], ...values.filter(([name, value]) => !!value)]);

      cache[browser] = result; // Cache the mainfest.json to use for watch mode.
      jetpack.write(path.join(paths.output, browser, 'manifest.json'), result);

      const endTime = process.hrtime(startTime);
      const durationInMs = (endTime[0] * 1000 + endTime[1] / 1e6).toFixed();
      logSuccess(`Compiled in ${durationInMs}ms`, browser);
    })
    .catch((err) => {
      if (Array.isArray(err)) {
        err.forEach(({ text, location }: any) => {
          const { file, line, column } = location;
          logError(`${text} (${file}:${line}:${column})`, browser);
        });
      } else logError(`${err}`, browser);
    });
}
