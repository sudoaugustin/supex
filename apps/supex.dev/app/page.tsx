import { ArrowLongRightIcon } from '@heroicons/react/16/solid';
import { ReactIcon, SolidIcon, VanillaIcon } from 'icons';
import { ChromeIcon, EdgeIcon, FirefoxIcon, OperaIcon, SafariIcon } from 'icons/Browsers';
import { CSSModulesIcon, JSSIcon, SassIcon, TailwindIcon } from 'icons/CSSSolutions';
import Link from 'next/link';

const feats = [
  {
    title: 'Libraries',
    content: 'Supex supports Vanilla, React and Solid.',
    illustration: (
      <>
        <ReactIcon />
        <SolidIcon />
        <VanillaIcon className="text-[#F7DF1E]" />
      </>
    ),
  },
  {
    title: 'Cross-Browser',
    content: 'Generates builds for all modern browsers.',
    illustration: (
      <>
        <ChromeIcon />
        <FirefoxIcon />
        <EdgeIcon />
        <OperaIcon />
        <SafariIcon />
      </>
    ),
  },
  {
    title: 'Styling',
    content: 'Supports Tailwind, Sass, CSS Modules and JSS.',
    illustration: (
      <>
        <TailwindIcon />
        <SassIcon />
        <CSSModulesIcon />
        <JSSIcon />
      </>
    ),
  },
  {
    title: 'Live and Hot Reload',
    content: 'Supex does live reload(not extension reload) for javascript changes and hot reload for CSS changes.',
  },
  { title: 'Typescript', content: 'Supex comes with built-in support for typescript thanks to esbuild.' },
  {
    title: 'Single Configuration',
    content: (
      <>
        A single <Link href="/docs/configuration">supex.json</Link> is enough to generate compitable manifests for each browser.
      </>
    ),
  },
];

export default function Home() {
  return (
    <main className="py-10 lg:py-20 paging text-center">
      <h1 className="text-2xl lg:text-4xl font-semibold supex-text capitalize">Seamless browser extension development</h1>
      <p className="mt-5 mb-10 text-slate-500 max-w-screen-lg mx-auto">
        Supex helps you create <b>cross-browser extensions</b> and integrated with esbuild for fast rebuilds.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-screen-xl mx-auto">
        {feats.map(({ title, content, illustration }) => (
          <div
            key={title}
            className="group cursor-pointer border border-slate-700 border-opacity-45 hover:border-opacity-85 relative bg-slate-900/50 hover:bg-slate-800/50 backdrop-blur-sm rounded-md p-5 text-left duration-150"
          >
            {/* <ArrowLongRightIcon className="absolute top-2.5 right-2.5 w-4 text-slate-600 group-hover:opacity-100 opacity-0 duration-200" /> */}

            {illustration && (
              <div className="space-x-1.5 lg:space-x-2.5 [&>svg]:w-8 lg:[&>svg]:w-10 flex items-center text-slate-400">{illustration}</div>
            )}
            <h2 className="text-lg font-semibold text-slate-50 mt-2.5 mb-1">{title}</h2>
            <p className="text-sm">{content}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
