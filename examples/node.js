/* eslint-disable import/no-nodejs-modules */
import chalk from 'chalk';
import * as fs from 'fs';
import { stdin as input, stdout as output } from 'node:process';
// eslint-disable-next-line import/no-unresolved
import * as readline from 'node:readline/promises';

const rl = readline.createInterface({ input, output });

const lang = await rl.question('\nLanguage to use?\n');

if (fs.existsSync('./lib/i18n/' + lang + '.js')) {
  const value = await rl.question('\nValue to convert?\n');

  const { default: n2words } = await import('../lib/i18n/' + lang + '.js');

  const result = n2words(value, {
    lang: lang
  });

  console.log('\n' + chalk.bold(result) + '\n');
} else {
  console.error(chalk.red('\ni18n language file does not exist: ' + lang + '.js\n'));
}

rl.close();
