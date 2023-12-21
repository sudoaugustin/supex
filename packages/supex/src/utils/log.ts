import chalk from 'chalk';
import { Browser } from 'types';

const renderBrowser = (browser?: Browser) => (browser ? ` ${chalk.gray(`[${browser}]`)}` : '');

export const logError = (msg: string, browser?: Browser) => {
  console.log(`${chalk.bold(chalk.red('✘'))} ${msg} ${renderBrowser(browser)}`);
};

export const logSuccess = (msg: string, browser?: Browser) => {
  console.log(`${chalk.bold(chalk.green('✔'))} ${msg} ${renderBrowser(browser)}`);
};
