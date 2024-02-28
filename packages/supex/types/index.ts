import '@total-typescript/ts-reset';
import { browsers } from 'src/consts/index';

export type Page = 'home' | 'worker' | 'content' | 'action' | 'history' | 'bookmarks' | 'devtools' | 'panel';

export type Browser = (typeof browsers)[number];

export type ESPluginOptions = { server: string; outdir: string; browser: Browser; packages: string[]; isBuild: boolean };
