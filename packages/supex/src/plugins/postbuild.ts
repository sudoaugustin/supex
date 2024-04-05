import path from 'path';
import archiver from 'archiver';
import chokidar from 'chokidar';
import debounce from 'debounce';
import { Plugin } from 'esbuild';
import jetpack from 'fs-jetpack';
import { paths } from 'src/consts';
import { ESPluginOptions } from 'types';

type ReloadOptions = {
  sourceDir: string;
  extensionRunner: { registerCleanup: Function; reloadExtensionBySourceDir: Function };
};

function reloadStrategy({ extensionRunner, sourceDir }: ReloadOptions) {
  const watcher = chokidar.watch([paths.config, path.join(paths.app, 'request-rules'), path.join(sourceDir, 'contents')], {
    ignoreInitial: true,
  });
  const debounceTime = 50;
  const handleChange = debounce(() => extensionRunner.reloadExtensionBySourceDir(sourceDir), debounceTime, { immediate: false });

  watcher.on('all', () => handleChange());

  extensionRunner.registerCleanup(() => {
    watcher.close();
  });
}

const stdoutWrite = process.stdout.write.bind(process.stdout);

export default function webExt({ outdir, browser, isBuild, isHeadless }: ESPluginOptions & { isHeadless: boolean }): Plugin {
  return {
    name: 'supex-postbuild',
    setup: build => {
      let count = 0;
      build.onEnd(async error => {
        if (error.errors.length === 0) {
          if (isBuild) {
            const archive = archiver('zip');
            const outputStream = jetpack.createWriteStream(path.join(paths.root, `${browser}.zip`));
            return new Promise((resolve, reject) => {
              archive.on('error', err => {
                throw err.message;
              });
              archive.on('finish', resolve);
              archive.pipe(outputStream);
              archive.directory(outdir, false);
              archive.finalize();
            });
          }

          if (!isHeadless && count === 0 && (browser === 'chrome' || browser === 'firefox')) {
            count++;
            const { cmd } = await import('web-ext');
            //@ts-ignore
            const webExtLogger = await import('web-ext/util/logger');
            webExtLogger.consoleStream.write = () => {};
            //@ts-ignore
            process.stdout.write = data => {
              if (!data.includes('\rLast extension reload:' as never)) {
                stdoutWrite(data);
              }
            };
            cmd.run(
              { target: browser === 'chrome' ? 'chromium' : 'firefox-desktop', noInput: true, sourceDir: outdir },
              { reloadStrategy },
            );
          }
        }
      });
    },
  };
}
