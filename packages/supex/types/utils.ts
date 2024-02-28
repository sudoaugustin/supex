import { Browser } from 'types';

export type BrowserObj<T> = { [k in Browser]: T };
