'use client';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/20/solid';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createElement, useEffect, useState } from 'react';

type Item = { path: string; label: string; subLinks?: Item[] };

type Props = {
  pages: Item[];
};

export default function NavBar({ pages }: Props) {
  const pathname = usePathname();
  const [isOpen, setOpen] = useState(false);

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <>
      <aside
        className={`py-5 max-lg:fixed max-lg:z-5 max-lg:px-5 max-lg:rounded-md max-lg:inset-x-2.5 max-lg:bg-slate-800 lg:py-10 lg:w-60 duration-200
        ${isOpen ? 'max-lg:translate-y-0 max-lg:bottom-2.5' : 'max-lg:translate-y-full max-lg:bottom-0'}`}
      >
        {pages.map(({ path, label, subLinks }) => {
          const href = `/docs/${path}`;
          return (
            <div key={href} className="font-medium text-sm">
              {createElement(
                subLinks ? 'p' : Link,
                {
                  href: subLinks ? '' : href,
                  className: `block py-1.5 px-3 rounded-md ${href === pathname && 'bg-brand-400/25 text-brand-400'}`,
                },
                label,
              )}
              {subLinks && (
                <div className="ml-3 pl-4 border-l border-l-white/10">
                  {subLinks.map(({ path, label }) => {
                    const $href = `${href}/${path}`;
                    return (
                      <Link key={$href} href={$href} className={`block py-1.5 ${$href === pathname && 'text-brand-400'}`}>
                        {label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </aside>
      <button
        type="button"
        className="fixed z-5 bottom-2.5 right-2.5 p-2.5 flex flex-center bg-slate-800 rounded-full lg:hidden"
        onClick={() => setOpen(isOpen => !isOpen)}
      >
        {isOpen ? <XMarkIcon className="w-6" /> : <Bars3Icon className="w-6" />}
      </button>
    </>
  );
}
