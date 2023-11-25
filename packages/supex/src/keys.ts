import path from 'path';
import esbuild from 'esbuild';
import jetpack from 'fs-jetpack';
import sharp from 'sharp';
import postcss from 'src/plugin.postcss';
import type { Browser, Commands, CommandsOut, DeviceOut, Icon, Script } from 'types';
import paths from './paths';
import { generateTypes, getExistFile, getScriptFile, replaceString } from './utils';

type Key = { name: string; require?: boolean; process?: (v: any) => any; validate?: (v: any) => string | boolean };

type BuildIcons = { type: Icon; browser: Browser; isBuild: boolean };

type BuildScript = { type: Script; input: string; browser: Browser; isBuild: boolean; metaIcon?: boolean };

const renderWrapper = (input: string) => `
import React from "react"
import Component from '${input}';
import { createRoot } from 'react-dom/client';

createRoot(document.getElementById('supex-root')).render(<Component />);
`;

function buildIcons({ type, browser, isBuild }: BuildIcons) {
  const icon = getExistFile(path.join(paths.app, type), 'image');
  if (type !== 'icon' && !icon) return undefined;

  const sizes = isBuild ? [16, 32, 48, 96, 128, 256] : [256];
  const $sharp = sharp(icon || path.join(paths.defaults, 'icon.png'));
  return Promise.all(
    sizes.map(async (size) => {
      const filename = `${type}@${size / 16}.png`;
      const filepath = path.join(paths.output, browser, 'assets');
      jetpack.dir(filepath);
      await $sharp.resize(size).toFile(path.join(filepath, filename));
      return [size, `assets/${filename}`];
    }, {}),
  ).then(Object.fromEntries);
}

function buildScript({ type, input, browser, isBuild, metaIcon }: BuildScript) {
  const outdir = path.join(paths.output, browser);
  const isReact = input.includes('.jsx') || input.includes('.tsx');
  const isHTMLRequire = type === 'action' || type === 'new-tab';

  const args = isReact
    ? { stdin: { loader: 'tsx', contents: renderWrapper(input), resolveDir: paths.root } as const, plugins: [postcss()] }
    : { entryPoints: [input] };

  return esbuild
    .build({
      ...args,
      write: false,
      outdir,
      bundle: true,
      minify: !!isBuild,
      logLevel: 'silent',
      sourcemap: !isBuild ? 'inline' : false,
    })
    .then(({ outputFiles }) => {
      const files = outputFiles.map(({ path, text }) => ({ path, text }));

      if (isHTMLRequire) {
        const htmlFile = `${type}.html`;
        const htmlText = jetpack.read(path.join(paths.app, htmlFile)) || (jetpack.read(path.join(paths.defaults, 'index.html')) as string);
        files.push({
          path: path.join(paths.output, browser, htmlFile),
          text: replaceString(htmlText, {
            'SUPEX-JS': `${type}.js`,
            'SUPEX-CSS': `${type}.css`,
            '<!-- SUPEX-ICON -->': metaIcon ? ` <link rel="icon" type="image/x-icon" href='./assets/${type}.png'>` : '',
          }),
        });
      }

      files.filter(Boolean).forEach(({ path, text }) => jetpack.write(path.replace('stdin', type), text));
    })
    .catch((err) => {
      throw err.errors;
    });
}

export default function key({ browser, isBuild, manifest }: { browser: Browser; isBuild: boolean; manifest: 2 | 3 }): Key[] {
  return [
    {
      name: 'name',
      require: true,
      validate: (v: string) => v.length > 45 && "'name' can't be longer than 45 character",
    },
    { name: 'icons', process: () => buildIcons({ type: 'icon', browser, isBuild }) },
    { name: 'author', require: browser === 'edge' },
    {
      // `version` is more restricted in Chrome. So look for chrome version validaton
      name: 'version',
      require: true,
      validate: (v: string) => {
        const nums = v.split('.');
        const length = nums.length;
        return length > 4 && `'version' can only be 1-4 dot-separated integers`;
      },
    },
    {
      name: 'description',
      require: true,
      validate: (v: string) => v.length > 132 && "'description' can't be longer than 132 character",
    },
    {
      name: manifest === 3 ? 'action' : 'browser_action',
      process: async () => {
        const input = getScriptFile('action');
        if (input) {
          await buildScript({ type: 'action', input, browser, isBuild });
          const icons = await buildIcons({ type: 'action-icon', browser, isBuild });
          return { default_icon: icons, default_popup: 'action.html' };
        }
        return undefined;
      },
    },
    {
      name: 'background',
      process: async () => {
        const input = getScriptFile('background');
        if (input) {
          await buildScript({ type: 'background', input, browser, isBuild });
          return manifest === 2 ? { scripts: ['background.js'] } : { service_worker: 'background.js' };
        }
        return undefined;
      },
    },
    {
      name: 'commands',
      process: (commands: Commands) => {
        generateTypes('command', Object.keys(commands));
        return Object.entries(commands).reduce<CommandsOut>((commands, [id, { key, description }]) => {
          commands[id] = {
            description,
            suggested_key:
              typeof key === 'string'
                ? key
                : (Object.entries(key).reduce(
                    (keys, [name, value]) => ({ ...keys, [name === 'window' ? 'windows' : name]: value }),
                    {},
                  ) as DeviceOut),
          };
          return commands;
        }, {});
      },
    },
    {
      name: 'chrome_url_overrides',
      process: async () => {
        return await Promise.all(
          (['new-tab'] as const).map(async (type) => {
            const input = getScriptFile(type);
            if (input) {
              const icon = getExistFile(path.join(paths.app, `${type}-icon`), 'image');
              await Promise.all([
                buildScript({ type, input, metaIcon: !!icon, browser, isBuild }),
                icon && jetpack.moveAsync(icon, path.join(paths.output, browser, 'assets')),
              ]);
              return type;
            }
          }, {}),
        ).then((names) => names.filter(Boolean).reduce((pages, name) => ({ ...pages, [name.replace('-', '')]: `${name}.html` }), {}));
      },
    },
  ];
}
