import { schemas } from 'utils/consts';

export default {
  install: {
    solid: 'npm install supex solid-js webextension-polyfill',
    react: 'npm install supex react react-dom webextension-polyfill',
    vanilla: 'npm install supex webextension-polyfill',
  },
  package: `{
  "scripts": {
      "watch:chrome": "supex watch --browser=chrome",
      "watch:firefox": "supex watch --browser=chrome",
      "build:chrome": "supex build --browser=chrome",
      "build:firefox": "supex build --browser=chrome" 
  }
}`,
  typescript: {
    solid: 'npm install typescript @types/webextension-polyfill --save-dev',
    react: 'npm install typescript @types/webextension-polyfill @types/react @types/react-dom --save-dev',
    vanilla: 'npm install typescript @types/webextension-polyfill --save-dev',
  },
  configuration: `{
  "$schema": "${schemas.config}",
  "name": "Supex",
  "version": "0.0.1",
}`,
};
