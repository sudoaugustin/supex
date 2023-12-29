import arg from 'arg';
import esbuild from 'esbuild';
import jetpack from 'fs-jetpack';

const args = arg({ '--watch': Boolean });
const watch = !!args['--watch'];
const { dependencies } = jetpack.read('./package.json', 'json');

const options = {
  bundle: true,
  outdir: 'dist',
  target: 'node14',
  banner: { js: '#!/usr/bin/env node' },
  platform: 'node',
  logLevel: 'info',
  external: Object.keys(dependencies),
  entryPoints: ['bin.ts'],
};

watch ? (await esbuild.context(options)).watch() : esbuild.build(options);
