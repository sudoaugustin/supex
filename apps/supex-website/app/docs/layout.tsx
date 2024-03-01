import { Metadata } from 'next';
import NavBar from './NavBar';
import OnThisPage from './OnThisPage';

const pages = [
  { path: 'installation', label: 'Installation' },
  { path: 'configuration', label: 'Configuration' },
  {
    path: 'app-folder',
    label: 'App Folder',
    subLinks: [
      { path: 'icon', label: 'Icon' },
      { path: 'action', label: 'action.js' },
      { path: 'worker', label: 'worker.js' },
      { path: 'home', label: 'home.js' },
      { path: 'content-scripts', label: 'Content Scripts' },
      { path: 'devtools', label: 'DevTools' },
      { path: 'request-rules', label: 'Request Rules' },
    ],
  },
  { path: 'public-folder', label: 'Public Folder' },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex paging lg:max-w-7xl justify-between">
      <NavBar pages={pages} />
      <div className="lg:pl-60 flex-1">
        <article className="prose prose-slate prose-h2:border-b prose-h2:border-slate-800 prose-h2:pb-1 prose-h1:font-bold py-5 lg:py-10 lg:mx-10 prose-invert prose-code:px-1 prose-code:rounded prose-code:my-0 prose-code:bg-slate-800/75 prose-code:border prose-code:border-slate-800 prose-a:no-underline prose-a:text-brand-600 hover:prose-a:text-brand-400 prose-code:inline-flex prose-code:items-center prose-code:justify-center prose-a:duration-150 prose-code:before:content-none prose-code:after:*:content-none">
          {children}
        </article>
      </div>
      <OnThisPage />
    </main>
  );
}