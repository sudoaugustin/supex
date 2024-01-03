import Button from 'components/Button';
import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import 'styles/index.css';

const root = document.createElement('div');
document.body.appendChild(root);

function Home() {
  const [label, setLabel] = useState('Click Me');

  return (
    <div className="flex items-center justify-center">
      <Button label={label} onClick={() => setLabel('nice')} />
    </div>
  );
}

createRoot(root).render(<Home />);

export const meta = { title: 'Home' };
