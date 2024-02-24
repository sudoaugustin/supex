export default {
  script: {
    javascript: `import 'index.css';

console.log('Working');

export const pattern = {
  matches: ['*://*.example.com/*'],
};`,
    typescript: `import 'index.css';
import { Pattern } from 'supex';

console.log('Working');

export const pattern: Pattern = {
  matches: ['*://*.example.com/*'],
};`,
  },
  css: `body {
  background-color: red !important;
}`,
};
