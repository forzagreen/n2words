/**
 * Type tests for n2words subpath imports
 *
 * Comprehensive tests for all language imports including:
 * - Basic return types for all languages
 * - Input type acceptance (number, string, bigint)
 * - Invalid input rejection
 * - Options for all 20 languages with options
 * - Invalid option literal rejection
 *
 * Run with: npm run test:types
 */

import { expectType, expectError } from 'tsd'

// ============================================================================
// All subpath imports (alphabetical order)
// ============================================================================

import { toCardinal as am } from '../../src/am.js'
import { toCardinal as amLatn } from '../../src/am-Latn.js'
import { toCardinal as ar } from '../../src/ar.js'
import { toCardinal as az } from '../../src/az.js'
import { toCardinal as bn } from '../../src/bn.js'
import { toCardinal as cs } from '../../src/cs.js'
import { toCardinal as da } from '../../src/da.js'
import { toCardinal as de } from '../../src/de.js'
import { toCardinal as el } from '../../src/el.js'
import { toCardinal as enGB } from '../../src/en-GB.js'
import { toCardinal as enUS, toOrdinal as enUSOrdinal } from '../../src/en-US.js'
import { toCardinal as es } from '../../src/es.js'
import { toCardinal as fa } from '../../src/fa.js'
import { toCardinal as fi } from '../../src/fi.js'
import { toCardinal as fil } from '../../src/fil.js'
import { toCardinal as fr } from '../../src/fr.js'
import { toCardinal as frBE } from '../../src/fr-BE.js'
import { toCardinal as gu } from '../../src/gu.js'
import { toCardinal as ha } from '../../src/ha.js'
import { toCardinal as hbo } from '../../src/hbo.js'
import { toCardinal as he } from '../../src/he.js'
import { toCardinal as hi } from '../../src/hi.js'
import { toCardinal as hr } from '../../src/hr.js'
import { toCardinal as hu } from '../../src/hu.js'
import { toCardinal as id } from '../../src/id.js'
import { toCardinal as it } from '../../src/it.js'
import { toCardinal as ja } from '../../src/ja.js'
import { toCardinal as ka } from '../../src/ka.js'
import { toCardinal as kn } from '../../src/kn.js'
import { toCardinal as ko } from '../../src/ko.js'
import { toCardinal as lt } from '../../src/lt.js'
import { toCardinal as lv } from '../../src/lv.js'
import { toCardinal as mr } from '../../src/mr.js'
import { toCardinal as ms } from '../../src/ms.js'
import { toCardinal as nb } from '../../src/nb.js'
import { toCardinal as nl } from '../../src/nl.js'
import { toCardinal as pa } from '../../src/pa.js'
import { toCardinal as pl } from '../../src/pl.js'
import { toCardinal as pt } from '../../src/pt.js'
import { toCardinal as ro } from '../../src/ro.js'
import { toCardinal as ru } from '../../src/ru.js'
import { toCardinal as srCyrl } from '../../src/sr-Cyrl.js'
import { toCardinal as srLatn } from '../../src/sr-Latn.js'
import { toCardinal as sv } from '../../src/sv.js'
import { toCardinal as sw } from '../../src/sw.js'
import { toCardinal as ta } from '../../src/ta.js'
import { toCardinal as te } from '../../src/te.js'
import { toCardinal as th } from '../../src/th.js'
import { toCardinal as tr } from '../../src/tr.js'
import { toCardinal as uk } from '../../src/uk.js'
import { toCardinal as ur } from '../../src/ur.js'
import { toCardinal as vi } from '../../src/vi.js'
import { toCardinal as yo } from '../../src/yo.js'
import { toCardinal as zhHans } from '../../src/zh-Hans.js'
import { toCardinal as zhHant } from '../../src/zh-Hant.js'

// ============================================================================
// Basic return type - all languages return string
// ============================================================================

