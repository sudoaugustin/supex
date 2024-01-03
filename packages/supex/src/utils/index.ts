import path from 'path';
import * as babelParser from '@babel/parser';
import * as babelTraverse from '@babel/traverse';
import chalk from 'chalk';
import esbuild, { BuildResult } from 'esbuild';
import jetpack from 'fs-jetpack';
import { extensions, paths } from 'src/consts';
import { Browser } from 'types';

type Meta = { icon?: string; title?: string };

type Pattern = {
  runAt?: 'document_end' | 'document_start' | 'document_idle';
  globs?: string[];
  matches: string[];
  isMain?: boolean;
  allFrames?: boolean;
  matchBlank?: boolean;
  matchFallback?: boolean;
  excludeGlobs?: string[];
  excludeMatches?: string[];
};

const logBrowser = (browser?: Browser) => (browser ? `${chalk.gray(`[${browser}]`)} ` : '');

export const log = {
  error: (error: any, browser?: Browser) => {
    // esbuild error handling
    if (error.errors) {
      (error.errors as BuildResult['errors']).forEach(({ text, location }) => {
        log.error(`${text}` + (location ? ` (${location.file}:${location.line}:${location.column})` : ''), browser);
      });
    } else {
      console.log(`${logBrowser(browser)}${chalk.bold(chalk.red('✘'))} ${error}`);
    }
  },
  success: (t1: [number, number], msg: string, browser: Browser) => {
    const t2 = process.hrtime(t1);
    const ms = (t2[0] * 1000 + t2[1] / 1e6).toFixed();
    console.log(`${logBrowser(browser)}${chalk.bold(chalk.green('✔'))} ${msg.replace('$ms', `${ms}ms`)}`);
  },
};

export const getConfig = <TConfig>(key: string) => {
  const files = [['package.json', key], [`.${key}rc.json`], [`${key}.config.json`], [`.${key}rc.js`], [`${key}.config.js`]];
  const config = files
    .map(([file, key]) => {
      const configPath = path.join(paths.root, file);
      if (!jetpack.exists(configPath)) return false;
      const content = file.includes('.json') ? jetpack.read(configPath, 'json') : require(configPath);
      return key ? content[key] : content;
    })
    .find(Boolean);

  return config as TConfig;
};

export const getExports = (input: string) => {
  type Exports = { meta: Meta; pattern: Pattern };

  return esbuild.transform(jetpack.read(input) as string, { loader: 'tsx' }).then(({ code }) => {
    const $exports: Exports = { meta: {}, pattern: { matches: [] } };
    babelTraverse.default(babelParser.parse(code, { sourceType: 'module' }), {
      ExportNamedDeclaration(path) {
        if (path.node.declaration?.type === 'VariableDeclaration') {
          path.node.declaration.declarations.forEach(declaration => {
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
};

export const isScriptFile = (file: string) => {
  return extensions.script.includes(file.split('.')[1]);
};

export const generateMeta = (meta: Meta) => {
  return Object.entries(meta).reduce((string, [name, value]) => {
    let $string = string;
    if (value) {
      if (name === 'title') $string += `<title>${value}</title>`;
      else if (name === 'icon') $string += `<link rel="icon" type="image/x-icon" href='./icons/${path.basename(value)}'>`;
      else $string += `<meta name="${name}" content="${value}">`;
    }
    return $string;
  }, '');
};

export const generateType = (name: string, options: string[]) => {
  jetpack.writeAsync(
    path.join(__dirname, '../', 'types', 'runtime', `${name}.ts`),
    `export type ${name.toUpperCase()} = ${options.map(option => `'${option}'`).join(' | ')}`,
  );
};

export const replaceString = (str: string, keywords: {}) => {
  return Object.entries(keywords).reduce((acc, [key, value]) => {
    return acc.replace(new RegExp(key, 'g'), `${value}`);
  }, str);
};
