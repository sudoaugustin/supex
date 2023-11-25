import '@total-typescript/ts-reset';

type Icon = 'icon' | 'action-icon';

type Script = 'action' | 'new-tab' | 'background';

type Device = { mac?: string; linux?: string; default: string; window?: string; chromeos?: string };

type Browser = 'chrome' | 'safari' | 'firefox' | 'edge';

type Commands = { [key: string]: { key: string | Device; description: string } };

type DeviceOut = Omit<Device, 'window'> & { windows?: string };

type CommandsOut = { [key: string]: { description: string; suggested_key: string | DeviceOut } };
