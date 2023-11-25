import path from 'path';
import jetpack from 'fs-jetpack';
import { Script } from 'types';
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

export const getExistFile = (path: string, type: 'image' | 'script') => {
  const formats = {
    image: ['svg', 'png', 'jpg'],
    script: ['js', 'ts', 'jsx', 'tsx'],
  };
  return formats[type].map((format) => `${path}.${format}`).find(jetpack.exists);
};

export const getScriptFile = (type: Script) => {
  return getExistFile(path.join(paths.root, 'app', type), 'script');
};

export const replaceString = (str: string, keywords: {}) => {
  return Object.entries(keywords).reduce((acc, [key, value]) => {
    return acc.replace(new RegExp(key, 'g'), `${value}`);
  }, str);
};

export const generateTypes = (name: string, options: string[]) => {
  jetpack.write(
    path.join(__dirname, '../', 'types', 'runtime', `${name}.ts`),
    `export type ${name.toUpperCase()} = ${options.map((option) => `'${option}'`).join(' | ')}`,
  );
};