expectType<string>(am(1))
expectType<string>(amLatn(1))
expectType<string>(ar(1))
expectType<string>(az(1))
expectType<string>(bn(1))
expectType<string>(cs(1))
expectType<string>(da(1))
expectType<string>(de(1))
expectType<string>(el(1))
expectType<string>(enGB(1))
expectType<string>(enUS(1))
expectType<string>(es(1))
expectType<string>(fa(1))
expectType<string>(fi(1))
expectType<string>(fil(1))
expectType<string>(fr(1))
expectType<string>(frBE(1))
expectType<string>(gu(1))
expectType<string>(ha(1))
expectType<string>(hbo(1))
expectType<string>(he(1))
expectType<string>(hi(1))
expectType<string>(hr(1))
expectType<string>(hu(1))
expectType<string>(id(1))
expectType<string>(it(1))
expectType<string>(ja(1))
expectType<string>(ka(1))
expectType<string>(kn(1))
expectType<string>(ko(1))
expectType<string>(lt(1))
expectType<string>(lv(1))
expectType<string>(mr(1))
expectType<string>(ms(1))
expectType<string>(nb(1))
expectType<string>(nl(1))
expectType<string>(pa(1))
expectType<string>(pl(1))
expectType<string>(pt(1))
expectType<string>(ro(1))
expectType<string>(ru(1))
expectType<string>(srCyrl(1))
expectType<string>(srLatn(1))
expectType<string>(sv(1))
expectType<string>(sw(1))
expectType<string>(ta(1))
expectType<string>(te(1))
expectType<string>(th(1))
expectType<string>(tr(1))
expectType<string>(uk(1))
expectType<string>(ur(1))
expectType<string>(vi(1))
expectType<string>(yo(1))
expectType<string>(zhHans(1))
expectType<string>(zhHant(1))

// ============================================================================
// Input types - all accept number, string, bigint
// ============================================================================

expectType<string>(enUS(42))
expectType<string>(enUS('42'))
expectType<string>(enUS(42n))
expectType<string>(enUS(3.14))
expectType<string>(enUS(-42))

// ============================================================================
// Invalid inputs - should error
// ============================================================================

expectError(enUS(null))
expectError(enUS(undefined))
expectError(enUS({}))
expectError(enUS([]))
expectError(enUS(true))

// ============================================================================
// Options - Arabic (gender literal union + negativeWord string)
// ============================================================================

expectType<string>(ar(1, { gender: 'masculine' }))
expectType<string>(ar(1, { gender: 'feminine' }))
expectType<string>(ar(1, { negativeWord: 'سالب' }))
expectType<string>(ar(1, { gender: 'masculine', negativeWord: 'سالب' }))

expectError(ar(1, { gender: 'neuter' }))

// ============================================================================
// Options - American English (hundredPairing boolean)
// ============================================================================

expectType<string>(enUS(1, { hundredPairing: true }))
expectType<string>(enUS(1, { hundredPairing: false }))

// ============================================================================
// Options - Spanish (gender literal union)
// ============================================================================

expectType<string>(es(1, { gender: 'masculine' }))
expectType<string>(es(1, { gender: 'feminine' }))

expectError(es(1, { gender: 'neuter' }))

// ============================================================================
// Options - French (withHyphenSeparator boolean)
// ============================================================================

expectType<string>(fr(1, { withHyphenSeparator: true }))
expectType<string>(fr(1, { withHyphenSeparator: false }))

// ============================================================================
// Options - Belgian French (withHyphenSeparator boolean)
// ============================================================================

expectType<string>(frBE(1, { withHyphenSeparator: true }))
expectType<string>(frBE(1, { withHyphenSeparator: false }))

// ============================================================================
// Options - Biblical Hebrew (gender literal union + andWord string)
// ============================================================================

expectType<string>(hbo(1, { gender: 'masculine' }))
expectType<string>(hbo(1, { gender: 'feminine' }))
expectType<string>(hbo(1, { andWord: 'ו' }))
expectType<string>(hbo(1, { gender: 'feminine', andWord: 'ו' }))

