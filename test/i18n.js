/* eslint-disable node/no-unsupported-features/es-syntax */
/* eslint-disable import/no-nodejs-modules */
// eslint-disable-next-line import/no-unresolved, node/no-missing-import
import test from 'ava';

const parameter = process.argv[2];
const value = process.argv[3];

if (parameter == '--language' || parameter == '--lang') {
  //testLanguage(value);
} else {
  const {default: fs} = await import('fs/promises');

  const files = await fs.readdir('./lib/i18n');

  for (let i = 0; i < files.length; i++) {
    const i18n = files[i].replace('.js', '');
    const {default: language} = await import('../lib/i18n/' + i18n + '.js');
    const {default: problems} = await import('./i18n/' + i18n + '.js');

    test(i18n, t => {
      t.plan(problems.length);

      for (let i = 0; i < problems.length; i++) {
        t.is(language(problems[i][0], problems[i][2]), problems[i][1]);
      }
    });
  }
}
