import path from 'path';

const root = path.resolve();
export const paths = {
  root,
  app: path.join(root, 'app'),
  output: path.join(root, '.supex'),
  config: path.join(root, 'supex.json'),
  ignores: [
    path.join(root, '.supex'),
    /(^|[\/\\])\../, // dotfiles
    path.join(root, 'node_modules'),
  ],
};

export const browsers = ['chrome', 'firefox'] as const;

export const patterns = {
  icons: {
    main: 'app/icon.',
    action: 'app/action-icon.',
  },
  action: 'app/action.',
  worker: 'app/worker.',
  contents: 'app/contents/',
  devtools: 'app/devtools/index.',
  requests: 'app/request-rules/',
  overrides: ['app/home.'],
};

export const extensions = {
  icon: ['svg', 'png', 'jpg'],
  script: ['tsx', 'jsx', 'ts', 'js'],
};
