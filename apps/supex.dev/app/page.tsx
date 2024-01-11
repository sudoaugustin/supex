import { ChromeIcon, FirefoxIcon } from 'icons/Browsers';
import { CSSModulesIcon, SassIcon, TailwindIcon } from 'icons/CSSSolutions';
import { ReactIcon, SolidIcon } from 'icons/Components';

const feats = [
  {
    title: 'Components',
    content: 'Supex comes with built-in support for react and typescript, thanks to esbuild.',
    illustration: (
      <>
        <ReactIcon />
        <SolidIcon />
      </>
    ),
  },
  {
    title: 'Cross-Browser',
    content: 'Currently support build for Chrome and Firefox.',
    illustration: (
      <>
        <ChromeIcon />
        <FirefoxIcon />
      </>
    ),
  },
  {
    title: 'Styling',
    content: '',
    illustration: (
      <>
        <TailwindIcon />
        <SassIcon />
        <CSSModulesIcon />
      </>
    ),
  },
  {
    title: 'Live and Hot reload',
    content: 'Supex does live reload (not extension reload) for javascript changes and hot reload for CSS changes.',
  },
  { title: 'Typescript', content: `Supex comes with built-in support for typescript since it's built on esbuild` },
  {
    title: 'Single Configuration',
    content: 'You declare everything you want in `supex.json` and it will generate compitable manifest for each browser.',
  },
];

export default function Home() {
  return (
    <main className="py-10 lg:py-20 paging text-center">
      <h1 className="text-4xl font-semibold supex-text capitalize">Rapid cross-browser extensions development</h1>
      <p className="mt-5 mb-10 text-slate-500 max-w-screen-lg mx-auto">
        Supex helps you create <b>cross-browser extensions</b> and integrated with esbuild for fast rebuilds.
      </p>
      <div className="grid grid-cols-3 gap-5 max-w-screen-xl mx-auto">
        {feats.map(({ title, content, illustration }) => (
          <div key={title} className="border border-slate-800 bg-slate-900/75 backdrop-blur-sm rounded-md p-5 text-left">
            {illustration && <ul className="space-x-2.5 [&>svg]:w-10 flex items-center text-slate-400">{illustration}</ul>}
            <h2 className="text-lg font-semibold text-slate-50 mt-2.5 mb-1">{title}</h2>
            <p className="text-xs">{content}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
