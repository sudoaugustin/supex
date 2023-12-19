import path from 'path';
import jetpack from 'fs-jetpack';
import { Meta, Page } from 'types';
import paths from '../paths';

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

export const generateMeta = (meta: Meta) => {
  return Object.entries(meta).reduce((string, [name, value]) => {
    let $string = string;
    if (value) {
      if (name === 'title') $string += `<title>${value}</title>`;
      else if (name === 'icon') $string += `<link rel="icon" type="image/x-icon" href='./assets/${path.basename(value)}'>`;
      else $string += `<meta name="${name}" content="${value}">`;
    }
    return $string;
  }, '');
};

export const getFilesList = (folder: string, extensions: string | string[]) => {
  return jetpack
    .find(path.join(paths.app, folder), {
      matching: typeof extensions === 'string' ? `*.${extensions}` : `*.{${extensions.toString()}}`,
      recursive: false,
    })
    .map(($path) => path.join(paths.root, $path));
};

export const getExistFile = (path: string, type: 'image' | 'script') => {
  const formats = {
    image: ['svg', 'png', 'jpg'],
    script: ['js', 'ts', 'jsx', 'tsx'],
  };
  return formats[type].map((format) => `${path}.${format}`).find(jetpack.exists);
};

export const getScriptFile = (type: Page) => {
  const scoutIndex = type === 'devtools';
  return getExistFile(path.join(...[paths.root, 'app', type, scoutIndex && 'index'].filter(Boolean)), 'script');
};

export const replaceString = (str: string, keywords: {}) => {
  return Object.entries(keywords).reduce((acc, [key, value]) => {
    return acc.replace(new RegExp(key, 'g'), `${value}`);
  }, str);
};
