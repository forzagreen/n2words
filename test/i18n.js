//// eslint-disable import/max-dependencies
//// eslint-disable-next-line import/no-unresolved
import test from 'ava';
import n2words from '../lib/n2words.js';
import ar from './i18n/ar.js';
import az from './i18n/az.js';
import cz from './i18n/cz.js';
import de from './i18n/de.js';
import dk from './i18n/dk.js';
import en from './i18n/en.js';
import es from './i18n/es.js';
import fa from './i18n/fa.js';
import fr from './i18n/fr.js';
import frBE from './i18n/fr-BE.js';
import he from './i18n/he.js';
import hr from './i18n/hr.js';
import hu from './i18n/hu.js';
import id from './i18n/id.js';
import it from './i18n/it.js';
import ko from './i18n/ko.js';
import lt from './i18n/lt.js';
import lv from './i18n/lv.js';
import nl from './i18n/nl.js';
import no from './i18n/no.js';
import pl from './i18n/pl.js';
import pt from './i18n/pt.js';
import ru from './i18n/ru.js';
import sr from './i18n/sr.js';
import tr from './i18n/tr.js';
import uk from './i18n/uk.js';
import vi from './i18n/vi.js';
import zh from './i18n/zh.js';
//// eslint-disable-next-line import/no-nodejs-modules
import * as fs from 'node:fs';
import chalk from 'chalk';

const tests = {
  'ar': ar,
  'az': az,
  'cz': cz,
  'de': de,
  'dk': dk,
  'en': en,
  'es': es,
  'fa': fa,
  'fr': fr,
  'fr-BE': frBE,
  'he': he,
  'hr': hr,
  'hu': hu,
  'id': id,
  'it': it,
  'ko': ko,
  'lt': lt,
  'lv': lv,
  'nl': nl,
  'no': no,
  'pl': pl,
  'pt': pt,
  'ru': ru,
  'sr': sr,
  'tr': tr,
  'uk': uk,
  'vi': vi,
  'zh': zh,
};

const parameter = process.argv[2];
const value = process.argv[3];

if (parameter == '--language' || parameter == '--lang') {
  if (fs.existsSync('./lib/i18n/' + value + '.js')) {
    testLanguage(value);
  } else {
    console.error(chalk.red('\ni18n language file does not exist: ' + value + '.js\n'));
  }
} else {
  for (const language of Object.keys(tests)) {
    testLanguage(language);
  }
}

/**
 * Run i18n tests for specific language
 * @param {string} language language code to run
 */
function testLanguage(language) {
  test(language, t => {
    for (const problem of tests[language]) {
      t.is(
        n2words(problem[0], Object.assign({ lang: language }, problem[2])),
        problem[1]
      );
    }
  });
}
