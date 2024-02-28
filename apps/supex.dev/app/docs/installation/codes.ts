import { schemas } from 'utils/consts';

export default {
  install: {
    solid: 'npm install supex@latest solid-js@latest webextension-polyfill@latest',
    react: 'npm install supex@latest react react-dom@latest webextension-polyfill@latest',
    vanilla: 'npm install supex@latest webextension-polyfill@latest',
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
    solid: 'npm install typescript@latest @types/webextension-polyfill@latest --save-dev',
    react: 'npm install typescript@latest @types/webextension-polyfill@latest @types/react@latest @types/react-dom@latest --save-dev',
    vanilla: 'npm install typescript@latest @types/webextension-polyfill@latest --save-dev',
  },
  configuration: `{
  "$schema": "${schemas.config}",
  "name": "Supex",
  "version": "0.0.1",
}`,
};
