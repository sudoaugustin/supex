import Button from 'components/Button';
import '../styles/index.css';
import { useState } from 'react';

export default function Action() {
  const [label, setLabel] = useState('Click Me');

  return (
    <div className="h-screen w-screen flex items-center justify-center">
      <Button label={label} onClick={() => setLabel('nice')} />
    </div>
  );
}
