/**
 * Type tests for n2words subpath imports
 *
 * Tests that individual language imports work correctly.
 * Each language exports `toWords(value, options?)`.
 *
 * Run with: npm run test:types
 */

import { expectType } from 'tsd'

// ============================================================================
// Subpath Imports - No Options
// ============================================================================

import { toWords as enToWords } from '../../lib/languages/en.js'
import { toWords as deToWords } from '../../lib/languages/de.js'
import { toWords as jaToWords } from '../../lib/languages/ja.js'

// Basic conversion
expectType<string>(enToWords(42))
expectType<string>(deToWords(42))
expectType<string>(jaToWords(42))

// Input types
expectType<string>(enToWords('42'))
expectType<string>(enToWords(42n))
expectType<string>(enToWords(3.14))

// ============================================================================
// Subpath Imports - With Options
// ============================================================================

import { toWords as arToWords } from '../../lib/languages/ar.js'
import { toWords as zhHansToWords } from '../../lib/languages/zh-Hans.js'
import { toWords as nlToWords } from '../../lib/languages/nl.js'
import { toWords as frToWords } from '../../lib/languages/fr.js'
import { toWords as trToWords } from '../../lib/languages/tr.js'
import { toWords as ruToWords } from '../../lib/languages/ru.js'
import { toWords as heToWords } from '../../lib/languages/he.js'

// Gender option
expectType<string>(arToWords(1))
expectType<string>(arToWords(1, { gender: 'masculine' }))
expectType<string>(arToWords(1, { gender: 'feminine' }))

expectType<string>(ruToWords(1, { gender: 'masculine' }))
expectType<string>(ruToWords(1, { gender: 'feminine' }))

// Formal option (Chinese)
expectType<string>(zhHansToWords(123))
expectType<string>(zhHansToWords(123, { formal: true }))
expectType<string>(zhHansToWords(123, { formal: false }))

// Dutch options
expectType<string>(nlToWords(42))
expectType<string>(nlToWords(42, { accentOne: true }))
expectType<string>(nlToWords(42, { includeOptionalAnd: true }))
expectType<string>(nlToWords(42, { noHundredPairing: true }))

// French hyphen separator
expectType<string>(frToWords(42))
expectType<string>(frToWords(42, { withHyphenSeparator: true }))

// Turkish dropSpaces
expectType<string>(trToWords(42))
expectType<string>(trToWords(42, { dropSpaces: true }))

// Hebrew andWord
expectType<string>(heToWords(42))
expectType<string>(heToWords(42, { andWord: 'ו' }))
expectType<string>(heToWords(42, { gender: 'feminine' }))

// ============================================================================
// Hyphenated Language Codes (BCP 47)
// ============================================================================

import { toWords as zhHantToWords } from '../../lib/languages/zh-Hant.js'
import { toWords as frBEToWords } from '../../lib/languages/fr-BE.js'
import { toWords as srCyrlToWords } from '../../lib/languages/sr-Cyrl.js'
import { toWords as amLatnToWords } from '../../lib/languages/am-Latn.js'

expectType<string>(zhHantToWords(42))
expectType<string>(frBEToWords(42))
expectType<string>(srCyrlToWords(42))
expectType<string>(amLatnToWords(42))

// Options for hyphenated codes
expectType<string>(zhHantToWords(42, { formal: false }))
expectType<string>(frBEToWords(42, { withHyphenSeparator: true }))
expectType<string>(srCyrlToWords(42, { gender: 'feminine' }))
