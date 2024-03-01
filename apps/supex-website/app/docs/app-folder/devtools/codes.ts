export default {
  index: `import browser from 'webextension-polyfill';

browser.devtools.panels.create('Profiler', '', 'devtools/panels/profiler.html').then(() => {
  console.log('Panel created successfully!');
});`,
  html: `<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <script src="https://cdn.tailwindcss.com"></script>
</head>

<body></body>

</html>`,
  profiler: {
    react: `import { createRoot } from 'react-dom/client';
    
const root = document.createElement('div');

function Panel() {
  return '...';
}

document.body.appendChild(root);

createRoot(root).render(<Panel />);`,

    solid: `import { render } from 'solid-js/web';

const root = document.createElement('div');

function Panel() {
  return '...';
}

document.body.appendChild(root);

render(() => <Panel />, root);`,

    vanilla: `const root = document.createElement('div');

document.body.appendChild(root);

root.innerHTML = '...';`,
  },
};
