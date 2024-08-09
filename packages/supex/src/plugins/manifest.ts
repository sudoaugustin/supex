import path from 'path';
import chokidar from 'chokidar';
import { Metafile, Plugin } from 'esbuild';
import jetpack from 'fs-jetpack';
import { extensions, paths, patterns } from 'src/consts';
import { generateType, getCSSOutputs, getExports, log } from 'src/utils';
import buildIcon from 'src/utils/buildIcon';
import { filterOptionalPermissions, filterRequiredPermissions } from 'src/utils/filterPermissions';
import { ESPluginOptions } from 'types';

type Config = {
  name?: string;
  version?: string;
  description?: string;
  author?: string;
  commands?: { [key: string]: { key: CommandKey; description: string } };
  incognito?: 'split' | 'spanning' | 'not_allowed';
  hosts?: string;
  permissions: { required?: string[]; optional?: string[] };
  'content-security': { [k: string]: string };
};

type CommandKey = string | { mac?: string; linux?: string; windows?: string; chromeos?: string; default: string };

export default function manifest(options: ESPluginOptions): Plugin {
  return {
    name: 'manifest',
    setup: build => {
      let $metafile: Metafile;
      if (!options.isBuild) {
        const watcher = chokidar.watch(
          [
            paths.config,
            path.join(paths.app, 'request-rules'),
            ...['icon', 'action-icon'].flatMap(file => extensions.icon.map(ext => `${path.join(paths.app, file)}.${ext}`)),
          ],
          { ignoreInitial: true },
        );

        watcher.on('all', async () => {
          const t1 = process.hrtime();
          await generateManifest({ ...options, metafile: $metafile });
          log.success(t1, 'Compiled in $ms', options.browser);
        });
      }

      build.onEnd(({ errors, metafile }) => {
        if (errors.length > 0) return null;
        $metafile = metafile as Metafile;
        return generateManifest({ ...options, metafile: $metafile });
      });
    },
  };
}

