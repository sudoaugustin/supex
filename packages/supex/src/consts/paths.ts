import path from 'path';

const root = path.resolve();

export default {
  root,
  app: path.join(root, 'app'),
  config: path.join(root, 'supex.json'),
  ignores: [
    path.join(root, '.supex'),
    /(^|[\/\\])\../, // dotfiles
    path.join(root, 'node_modules'),
  ],
};
