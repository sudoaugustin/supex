import { Metafile } from 'esbuild';
export type Meta = {
    icon?: string;
    title?: string;
    viewport?: string;
    description?: string;
};
export type Pattern = {
    runAt?: 'document_end' | 'document_start' | 'document_idle';
    globs?: string[];
    matches: string[];
    allFrames?: boolean;
    matchBlank?: boolean;
    excludeGlobs?: string[];
    excludeMatches?: string[];
};
export declare const log: {
    error: (error: any, browser?: Browser) => void;
    success: (t1: [number, number], msg: string, browser: Browser) => void;
};
export declare const getPort: () => Promise<number>;
export declare const hashFile: (file: string, type: 'css') => any;
export declare const getConfig: <TConfig>(name: string) => TConfig;
export declare const getExports: (input: string) => any;
export declare const isStyleFile: (file: string) => any;
export declare const isScriptFile: (file: string) => any;
export declare const generateMeta: (meta: Meta) => string;
export declare const generateType: (name: string, options: string[]) => void;
export declare const replaceString: (str: string, keywords: {}) => string;
export declare const getCSSOutputs: ({ inputs, outputs }: Metafile, entry: string, browser: Browser) => string[];
