import path from 'path';
import archiver from 'archiver';
import jetpack from 'fs-jetpack';
import { Browser } from 'types';
import paths from './paths';
import { logError, logSuccess } from './utils/log';

export default function zip(browser: Browser) {
  const archive = archiver('zip');
  const outputStream = jetpack.createWriteStream(path.join(paths.root, `${browser}.zip`));

  archive.on('error', (err) => logError(err.message, browser));
  archive.on('finish', () => logSuccess(`Created ${browser}.zip`));
  archive.pipe(outputStream);
  archive.directory(path.join(paths.output, browser), false);
  archive.finalize();
}
