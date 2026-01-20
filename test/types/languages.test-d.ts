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

import { toWords as am } from '../../src/am.js'
import { toWords as amLatn } from '../../src/am-Latn.js'
import { toWords as ar } from '../../src/ar.js'
import { toWords as az } from '../../src/az.js'
import { toWords as bn } from '../../src/bn.js'
import { toWords as cs } from '../../src/cs.js'
import { toWords as da } from '../../src/da.js'
import { toWords as de } from '../../src/de.js'
import { toWords as el } from '../../src/el.js'
import { toWords as enGB } from '../../src/en-GB.js'
import { toWords as enUS, toOrdinal as enUSOrdinal } from '../../src/en-US.js'
import { toWords as es } from '../../src/es.js'
import { toWords as fa } from '../../src/fa.js'
import { toWords as fi } from '../../src/fi.js'
import { toWords as fil } from '../../src/fil.js'
import { toWords as fr } from '../../src/fr.js'
import { toWords as frBE } from '../../src/fr-BE.js'
import { toWords as gu } from '../../src/gu.js'
import { toWords as ha } from '../../src/ha.js'
import { toWords as hbo } from '../../src/hbo.js'
import { toWords as he } from '../../src/he.js'
import { toWords as hi } from '../../src/hi.js'
import { toWords as hr } from '../../src/hr.js'
import { toWords as hu } from '../../src/hu.js'
import { toWords as id } from '../../src/id.js'
import { toWords as it } from '../../src/it.js'
import { toWords as ja } from '../../src/ja.js'
import { toWords as ka } from '../../src/ka.js'
import { toWords as kn } from '../../src/kn.js'
import { toWords as ko } from '../../src/ko.js'
import { toWords as lt } from '../../src/lt.js'
import { toWords as lv } from '../../src/lv.js'
import { toWords as mr } from '../../src/mr.js'
import { toWords as ms } from '../../src/ms.js'
import { toWords as nb } from '../../src/nb.js'
import { toWords as nl } from '../../src/nl.js'
import { toWords as pa } from '../../src/pa.js'
import { toWords as pl } from '../../src/pl.js'
import { toWords as pt } from '../../src/pt.js'
import { toWords as ro } from '../../src/ro.js'
import { toWords as ru } from '../../src/ru.js'
import { toWords as srCyrl } from '../../src/sr-Cyrl.js'
import { toWords as srLatn } from '../../src/sr-Latn.js'
import { toWords as sv } from '../../src/sv.js'
import { toWords as sw } from '../../src/sw.js'
import { toWords as ta } from '../../src/ta.js'
import { toWords as te } from '../../src/te.js'
import { toWords as th } from '../../src/th.js'
import { toWords as tr } from '../../src/tr.js'
import { toWords as uk } from '../../src/uk.js'
import { toWords as ur } from '../../src/ur.js'
import { toWords as vi } from '../../src/vi.js'
import { toWords as yo } from '../../src/yo.js'
import { toWords as zhHans } from '../../src/zh-Hans.js'
import { toWords as zhHant } from '../../src/zh-Hant.js'

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
