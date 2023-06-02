// eslint-disable-next-line import/no-unresolved, node/no-missing-import
import test from 'ava';

const parameter = process.argv[2];
const value = process.argv[3];

if (parameter == '--language' || parameter == '--lang') {
  await testLanguage(value);
} else {
  const {default: fs} = await import('fs/promises');

  const files = await fs.readdir('./lib/i18n');

  for (let i = 0; i < files.length; i++) {
    await testLanguage(files[i].replace('.js', ''));
  }
}

/**
 * Run i18n tests for specific language
 * @param {string} i18n language code to run
 */
async function testLanguage(i18n) {
  const {default: language} = await import('../lib/i18n/' + i18n + '.js');
  const {default: problems} = await import('./i18n/' + i18n + '.js');

  for (let i = 0; i < problems.length; i++) {
    test(i18n + ':' + problems[i][0], t => {
      t.is(language(problems[i][0], problems[i][2]), problems[i][1]);
    });
  }
}
