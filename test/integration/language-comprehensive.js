import test from 'ava'
import * as n2words from '../../lib/n2words.js'
import { readdirSync } from 'node:fs'

/**
 * Comprehensive Language-Specific Tests
 *
 * Each language module defines an array of [input, expectedOutput, options] tuples.
 * These tests verify that each language correctly handles a comprehensive set of
 * test cases specific to that language's number formatting rules.
 *
 * Test files are located in test/fixtures/languages/*.js and are loaded dynamically.
 * This test dynamically imports all exported language converters from n2words.js.
 * Files are now named with IETF BCP 47 language codes (e.g., 'en.js', 'ar.js', 'fr-BE.js')
 * following international standards for language identification.
 */

/**
 * Maps IETF BCP 47 language codes to n2words export names
 * @param {string} languageCode - IETF language code (e.g., 'en', 'fr-BE', 'zh-Hans')
 * @returns {string} - The corresponding n2words export name (e.g., 'EnglishConverter')
 */
function languageCodeToExportName (languageCode) {
  // Map of IETF language codes to export names
  const codeToExport = {
    ar: 'ArabicConverter',
    az: 'AzerbaijaniConverter',
    bn: 'BengaliConverter',
    cs: 'CzechConverter',
    da: 'DanishConverter',
    de: 'GermanConverter',
    el: 'GreekConverter',
    en: 'EnglishConverter',
    es: 'SpanishConverter',
    fa: 'FarsiConverter',
    fil: 'FilipinoConverter',
    fr: 'FrenchConverter',
    'fr-BE': 'BelgianFrenchConverter',
    gu: 'GujaratiConverter',
    he: 'HebrewConverter',
    hbo: 'BiblicalHebrewConverter',
    hi: 'HindiConverter',
    hr: 'CroatianConverter',
    hu: 'HungarianConverter',
    id: 'IndonesianConverter',
    it: 'ItalianConverter',
    ja: 'JapaneseConverter',
    kn: 'KannadaConverter',
    ko: 'KoreanConverter',
    lt: 'LithuanianConverter',
    lv: 'LatvianConverter',
    mr: 'MarathiConverter',
    ms: 'MalayConverter',
    nb: 'NorwegianBokmalConverter',
    nl: 'DutchConverter',
    pa: 'PunjabiConverter',
    pl: 'PolishConverter',
    pt: 'PortugueseConverter',
    ro: 'RomanianConverter',
    ru: 'RussianConverter',
    'sr-Cyrl': 'SerbianCyrillicConverter',
    'sr-Latn': 'SerbianLatinConverter',
    sv: 'SwedishConverter',
    sw: 'SwahiliConverter',
    ta: 'TamilConverter',
    te: 'TeluguConverter',
    th: 'ThaiConverter',
    tr: 'TurkishConverter',
    uk: 'UkrainianConverter',
    ur: 'UrduConverter',
    vi: 'VietnameseConverter',
    'zh-Hans': 'ChineseSimplifiedConverter',
    'zh-Hant': 'ChineseTraditionalConverter'
  }

  return codeToExport[languageCode]
}

const files = readdirSync('./test/fixtures/languages')

for (const file of files) {
  if (file.includes('.js')) {
    await testLanguage(file)
  }
}

/**
 * Run language tests for specific language
 * @param {string} file language test file to run
 */
async function testLanguage (file) {
  const languageCode = file.replace('.js', '')
  const exportName = languageCodeToExportName(languageCode)

  const languageConverter = n2words[exportName]

  if (!languageConverter) {
    throw new Error(`Language converter '${exportName}' not found in n2words exports for language code: ${languageCode}`)
  }

  test(languageCode, async t => {
    const { default: testFile } = await import('../fixtures/languages/' + file)

    for (const testCase of testFile) {
      const [input, expected, options = {}] = testCase
      t.is(
        languageConverter(input, options),
        expected
      )
    }
  })
}
