import Button from 'components/Button';
import { useState } from 'react';
import 'styles/index.css';

export default function Action() {
  const [label, setLabel] = useState('Click Me');

  return (
    <div className="h-screen w-screen flex items-center justify-center">
      <Button label={label} onClick={() => setLabel('Nice')} />
    </div>
  );
}

export const meta = { title: 'Action To Click' };
