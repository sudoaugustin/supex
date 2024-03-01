export default {
  script: {
    react: `import { createRoot } from 'react-dom/client';

const root = document.createElement('div');

function Home() {
  return '...';
}

document.body.appendChild(root);

createRoot(root).render(<Home />);`,

    solid: `import { render } from 'solid-js/web';
  
const root = document.createElement('div');

function Home() {
  return '...';
}

document.body.appendChild(root);

render(() => <Home />, root);`,

    vanilla: `const root = document.createElement('div');

document.body.appendChild(root);

root.innerHTML = '...';`,
  },
  html: `<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <script src="https://cdn.tailwindcss.com"></script>
</head>

<body></body>

</html>`,
  meta: {
    javascript: `export const meta = {
  title: '...',
  viewport: '...',
  description: '...',
};`,
    typescript: `import { Meta } from 'supex';
    
export const meta: Meta = {
  title: '...',
  viewport: '...',
  description: '...',
};`,
  },
};
