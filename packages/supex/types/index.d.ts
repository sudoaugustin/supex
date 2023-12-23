import '@total-typescript/ts-reset';
import { browsers } from 'src/consts/index';

type Page = 'home' | 'worker' | 'content' | 'action' | 'history' | 'bookmarks' | 'devtools' | 'panel';

type Browser = (typeof browsers)[number];

type BuildOptions = { outdir: string; browser: Browser; isBuild: boolean; appFiles: string[] };
