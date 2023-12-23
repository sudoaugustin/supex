import path from 'path';
import archiver from 'archiver';
import jetpack from 'fs-jetpack';
import { Browser } from 'types';
import { log } from '.';
import paths from '../consts/paths';

type Options = { outdir: string; browser: Browser };

export default function zip({ outdir, browser }: Options) {
  const archive = archiver('zip');
  const outputStream = jetpack.createWriteStream(path.join(paths.root, `${browser}.zip`));

  archive.on('error', err => log.error(err.message, browser));
  archive.on('finish', () => console.log(`Created ${browser}.zip`));
  archive.pipe(outputStream);
  archive.directory(outdir, false);
  archive.finalize();
}
