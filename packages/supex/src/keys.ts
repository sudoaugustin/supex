import path from 'path';
import * as babelParser from '@babel/parser';
import * as babelTraverse from '@babel/traverse';
import chalk from 'chalk';
import esbuild from 'esbuild';
import jetpack from 'fs-jetpack';
import sharp from 'sharp';
import postcss from 'src/plugin.postcss';
import type { Browser, Commands, CommandsOut, DeviceOut, Icon, Meta, Page, Pattern } from 'types';
import { nonOptionalPermissions, permissions } from './consts/permissions';
import paths from './paths';
import { generateMeta, getExistFile, getFilesList, getScriptFile, replaceString } from './utils';

type Key = { name: string; process?: (v: any, config: any) => any };

type BuildIcon = { type: Icon; browser: Browser; isBuild: boolean };

type BuildPage = { type: Page; head?: string; input: string; browser: Browser; isBuild: boolean };

function buildType(name: string, options: string[]) {
  jetpack.write(
    path.join(__dirname, '../', 'types', 'runtime', `${name}.ts`),
    `export type ${name.toUpperCase()} = ${options.map((option) => `'${option}'`).join(' | ')}`,
  );
}

function buildIcon({ type, browser, isBuild }: BuildIcon) {
  const icon = getExistFile(path.join(paths.app, type), 'image');
  if (type !== 'icon' && !icon) return undefined;

  const sizes = isBuild ? [16, 32, 48, 96, 128, 256] : [256];
  const $sharp = sharp(icon || path.join(paths.defaults, 'icon.png'));
  return Promise.all(
    sizes.map((size) => {
      const filename = `${type}@${size / 16}.png`;
      const filepath = path.join(paths.output, browser, 'assets');
      jetpack.dir(filepath);
      $sharp.resize(size).toFile(path.join(filepath, filename)); // Don't await these pricess
      return [size, `assets/${filename}`];
    }, {}),
  ).then(Object.fromEntries);
}

function buildPage({ type, head = '', input, browser, isBuild }: BuildPage) {
  const outdir = path.join(paths.output, browser);
  const { name } = path.parse(input);
  const isReactFile = input.includes('.jsx') || input.includes('.tsx');
  const isRequireHTML = type !== 'worker' && type !== 'content';

  const args = isReactFile
    ? {
        stdin: {
          loader: 'tsx',
          contents: `import React from 'react';
                     import Component from '${input}';
                     import { createRoot } from 'react-dom/client';

                     const root = document.createElement('div');
                     document.body.appendChild(root)
                     createRoot(root).render(<Component />);`,
          resolveDir: paths.root,
        } as const,
      }
    : { entryPoints: [input] };

  return esbuild
    .build({
      ...args,
      write: false,
      outdir,
      bundle: true,
      minify: !!isBuild,
      plugins: [postcss()],
      logLevel: 'silent',
      sourcemap: !isBuild ? 'inline' : false,
    })
    .then(({ outputFiles }) => {
      const files = outputFiles.map(({ path, text }) => ({ path, text }));
      const $name =
        type === 'panel'
          ? `devtools/panels/${name}`
          : type === 'devtools'
            ? 'devtools/index'
            : type === 'content'
              ? `${type}-${name}`
              : type;

      if (isRequireHTML) {
        const htmlText =
          jetpack.read(path.join(paths.app, `${$name}.html`)) || (jetpack.read(path.join(paths.defaults, 'index.html')) as string);
        const isCSSExist = files.find(({ path }) => path.includes('.css'));
        files.push({
          path: path.join(paths.output, browser, 'index.html'),
          text: replaceString(htmlText, {
            // Warning: Don't change ${name} to ${$name}. Used relative path from html bec absolute paths doesn't work for html files inside a folder.
            '</head>': `${isCSSExist ? `<link href="./${name}.css" rel="stylesheet" />` : ''} ${head} </head>`,
            '</body>': `<script src="./${name}.js"></script> </body>`,
          }),
        });
      }

      return files.filter(Boolean).map((file) => {
        const { dir, ext } = path.parse(file.path);
        const $path = path.join(dir, `${$name}${ext}`);
        // if (type === 'content') {
        //   const { dir, ext, name } = path.parse(file.path);
        //   $path = path.join(dir, `content-${name}${ext}`);
        // }
        // if (type === 'devtools') {
        //   const { dir, ext } = path.parse(file.path);
        //   $path = path.join(dir, `devools${ext}`);
        // }
        // if (type === 'panel') {
        //   const { name } = path.parse(input);
        //   const { dir, ext } = path.parse(file.path);
        //   $path = path.join(dir, 'panels', `${name}${ext}`);
        // }
        jetpack.write($path, file.text);
        return $path;
      });
    })
    .catch((err) => {
      throw err.errors;
    });
}

