import path from 'path';
import jetpack from 'fs-jetpack';
import sharp from 'sharp';
import { BuildOptions } from 'types';
import paths from './consts/paths';

type Options = Omit<BuildOptions, 'browser' | 'appFiles'> & { input: string };

export default async function buildIcon({ input, outdir, isBuild }: Options) {
  const name = path.basename(input).split('.')[0];
  const sizes = isBuild ? [16, 32, 48, 96, 128, 256] : [256];
  const $sharp = sharp(path.join(paths.root, input));
  const $outdir = path.join(outdir, 'icons');

  jetpack.dir($outdir);

  return Promise.all(
    sizes.map(async size => {
      const filename = `${name}-${size}.png`;
      await $sharp.resize(size).toFile(path.join($outdir, filename));
      return [size, `icons/${filename}`];
    }, {}),
  ).then(Object.fromEntries);
}
