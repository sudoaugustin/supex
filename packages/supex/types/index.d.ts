import '@total-typescript/ts-reset';
import { browsers } from 'src/consts/index';

type Page = 'home' | 'worker' | 'content' | 'action' | 'history' | 'bookmarks' | 'devtools' | 'panel';

type Browser = (typeof browsers)[number];

type ESPluginOptions = { port: number; outdir: string; browser: Browser; isBuild: boolean };
