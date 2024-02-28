import path from 'path';
import arg from 'arg';
import chalk from 'chalk';
import jetpack from 'fs-jetpack';
import { installDependencies } from 'nypm';
import prompts, { PromptObject } from 'prompts';
import { capitalize } from './utils';
import { schemas } from './utils/consts';

const args = arg({});

const name = args._[0] as string | undefined;

const regex = /^[A-Za-z-_]+$/;

const paths = {
  files: path.join(__dirname, '../', 'files'),
};

const questions = [
  !name && {
    type: 'text',
    name: 'name',
    message: `What is your ${chalk.blue('project name')}?`,
    initial: 'my-super-extension',
  },
  {
    type: 'toggle',
    name: 'isTypescript',
    message: `Would you like to use ${chalk.blue('Typescript')}?`,
    active: 'Yes',
    inactive: 'No',
    initial: 'Yes',
  },
  {
    type: 'select',
    name: 'framework',
    message: `Would you like to use ${chalk.blue('component library')}?`,
    choices: [{ title: 'React', value: 'react' }, { title: 'Solid', value: 'solid' }, { title: 'No' }],
  },
  {
    type: 'toggle',
    name: 'isESLint',
    message: `Which ${chalk.blue('linter')} would you like to use?`,
    active: 'ESLint',
    inactive: 'Biome',
  },
  {
    type: 'toggle',
    name: 'isPrettier',
    message: `Which ${chalk.blue('formatter')} would you like to use?`,
    active: 'Prettier',
    inactive: 'Biome',
  },
  {
    type: 'toggle',
    name: 'isTailwind',
    message: `Would you like to use ${chalk.blue('Tailwind')}?`,
    active: 'Yes',
    inactive: 'No',
  },
] as PromptObject[];

function exit(message: string) {
  console.log();
  console.log(`${chalk.bold(chalk.red('✘'))} ${message}`);
  process.exit();
}

async function getDepsGraph(names: (string | boolean)[]) {
  const { default: latest } = await import('latest-version');
  const packages = await Promise.all(
    Array.from(new Set(names))
      .sort()
      .filter(Boolean)
      .map(async name => [name, `^${await latest(name as string)}`]),
  );
  return Object.fromEntries(packages);
}

async function init() {
  const ora = (await import('ora')).default;
  const root = path.resolve();
  const response = await prompts(questions.filter(Boolean) as PromptObject[], { onCancel: () => process.exit() });

  const $name = (name || response.name).toLowerCase();
  if (!regex.test($name)) exit('Project name can only includes alphabets, _, -.');

  const $path = path.join(root, $name);
  if (jetpack.exists($path)) exit(`${$path} already exists.`);

  const isSolid = response.framework === 'solid';
  const isReact = response.framework === 'react';

  const spinner = ora('Creating required files').start();

  // supex.json
  jetpack.write(path.join($path, 'supex.json'), {
    $schema: schemas.config,
    name: capitalize($name.replace(/[_-]/g, ' ')),
    version: '0.0.1',
  });

  // package.json
  jetpack.write(path.join($path, 'package.json'), {
    name: $name,
    private: true,
    scripts: {
      'watch:chrome': 'supex watch --browser=chrome',
      'watch:firefox': 'supex watch --browser=chrome',
      'build:chrome': 'supex build --browser=chrome',
      'build:firefox': 'supex build --browser=chrome',
    },
    dependencies: await getDepsGraph([
      // 'supex',
      'webextension-polyfill',
      isReact && 'react',
      isReact && 'react-dom',
      isSolid && 'solid-js',
    ]),
    devDependencies: await getDepsGraph([
      '@types/webextension-polyfill',
      isReact && '@types/react',
      isReact && '@types/react-dom',
      response.isESLint ? 'eslint' : '@biomejs/biome',
      response.isPrettier ? 'prettier' : '@biomejs/biome',
      response.isTypescript && 'typescript',
      ...(response.isTailwind ? ['postcss', 'tailwindcss', 'autoprefixer', response.isPrettier && 'prettier-plugin-tailwindcss'] : []),
    ]),
  });

  // tsconfig.json
  response.isTypescript &&
    jetpack.write(path.join($path, 'tsconfig.json'), {
      compilerOptions: {
        lib: ['dom', 'dom.iterable', 'esnext'],
        strict: true,
        noEmit: true,
        allowJs: true,
        skipLibCheck: true,
        esModuleInterop: true,
        module: 'esnext',
        moduleResolution: 'bundler',
        isolatedModules: true,
        resolveJsonModule: true,
        jsx: isSolid || isReact ? 'preserve' : undefined,
        jsxImportSource: isSolid ? 'solid-js' : undefined,
        incremental: true,
        baseUrl: '.',
      },
      include: ['**/*.ts', '**/*.tsx'],
      exclude: ['node_modules'],
    });

  // .prettierrc.json
  response.isPrettier &&
    response.isTailwind &&
    jetpack.write(path.join($path, '.prettierrc.json'), { plugins: ['prettier-plugin-tailwindcss'] });

  // biome.json
  (!response.isESLint || !response.isPrettier) &&
    jetpack.write(path.join($path, 'biome.json'), {
      $schema: 'https://biomejs.dev/schemas/1.3.3/schema.json',
      files: { ignore: ['node_modules'] },
      linter: {
        enabled: !response.isESLint,
      },
      formatter: {
        enabled: !response.isPrettier,
      },
    });

  // tailwindcss
  response.isTailwind && jetpack.copy(path.join(paths.files, 'tailwind'), $path, { overwrite: true });

  // create folders
  jetpack.dir(path.join($path, 'app'));
  jetpack.dir(path.join($path, 'public'));

  // icon.png
  jetpack.copy(path.join(paths.files, 'icon.png'), path.join($path, 'app', 'icon.png'));

  // Install deps
  spinner.text = 'Installing dependencies';
  await installDependencies({ cwd: $path, silent: true });

  spinner.succeed('Done');
}

init();
