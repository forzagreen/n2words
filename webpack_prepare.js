const fs = require('fs');

// keep sync with the main list...
const languages = ['en', 'fr', 'es', 'de', 'pt', 'it', 'tr', 'ru', 'cz', 'no', 'dk', 'pl', 'uk', 'lt', 'lv', 'ar', 'he', 'ko', 'nl', 'sr', 'fa'];

const dir = 'webpack';

function doPrepare() {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }

  const template = `
  // as run from ./webpack
  import Num2Word from '../lib/i18n/LANG.mjs';
  
  /**
   * @param n
   */
  export default function(n) {
    return new Num2Word().toCardinal(n);
  }
  `;

  for (let i = 0; i < languages.length; i++) {
    const lang = languages[i].toUpperCase();
    fs.writeFileSync(
      `./${dir}/n2words_${lang}.mjs`,
      template.replace('LANG', lang),
      'utf-8');
  }

}

doPrepare();