expectError(hbo(1, { gender: 'neuter' }))

// ============================================================================
// Options - Modern Hebrew (andWord string only)
// ============================================================================

expectType<string>(he(1, { andWord: 'ו' }))

// ============================================================================
// Options - Croatian (gender literal union)
// ============================================================================

expectType<string>(hr(1, { gender: 'masculine' }))
expectType<string>(hr(1, { gender: 'feminine' }))

expectError(hr(1, { gender: 'neuter' }))

// ============================================================================
// Options - Lithuanian (gender string - flexible)
// ============================================================================

expectType<string>(lt(1, { gender: 'masculine' }))
expectType<string>(lt(1, { gender: 'feminine' }))

// ============================================================================
// Options - Latvian (gender string - flexible)
// ============================================================================

expectType<string>(lv(1, { gender: 'masculine' }))
expectType<string>(lv(1, { gender: 'feminine' }))

// ============================================================================
// Options - Dutch (multiple boolean options)
// ============================================================================

expectType<string>(nl(1, { accentOne: true }))
expectType<string>(nl(1, { accentOne: false }))
expectType<string>(nl(1, { includeOptionalAnd: true }))
expectType<string>(nl(1, { noHundredPairing: true }))
expectType<string>(nl(1, { accentOne: true, includeOptionalAnd: true, noHundredPairing: false }))

// ============================================================================
// Options - Polish (gender string - flexible)
// ============================================================================

expectType<string>(pl(1, { gender: 'masculine' }))
expectType<string>(pl(1, { gender: 'feminine' }))

// ============================================================================
// Options - Romanian (gender string - flexible)
// ============================================================================

expectType<string>(ro(1, { gender: 'masculine' }))
expectType<string>(ro(1, { gender: 'feminine' }))

// ============================================================================
// Options - Russian (gender literal union)
// ============================================================================

expectType<string>(ru(1, { gender: 'masculine' }))
expectType<string>(ru(1, { gender: 'feminine' }))

expectError(ru(1, { gender: 'neuter' }))

// ============================================================================
// Options - Serbian Cyrillic (gender literal union)
// ============================================================================

expectType<string>(srCyrl(1, { gender: 'masculine' }))
expectType<string>(srCyrl(1, { gender: 'feminine' }))

expectError(srCyrl(1, { gender: 'neuter' }))

// ============================================================================
// Options - Serbian Latin (gender literal union)
// ============================================================================

expectType<string>(srLatn(1, { gender: 'masculine' }))
expectType<string>(srLatn(1, { gender: 'feminine' }))

expectError(srLatn(1, { gender: 'neuter' }))

// ============================================================================
// Options - Turkish (dropSpaces boolean)
// ============================================================================

expectType<string>(tr(1, { dropSpaces: true }))
expectType<string>(tr(1, { dropSpaces: false }))

// ============================================================================
// Options - Ukrainian (gender literal union)
// ============================================================================

expectType<string>(uk(1, { gender: 'masculine' }))
expectType<string>(uk(1, { gender: 'feminine' }))

expectError(uk(1, { gender: 'neuter' }))

// ============================================================================
// Options - Simplified Chinese (formal boolean)
// ============================================================================

expectType<string>(zhHans(1, { formal: true }))
expectType<string>(zhHans(1, { formal: false }))

// ============================================================================
// Options - Traditional Chinese (formal boolean)
// ============================================================================

expectType<string>(zhHant(1, { formal: true }))
expectType<string>(zhHant(1, { formal: false }))

// ============================================================================
// Ordinals - American English toOrdinal
// ============================================================================

expectType<string>(enUSOrdinal(1))
expectType<string>(enUSOrdinal(42))
expectType<string>(enUSOrdinal('100'))
expectType<string>(enUSOrdinal(1000n))

expectError(enUSOrdinal(null))
expectError(enUSOrdinal(undefined))
