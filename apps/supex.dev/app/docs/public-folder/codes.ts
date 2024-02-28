export default {
  action: {
    react: `import { createRoot } from 'react-dom/client';
        
const root = document.createElement('div');

function Action() {
    return <img src="public/beautiful.png" />;
}

document.body.appendChild(root);

createRoot(root).render(<Action />);`,

    solid: `import { render } from 'solid-js/web';
    
const root = document.createElement('div');

function Action() {
    return <img src="public/beautiful.png" />;
}

document.body.appendChild(root);

render(() => <Action />, root);`,

    vanilla: `const root = document.createElement('div');

document.body.appendChild(root);

root.innerHTML = '<img src="public/beautiful.png" />';`,
  },
};
