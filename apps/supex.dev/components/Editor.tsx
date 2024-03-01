'use client';
import { ChevronDownIcon, CommandLineIcon, DocumentTextIcon } from '@heroicons/react/16/solid';
import { CheckIcon, ClipboardIcon } from '@heroicons/react/24/outline';
import * as Select from '@radix-ui/react-select';
import { toHtml } from 'hast-util-to-html';
import { VanillaIcon } from 'icons';
import { useEffect, useState } from 'react';
import { refractor } from 'refractor';
import langBash from 'refractor/lang/bash';
import langJavascript from 'refractor/lang/javascript';
import langJson from 'refractor/lang/json';
import langTypescript from 'refractor/lang/typescript';
import { Clipboard } from 'renex';

type Props = {
  code: string | { [k: string]: string };
  comment?: string;
  filename?: string;
  sync?: string;
};

const icons = {
  js: <VanillaIcon className="w-3" />,
  bash: <CommandLineIcon className="w-4" />,
  json: <DocumentTextIcon className="w-4" />,
};

refractor.alias({ javascript: ['js'] });

refractor.register(langJson);
refractor.register(langBash);
refractor.register(langJavascript);
refractor.register(langTypescript);

export default function Editor({ code, comment, sync, filename = '' }: Props) {
  const isStr = typeof code === 'string';
  const keys = isStr ? [] : Object.keys(code);
  const lang = filename.split('.')[1] || 'bash';

  const [key = '', setKey] = useState(keys[0]);

  const $key = key.toLowerCase();
  const $code = isStr ? code : code[key];
  const $filename =
    lang === 'js'
      ? `${filename.split('.')[0]}.${$key.includes('typescript') ? 'ts' : 'js'}${
          $key.includes('react') || $key.includes('solid') ? 'x' : ''
        }`
      : filename;

  useEffect(() => {
    if (sync) {
      const key = localStorage.getItem(sync);
      console.log(sync, key);
      key && setKey(key);
    }
  }, [sync]);

  return (
    <div className="border border-slate-600/35 my-5 relative w-full rounded-md text-sm after:bg-slate-800/15 after:backdrop-blur-md after:absolute after:inset-0 after:-z-10">
      <div className="flex justify-between px-4 border-b border-slate-600/35">
        <p className="flex items-center space-x-1 text-slate-600 select-none">
          {icons[lang as never]}
          <span>{$filename || 'Terminal'}</span>
        </p>
        <div className="flex items-center space-x-2.5 font-medium">
          {keys.length > 0 && (
            <Select.Root
              value={key}
              onValueChange={newKey => {
                setKey(newKey);
                sync && localStorage.setItem(sync, newKey);
              }}
            >
              <Select.Trigger className="flex items-center relative space-x-1 text-slate-400 capitalize">
                <Select.Value />
                <Select.Icon className="w-4">
                  <ChevronDownIcon />
                </Select.Icon>
              </Select.Trigger>
              <Select.Content>
                <Select.Viewport className="bg-slate-800 ring-1 ring-slate-700 rounded p-1 min-w-20 capitalize">
                  {keys.map(key => (
                    <Select.Item
                      key={key}
                      value={key}
                      className="flex items-center cursor-pointer space-x-2 justify-between py-1 px-1.5 group rounded radix-state-checked:text-brand-500"
                    >
                      <Select.ItemText>{key}</Select.ItemText>
                      <Select.ItemIndicator>
                        <CheckIcon className="w-3 group-radix-state-checked:text-brand-600" />
                      </Select.ItemIndicator>
                    </Select.Item>
                  ))}
                </Select.Viewport>
              </Select.Content>
            </Select.Root>
          )}
          <Clipboard>
            {({ copy, isCopied }) => (
              <button type="button" className="bg-transparent hover:bg-slate-800 rounded duration-150 p-0.5" onClick={() => copy($code)}>
                {isCopied ? <CheckIcon className="w-3.5 text-green-400" /> : <ClipboardIcon className="w-3.5" />}
              </button>
            )}
          </Clipboard>
        </div>
      </div>
      <pre
        className={`font-medium font-mono p-4 not-prose overflow-auto text-cyan-500 ${lang}`}
        dangerouslySetInnerHTML={{
          __html: toHtml(refractor.highlight(`${$code}${comment ? `\n\n/* ${comment} */` : ''}`, lang) as never),
        }}
      />
    </div>
  );
}
