/**
 * Type Tests for n2words
 *
 * Tests TypeScript types generated from JSDoc annotations.
 * Validates that all conversion functions have correct signatures.
 *
 * What this tests:
 * - Return types (all functions return string)
 * - Input types (number, string, bigint)
 * - Invalid input rejection
 * - Options types for languages with options
 *
 * Note: Runtime behavior is tested in conversions.test.js.
 * This file only tests compile-time type correctness.
 *
 * Run with: npm run test:types
 */

import { expectType, expectError } from 'tsd'

// ============================================================================
// Imports - en-US (reference implementation with both forms)
// ============================================================================

import { toCardinal, toOrdinal } from '../src/en-US.js'

// ============================================================================
// toCardinal - Input Types
// ============================================================================

// Valid inputs
expectType<string>(toCardinal(42))
expectType<string>(toCardinal('42'))
expectType<string>(toCardinal(42n))
expectType<string>(toCardinal(3.14))
expectType<string>(toCardinal(-42))

// Invalid inputs
expectError(toCardinal(null))
expectError(toCardinal(undefined))
expectError(toCardinal({}))
expectError(toCardinal([]))
expectError(toCardinal(true))

// ============================================================================
// toOrdinal - Input Types
// ============================================================================

// Valid inputs
expectType<string>(toOrdinal(1))
expectType<string>(toOrdinal('42'))
expectType<string>(toOrdinal(100n))

// Invalid inputs
expectError(toOrdinal(null))
expectError(toOrdinal(undefined))
expectError(toOrdinal({}))
expectError(toOrdinal([]))
expectError(toOrdinal(true))

// ============================================================================
// toCardinal - en-US Options
// ============================================================================

expectType<string>(toCardinal(1, { hundredPairing: true }))
expectType<string>(toCardinal(1, { hundredPairing: false }))
expectType<string>(toCardinal(1, { and: true }))
expectType<string>(toCardinal(1, { and: false }))
expectType<string>(toCardinal(1, { hundredPairing: true, and: true }))

// ============================================================================
// Cardinal Options - Languages with Options
// ============================================================================

// Arabic (gender literal union + negativeWord string)
import { toCardinal as ar } from '../src/ar.js'
expectType<string>(ar(1, { gender: 'masculine' }))
expectType<string>(ar(1, { gender: 'feminine' }))
expectType<string>(ar(1, { negativeWord: 'سالب' }))
expectType<string>(ar(1, { gender: 'masculine', negativeWord: 'سالب' }))
expectError(ar(1, { gender: 'neuter' }))

// Spanish (gender literal union)
import { toCardinal as es } from '../src/es.js'
expectType<string>(es(1, { gender: 'masculine' }))
expectType<string>(es(1, { gender: 'feminine' }))
expectError(es(1, { gender: 'neuter' }))

// French (withHyphenSeparator boolean)
import { toCardinal as fr } from '../src/fr.js'
expectType<string>(fr(1, { withHyphenSeparator: true }))
expectType<string>(fr(1, { withHyphenSeparator: false }))

// Belgian French (withHyphenSeparator boolean)
import { toCardinal as frBE } from '../src/fr-BE.js'
expectType<string>(frBE(1, { withHyphenSeparator: true }))
expectType<string>(frBE(1, { withHyphenSeparator: false }))

// Biblical Hebrew (gender literal union + andWord string)
import { toCardinal as hbo } from '../src/hbo.js'
expectType<string>(hbo(1, { gender: 'masculine' }))
expectType<string>(hbo(1, { gender: 'feminine' }))
expectType<string>(hbo(1, { andWord: 'ו' }))
expectType<string>(hbo(1, { gender: 'feminine', andWord: 'ו' }))
expectError(hbo(1, { gender: 'neuter' }))

// Modern Hebrew (andWord string only)
import { toCardinal as he } from '../src/he.js'
expectType<string>(he(1, { andWord: 'ו' }))

// Croatian (gender literal union)
import { toCardinal as hr } from '../src/hr.js'
expectType<string>(hr(1, { gender: 'masculine' }))
expectType<string>(hr(1, { gender: 'feminine' }))
expectError(hr(1, { gender: 'neuter' }))

// Lithuanian (gender)
import { toCardinal as lt } from '../src/lt.js'
expectType<string>(lt(1, { gender: 'masculine' }))
expectType<string>(lt(1, { gender: 'feminine' }))

// Latvian (gender)
import { toCardinal as lv } from '../src/lv.js'
expectType<string>(lv(1, { gender: 'masculine' }))
expectType<string>(lv(1, { gender: 'feminine' }))

// Dutch (multiple boolean options)
import { toCardinal as nl } from '../src/nl.js'
expectType<string>(nl(1, { accentOne: true }))
expectType<string>(nl(1, { accentOne: false }))
expectType<string>(nl(1, { includeOptionalAnd: true }))
expectType<string>(nl(1, { noHundredPairing: true }))
expectType<string>(nl(1, { accentOne: true, includeOptionalAnd: true, noHundredPairing: false }))

// Polish (gender)
import { toCardinal as pl } from '../src/pl.js'
expectType<string>(pl(1, { gender: 'masculine' }))
expectType<string>(pl(1, { gender: 'feminine' }))

// Romanian (gender)
import { toCardinal as ro } from '../src/ro.js'
expectType<string>(ro(1, { gender: 'masculine' }))
expectType<string>(ro(1, { gender: 'feminine' }))

// Russian (gender literal union)
import { toCardinal as ru } from '../src/ru.js'
expectType<string>(ru(1, { gender: 'masculine' }))
expectType<string>(ru(1, { gender: 'feminine' }))
expectError(ru(1, { gender: 'neuter' }))

// Serbian Cyrillic (gender literal union)
import { toCardinal as srCyrl } from '../src/sr-Cyrl.js'
expectType<string>(srCyrl(1, { gender: 'masculine' }))
expectType<string>(srCyrl(1, { gender: 'feminine' }))
expectError(srCyrl(1, { gender: 'neuter' }))

// Serbian Latin (gender literal union)
import { toCardinal as srLatn } from '../src/sr-Latn.js'
expectType<string>(srLatn(1, { gender: 'masculine' }))
expectType<string>(srLatn(1, { gender: 'feminine' }))
expectError(srLatn(1, { gender: 'neuter' }))

// Turkish (dropSpaces boolean)
import { toCardinal as tr } from '../src/tr.js'
expectType<string>(tr(1, { dropSpaces: true }))
expectType<string>(tr(1, { dropSpaces: false }))

// Ukrainian (gender literal union)
import { toCardinal as uk } from '../src/uk.js'
expectType<string>(uk(1, { gender: 'masculine' }))
expectType<string>(uk(1, { gender: 'feminine' }))
expectError(uk(1, { gender: 'neuter' }))

// Simplified Chinese (formal boolean)
import { toCardinal as zhHans } from '../src/zh-Hans.js'
expectType<string>(zhHans(1, { formal: true }))
expectType<string>(zhHans(1, { formal: false }))

// Traditional Chinese (formal boolean)
import { toCardinal as zhHant } from '../src/zh-Hant.js'
expectType<string>(zhHant(1, { formal: true }))
expectType<string>(zhHant(1, { formal: false }))

// ============================================================================
// Ordinal Options - Languages with Options
// ============================================================================

// (Currently no languages have ordinal options)
// Add tests here as ordinal options are implemented
