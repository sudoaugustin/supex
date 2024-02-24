'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createElement } from 'react';

type Item = { path: string; label: string; subLinks?: Item[] };

type Props = {
  pages: Item[];
};

export default function NavBar({ pages }: Props) {
  const pathname = usePathname();
  return (
    <aside className="w-60 py-5 lg:py-10 fixed">
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
  );
}
