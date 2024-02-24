import arg from 'arg';
import esbuild from 'esbuild';

const args = arg({ '--watch': Boolean });
const watch = !!args['--watch'];

const options = {
  bundle: true,
  outdir: 'dist',
  target: 'node14',
  banner: { js: '#!/usr/bin/env node' },
  platform: 'node',
  logLevel: 'info',
  packages: 'external',
  entryPoints: ['bin.ts'],
};

watch ? (await esbuild.context(options)).watch() : esbuild.build(options);
