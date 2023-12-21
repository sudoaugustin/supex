import '@total-typescript/ts-reset';
import { browsers } from 'src/consts/index';

type Icon = 'icon' | 'action-icon';

type Meta = { icon?: string; title?: string };

type Page = 'home' | 'worker' | 'content' | 'action' | 'history' | 'bookmarks' | 'devtools' | 'panel';

type Device = { mac?: string; linux?: string; default: string; window?: string; chromeos?: string };

type Browser = (typeof browsers)[number];

type Pattern = {
  runAt?: 'document_end' | 'document_start' | 'document_idle';
  globs?: string[];
  matches: string[];
  isMain?: boolean;
  allFrames?: boolean;
  matchBlank?: boolean;
  matchFallback?: boolean;
  excludeGlobs?: string[];
  excludeMatches?: string[];
};

type Commands = { [key: string]: { key: string | Device; description: string } };

type DeviceOut = Omit<Device, 'window'> & { windows?: string };

type CommandsOut = { [key: string]: { description: string; suggested_key: string | DeviceOut } };
