'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

type Heading = {
  id: string;
  tag: string;
  label: string;
};

export default function OnThisPage() {
  const pathname = usePathname();
  const [headings, setHeadings] = useState<Heading[]>([]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    setHeadings(
      (Array.from(document.querySelectorAll('article h2,h3')) as HTMLElement[]).map(({ nodeName, innerText, innerHTML }) => ({
        id: innerText.toLowerCase().replace(' ', '-'),
        tag: nodeName.toLowerCase(),
        label: innerHTML,
      })),
    );
  }, [pathname]);

  return (
    <nav className="py-5 lg:py-10 text-sm max-xl:hidden w-56">
      <h5 className="font-semibold">On This Page</h5>
      <div key={pathname} className="space-y-2.5 mt-5">
        {headings.map(({ id, tag, label }, index) => (
          <Link
            key={`${id}${index}`}
            href={`#${id}`}
            dangerouslySetInnerHTML={{ __html: label }}
            className={`block prose-code:px-1 prose-code:rounded prose-code:bg-slate-800/75 prose-code:border prose-code:border-slate-800 
            ${tag === 'h3' && 'ml-3'}`}
          />
        ))}
      </div>
    </nav>
  );
}
