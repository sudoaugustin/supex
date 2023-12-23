import path from 'path';
import jetpack from 'fs-jetpack';
import type { Browser, BuildOptions } from 'types';
import buildIcon from './build.icon';
import paths from './consts/paths';
import { nonOptionalPermissions, permissions } from './consts/permissions';
import { generateType, getExports, log } from './utils';

type CommandKey = string | { mac?: string; linux?: string; windows?: string; chromeos?: string; default: string };

type SupexConfig = {
  name?: string;
  version?: string;
  description?: string;
  author?: string;
  commands?: { [key: string]: { key: CommandKey; description: string } };
  incognito?: 'split' | 'spanning' | 'not_allowed';
  hosts?: string;
  permissions?: { required?: string[]; optional?: string[] };
};

function filterPermission($permissions: string[] | undefined, browser: Browser) {
  return ($permissions || []).filter(permission => permissions[browser].includes(permission as never));
}

export default async function buildManifest({ outdir, browser, isBuild, appFiles }: BuildOptions) {
  const t1 = process.hrtime();
  const files = {
    icon: appFiles.find(file => file.includes('app/icon.')),
    public: path.join(paths.root, 'public'),
    action: appFiles.find(file => file.includes('app/action.')),
    actionIcon: appFiles.find(file => file.includes('app/action-icon.')),
    worker: appFiles.find(file => file.includes('app/worker.')),
    devtools: appFiles.find(file => file.includes('app/devtools/index.')),
    requests: appFiles.filter(file => file.includes('app/request-rules/') && file.includes('.json')),
    overrides: appFiles.filter(file => file.includes('app/home.') || file.includes('app/history.') || file.includes('app/bookmarks.')),
  };
  const version = browser === 'firefox' ? 2 : 3;
  const manifest: { [k: string]: unknown } = { manifest_version: version };
  const { hosts, commands, incognito, permissions, ...config } = jetpack.read(paths.config, 'json') as SupexConfig;

  // Keep `getSpecificValue` for future versions
  // const getSpecificValue = (v: any) => !!v && (v[browser] || v.default || v);

  (['name', 'author', 'version', 'description'] as const).forEach(key => {
    const value = config[key];
    if (value) {
      manifest[key] = value;
    }
  });

  if (files.icon) {
    manifest.icons = await buildIcon({ outdir, input: files.icon, isBuild });
  }

  if (files.action) {
    const { meta } = await getExports(path.join(paths.root, files.action));
    manifest[version === 2 ? 'browser_action' : 'action'] = {
      default_icon: files.actionIcon ? await buildIcon({ outdir, input: files.actionIcon, isBuild }) : undefined,
      default_title: meta.title,
      default_popup: 'action.html',
    };
  }

  if (files.worker) {
    manifest.background = version === 2 ? { scripts: ['worker.js'] } : { service_worker: 'worker.js' };
  }

  if (files.devtools) {
    manifest.devtools_page = 'devtools/index.html';
  }

  if (files.overrides.length) {
    manifest.chrome_url_overrides = files.overrides
      .filter(file => (browser === 'chrome' ? true : file.includes('app/home.')))
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

  if (permissions?.required) {
    manifest.permissions = filterPermission(permissions.required, browser).concat(version === 2 && hosts ? hosts : []);
  }

  if (permissions?.optional) {
    manifest.optional_permissions = filterPermission(permissions.optional, browser).filter(
      permission => !nonOptionalPermissions[browser].includes(permission as never),
    );
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
      version === 2 ? ['public/*'] : [{ resources: ['public/*'], extension_ids: ['*'], matches: ['*://*/*'] }];
  }

  jetpack.write(path.join(outdir, 'manifest.json'), manifest);

  log.success(t1, 'Compiled manifest.json in $ms', browser);
}
