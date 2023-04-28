/* eslint-disable import/no-nodejs-modules */
import n2words from './lib/i18n/EN.mjs';
import * as readline from 'node:readline/promises';
import {stdin, stdout} from 'node:process';

const rl = readline.createInterface({stdin, stdout});

console.log(n2words(await rl.question('Value to convert?')));

rl.close();