function getExports(input: string) {
  type Exports = { meta: Meta; pattern: Pattern };

  return esbuild.transform(jetpack.read(input) as string, { loader: 'tsx' }).then(({ code }) => {
    const $exports: Exports = { meta: {}, pattern: { matches: [] } };
    babelTraverse.default(babelParser.parse(code, { sourceType: 'module' }), {
      ExportNamedDeclaration(path) {
        if (path.node.declaration?.type === 'VariableDeclaration') {
          path.node.declaration.declarations.forEach((declaration) => {
            if (declaration.init && declaration.init.type === 'ObjectExpression') {
              const properties: Record<string, unknown> = {};
              declaration.init.properties.forEach((prop: any) => {
                if (prop.value.type === 'ArrayExpression') {
                  const arrayValues: unknown[] = [];
                  prop.value.elements.forEach((element: { type: string; value: unknown }) => {
                    element.type === 'StringLiteral' && arrayValues.push(element.value);
                  });
                  properties[prop.key.name] = arrayValues;
                } else {
                  properties[prop.key.name] = prop.value.value;
                }
              });
              //@ts-ignore
              $exports[declaration.id.name] = properties;
            } else {
              //@ts-ignore
              $exports[declaration.id.name] = declaration.init.value;
            }
          });
        }
      },
    });
    return $exports;
  });
}

function filterPermission($permissions: string[] | undefined, browser: Browser) {
  return ($permissions || []).filter((permission) => permissions[browser].includes(permission as never));
}

