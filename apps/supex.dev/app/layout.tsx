import { LogoText } from 'components/Logos';
import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import Link from 'next/link';
import './index.css';

const sans = Inter({ subsets: ['latin'], variable: '--font-sans' });
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono', weight: ['500'] });

const links = [
  { name: 'Docs', href: '/docs/installation' },
  { name: 'Github', href: 'https://github.com/sudoaugustin/supex' },
  { name: 'Discussions', href: 'https://github.com/sudoaugustin/supex/discussions' },
];

export const metadata: Metadata = {
  title: 'Supex - Super cross-browser extensions.',
  description: 'Supex helps you build cross-browser extensions seamlessly.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className="!scroll-smooth bg-slate-950 after:inset-0 after:-z-5 after:fixed after:bg-gradient-to-b after:from-brand-600/15 after:to-brand-600/5"
    >
      <body className={`text-slate-400 font-sans relative pt-16 ${mono.variable} ${sans.variable}`}>
        <header className="fixed top-0 text-sm border-b z-5 border-slate-800/75 w-full backdrop-blur-sm">
          <div className="paging flex h-16 justify-between items-center">
            <Link href="/" className="flex items-center">
              <LogoText className="w-20 contrast-125 brightness-150" />
            </Link>
            <div className="space-x-5">
              {links.map(({ name, href }) => (
                <Link key={name} href={href} className="font-medium text-slate-400 hover:text-slate-300 duration-100">
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
