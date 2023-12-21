import Button from 'components/Button';
import { useState } from 'react';
import 'styles/index.css';

export default function Home() {
  const [label, setLabel] = useState('Click Me');

  return (
    <div className="h-screen w-screen flex items-center justify-center">
      <Button label={label} onClick={() => setLabel('nice')} />
    </div>
  );
}

export const meta = { title: 'Home' };