export default function keys({ browser, isBuild, manifest }: { browser: Browser; isBuild: boolean; manifest: 2 | 3 }): Key[] {
  return [
    {
      name: 'name',
    },
    {
      name: 'icons',
      process: () => buildIcon({ type: 'icon', browser, isBuild }),
    },
    {
      name: 'author',
    },
    {
      name: 'version',
    },
    {
      name: 'description',
    },
    {
      name: manifest === 3 ? 'action' : 'browser_action',
      process: async () => {
        const input = getScriptFile('action');
        if (input) {
          await buildPage({ type: 'action', input, browser, isBuild });
          const icons = await buildIcon({ type: 'action-icon', browser, isBuild });
          const { meta } = await getExports(input);
          return { default_icon: icons, default_title: meta.title, default_popup: 'action.html' };
        }
      },
    },
    {
      name: 'background',
      process: async () => {
        const input = getScriptFile('worker');
        if (input) {
          await buildPage({ type: 'worker', input, browser, isBuild });
          return manifest === 2 ? { scripts: ['./worker.js'] } : { service_worker: './worker.js' };
        }
      },
    },
    {
      name: 'commands',
      process: (commands: Commands) => {
        if (commands) {
          buildType('command', Object.keys(commands));
          return Object.entries(commands).reduce<CommandsOut>((commands, [id, { key, description }]) => {
            commands[id] = {
              description,
              suggested_key:
                typeof key === 'string'
                  ? { default: key } // Firefox don't allow `string` type.
                  : (Object.entries(key).reduce(
                      (keys, [name, value]) => ({ ...keys, [name === 'window' ? 'windows' : name]: value }),
                      {},
                    ) as DeviceOut),
            };
            return commands;
          }, {});
        }
      },
    },
    {
      name: 'chrome_url_overrides',
      process: () => {
        const pages = [
          { name: 'newtab', file: 'home' },
          { name: 'history', file: 'history' },
          { name: 'bookmarks', file: 'bookmarks' },
        ] as const;

        return Promise.all(
          pages
            .filter(({ name }) => {
              const isSupported = browser === 'edge' || browser === 'chrome' ? true : name === 'newtab';
              !isSupported && console.log(chalk.yellow(`⚠️  Skipped chrome_url_overrides.${name.replace('-', '')} for ${browser}.`));
              return isSupported;
            })
            .map(async ({ file, name }) => {
              const input = getScriptFile(file);
              if (input) {
                const icon = getExistFile(path.join(paths.app, `${file}-icon`), 'image');
                const { meta } = await getExports(input);
                await Promise.all([
                  buildPage({ type: file, input, head: generateMeta({ ...meta, icon }), browser, isBuild }),
                  icon && jetpack.copyAsync(icon, path.join(paths.output, browser, 'assets', path.basename(icon)), { overwrite: true }),
                ]);
                return [name, `${file}.html`];
              }
            }, {}),
        ).then((names) => Object.fromEntries(names.filter(Boolean)));
      },
    },
    {
      name: 'content_scripts',
      process: () => {
        return Promise.all(
          getFilesList('contents', ['ts', 'js']).map(async (input) => {
            const files = await buildPage({ input, type: 'content', browser, isBuild });
            const { pattern } = await getExports(input);
            const relativePaths = files.map(($path) =>
              path.relative(path.join(paths.output, browser, 'manifest.json'), $path).replace('../', './'),
            );

            return {
              js: relativePaths.filter((path) => path.includes('.js')),
              css: relativePaths.filter((path) => path.includes('.css')),
              matches: pattern.matches,
              exclude_matches: pattern.excludeMatches,
              include_globs: pattern.globs,
              exclude_globs: pattern.excludeGlobs,
              match_about_blank: pattern.matchBlank,
              match_origin_as_fallback: browser === 'chrome' ? pattern.matchFallback : undefined,
              run_at: pattern.runAt,
              world: browser === 'chrome' ? (pattern.isMain ? 'MAIN' : 'ISOLATED') : undefined,
              all_frames: pattern.allFrames,
            };
          }),
        );
      },
    },
    {
      name: 'declarative_net_request',
      process: async () => {
        const resources = await Promise.all(
          getFilesList('request-rules', 'json')
            .map((input) => {
              const { rules, enabled = true } = jetpack.read(input, 'json');
              if (Array.isArray(rules) && rules.length > 0 && rules[0]) {
                const filename = path.basename(input);
                const outputPath = path.join('request-rules', filename);
                jetpack.write(
                  path.join(paths.output, browser, outputPath),
                  rules.map((rule, index) => ({ id: index + 1, ...(rule as object) })),
                );

                return { id: filename.replace('.json', ''), path: outputPath, enabled };
              }
            })
            .filter(Boolean),
        );
        return { rule_resources: resources };
      },
    },
    {
      name: 'devtools_page',
      process: async () => {
        const input = getScriptFile('devtools');
        if (input) {
          await buildPage({ type: 'devtools', input, browser, isBuild });
          const panels = getFilesList('devtools/panels', ['js', 'jsx', 'ts', 'tsx']);
          if (panels) {
            panels.forEach((panel) => {
              buildPage({ type: 'panel', input: panel, browser, isBuild });
            });
          }
          return 'devtools/index.html';
        }
      },
    },
    {
      name: 'incognito',
      process: (incognito) => {
        if (incognito === 'split' && browser === 'firefox') {
          console.log(chalk.yellow(`⚠️  Incognito 'split' has been fallback to 'spanning' in ${browser}.`));
          return 'spanning';
        }
        return incognito;
      },
    },
    {
      name: 'permissions',
      process: (_, config) => filterPermission(config.permissions?.required, browser),
    },
    {
      name: 'optional_permissions',
      process: (_, config) => {
        return filterPermission(config.permissions?.optional, browser).filter(
          (permission) => !nonOptionalPermissions[browser].includes(permission as never),
        );
      },
    },
    {
      name: 'host_permissions',
      process: (_, config) => config.hosts,
    },
    {
      name: 'web_accessible_resources',
      process: () => {
        const publicPath = path.join(paths.root, 'public');
        const outputPath = path.join(paths.output, browser, 'public');
        jetpack[isBuild ? 'copy' : 'symlink'](publicPath, outputPath);
        return manifest === 2 ? ['public/*'] : [{ resources: ['public/*'], extension_ids: ['*'], matches: ['*://*/*'] }];
      },
    },
  ];
}
