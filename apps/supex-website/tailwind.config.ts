import type { Config } from 'tailwindcss';
import colors from 'tailwindcss/colors';
import { fontFamily } from 'tailwindcss/defaultTheme';
import type { PluginAPI } from 'tailwindcss/types/config';

const zIndexes = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];

const config: Config = {
  content: ['./pages/**/*.{js,ts,jsx,tsx,mdx}', './components/**/*.{js,ts,jsx,tsx,mdx}', './app/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    zIndex: zIndexes.reduce((z, n) => ({ ...z, [n * 5]: n * 5 }), {}),
    extend: {
      colors: {
        brand: colors.sky,
      },
      fontSize: {
        '2xs': '0.625rem',
      },
      fontFamily: {
        mono: ['var(--font-mono)', ...fontFamily.mono],
        sans: ['var(--font-sans)', ...fontFamily.sans],
        serif: ['var(--font-serif)', ...fontFamily.serif],
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('tailwindcss-radix')(),
    ({ theme, addUtilities, matchUtilities }: PluginAPI) => {
      addUtilities({ '.flex-center': { 'align-items': 'center', 'justify-content': 'center' } });
      matchUtilities({ s: value => ({ width: value, height: value }) }, { values: theme('width') });
    },
  ],
};
export default config;
