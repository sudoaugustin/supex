import { LogoText } from 'components/Logos';
import type { Metadata } from 'next';
import { Onest } from 'next/font/google';
import Link from 'next/link';
import './index.css';

const sans = Onest({ subsets: ['latin'], variable: '--font-sans' });

const links = [
  { name: 'Docs', href: '/docs/get-started' },
  { name: 'Github', href: '' },
  { name: 'Discord', href: '' },
];

export const metadata: Metadata = {
  title: 'Supex - Super cross-browser extensions.',
  description: 'Supex helps you build cross-browser extensions rapidly.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="!scroll-smooth text-[clamp(12px,_4.25vw,_20px)] lg:text-[clamp(14px,_1.25vw,_32px)]">
      <body
        className={`bg-slate-950 text-slate-400 relative pt-20 after:-z-10 after:block after:bg-gradient-to-b after:from-sky-600/0 after:to-sky-600/25 after:absolute after:inset-0 after:w-screen after:h-screen ${sans.className}`}
      >
        <header className="fixed top-0 border-b border-slate-800/75 w-full">
          <div className="paging flex h-20 justify-between items-center">
            <div className="flex items-center">
              <LogoText className="w-20 contrast-150 brightness-125" />
            </div>
            <div className="space-x-5">
              {links.map(({ name, href }) => (
                <Link href={href} className="text-sm font-medium text-slate-400 hover:text-slate-300 duration-100">
                  {name}
                </Link>
              ))}
            </div>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