async function generateManifest({ server, outdir, browser, isBuild, metafile }: ESPluginOptions & { metafile: Metafile }) {
  const appFiles = jetpack.find(paths.app);

  const files = {
    icons: {
      main: appFiles.find(file => file.includes(patterns.icons.main)),
      action: appFiles.find(file => file.includes(patterns.icons.action)),
    },
    public: path.join(paths.root, 'public'),
    action: appFiles.find(file => file.includes(patterns.action)),
    worker: appFiles.find(file => file.includes(patterns.worker)),
    contents: appFiles.filter(file => file.includes(patterns.contents)),
    devtools: appFiles.find(file => file.includes(patterns.devtools)),
    requests: appFiles.filter(file => file.includes(patterns.requests) && file.includes('.json')),
    overrides: appFiles.filter(file => patterns.overrides.some(pattern => file.includes(pattern))),
  };

  const version = browser === 'firefox' ? 2 : 3;
  const manifest: { [k: string]: unknown } = { manifest_version: version };
  const { hosts, commands, incognito, permissions = {}, ...config } = jetpack.read(paths.config, 'json') as Config;
  let security = config['content-security'];

  // Keep `getSpecificValue` for future versions
  // const getSpecificValue = (v: any) => !!v && (v[browser] || v.default || v);

  (['name', 'author', 'version', 'description'] as const).forEach(key => {
    const value = config[key];
    if (value) {
      manifest[key] = value;
    }
  });

  if (files.icons.main) {
    manifest.icons = await buildIcon({ outdir, input: files.icons.main, isBuild });
  }

  if (files.action) {
    const { meta, isSkeleton } = await getExports(path.join(paths.root, files.action));
    manifest[version === 2 ? 'browser_action' : 'action'] = {
      default_icon: files.icons.action ? await buildIcon({ outdir, input: files.icons.action, isBuild }) : undefined,
      default_title: meta.title,
      default_popup: isSkeleton ? undefined : 'action.html',
    };
  }

  if (files.worker) {
    manifest.background = version === 2 ? { scripts: ['worker.js'] } : { service_worker: 'worker.js' };
  }

  if (files.contents) {
    manifest.content_scripts = await Promise.all(
      files.contents.map(async file => {
        const $file = file.split('.')[0].replace('app/', '');
        const cssFiles = getCSSOutputs(metafile, file, browser);
        const { pattern } = await getExports(path.join(paths.root, file));

        return {
          js: [`./${$file}.js`, isBuild ? undefined : './reload.js'].filter(Boolean),
          css: cssFiles.length > 0 ? cssFiles : undefined,
          matches: pattern.matches,
          exclude_matches: pattern.excludeMatches,
          include_globs: pattern.globs,
          exclude_globs: pattern.excludeGlobs,
          match_about_blank: pattern.matchBlank,
          // match_origin_as_fallback: browser === 'chrome' ? pattern.matchFallback : undefined,
          run_at: pattern.runAt,
          // world: browser === 'chrome' ? (pattern.isMain ? 'MAIN' : 'ISOLATED') : undefined,
          all_frames: pattern.allFrames,
        };
      }),
    );
  }

  if (files.devtools) {
    manifest.devtools_page = 'devtools/index.html';
  }

  if (files.overrides.length) {
    manifest.chrome_url_overrides = files.overrides
      // TODO: uncomment when bookmarks and history overrides are added.
      // .filter(file => (browser === 'chrome' ? true : file.includes('app/home.')))
      .reduce((files, file) => {
        const name = path.basename(file).split('.')[0];
        return { ...files, [name === 'home' ? 'newtab' : name]: `${name}.html` };
      }, {});
  }

  if (commands) {
    type $Commands = { [key: string]: { description: string; suggested_key: CommandKey } };
    generateType('command', Object.keys(commands));
    manifest.commands = Object.entries(commands).reduce<$Commands>((commands, [id, { key, description }]) => {
      commands[id] = {
        description,
        // Note: Firefox don't allow `suggested_key` as `string` type.
        suggested_key: typeof key === 'string' ? { default: key } : key,
      };
      return commands;
    }, {});
  }

  if (incognito) {
    manifest.incognito = incognito === 'split' && browser === 'firefox' ? 'spanning' : incognito;
  }

  if (permissions.required) {
    manifest.permissions = filterRequiredPermissions(permissions.required, browser).concat(version === 2 && hosts ? hosts : []);
  }

  if (permissions.optional) {
    manifest.optional_permissions = filterOptionalPermissions(permissions.optional, browser);
  }

  if (version === 3 && hosts) {
    manifest.host_permissions = hosts;
  }

  if (files.requests.length) {
    const rule_resources = files.requests
      .map(file => {
        const input = path.join(paths.root, file);
        const { rules, enabled = true } = jetpack.read(input, 'json');
        if (Array.isArray(rules) && rules.length > 0 && rules[0]) {
          const filename = path.basename(input);
          const outputPath = path.join('request-rules', filename);
          jetpack.write(
            path.join(outdir, outputPath),
            rules.map((rule, index) => ({ id: index + 1, ...(rule as object) })),
          );

          return { id: filename.replace('.json', ''), path: outputPath, enabled };
        }
      })
      .filter(Boolean);

    manifest.declarative_net_request = { rule_resources };
  }

  if (jetpack.exists(files.public)) {
    const outPublic = path.join(outdir, 'public');
    if (isBuild) jetpack.copy(files.public, outPublic);
    else if (!jetpack.exists(outPublic)) jetpack.symlink(files.public, outPublic);
    manifest.web_accessible_resources =
      version === 2
        ? ['public/*']
        : [{ resources: (jetpack.list(files.public) || []).map(name => `public/${name}`), extension_ids: ['*'], matches: ['*://*/*'] }];
  }

  if (isBuild ? security : true) {
    if (!security) security = {};
    if (!security['default-src']) security['default-src'] = "'self'";
    const policy = Object.entries(security).reduce(
      (string, [name, value]) => `${string} ${name} ${value} ${!isBuild ? `${server}` : ''};`,
      '',
    );

    manifest.content_security_policy = version === 2 ? policy : { extension_pages: policy };
  }

  jetpack.write(path.join(outdir, 'manifest.json'), manifest);
}
