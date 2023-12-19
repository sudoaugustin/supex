import path from 'path';

const root = path.resolve(); // !Note:Set the root path relative from /.dist folder.

const output = path.join(root, '.supex');

const paths = {
  root,
  app: path.join(root, 'app'),
  // assets: path.join(root, 'assets'),
  config: path.join(root, 'supex.json'),
  output,
  ignores: [
    output,
    /(^|[\/\\])\../, // dotfiles
    path.join(root, 'node_modules'),
  ],
  schemas: path.join(__dirname, '../', 'schemas'),
  defaults: path.join(__dirname, '../', 'defaults'),
};

export default paths;
