import { Browser } from 'types';

type BrowserObj<T> = { [k in Browser]: T };
