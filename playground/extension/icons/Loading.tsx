import { HTMLAttributes } from 'react';

export function Spinner({ className, ...rest }: SVGProps) {
  return (
    <svg width='1em' viewBox='0 0 24 24' className={`animate-spin fill-none ${className}`} {...rest}>
      <title>Spinner</title>
      <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' />
      <path
        d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
        fill='currentColor'
        className='opacity-75'
      />
    </svg>
  );
}

export function ProgressBar({ className, ...rest }: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <i className={`w-[1.5em] flex relative overflow-hidden h-1 rounded-full ${className}`} {...rest}>
      <span className='absolute inset-0 bg-current opacity-25 w-full h-full' />
      <span className='block w-full h-full rounded-full bg-current animate-progress' />
    </i>
  );
}
