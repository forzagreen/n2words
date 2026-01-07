/**
 * Type tests for n2words subpath imports
 *
 * Comprehensive tests for all 52 language imports including:
 * - Basic return types for all languages
 * - Input type acceptance (number, string, bigint)
 * - Invalid input rejection
 * - Options for all 19 languages with options
 * - Invalid option literal rejection
 *
 * Run with: npm run test:types
 */

import { expectType, expectError } from 'tsd'

// ============================================================================
// All 52 subpath imports (alphabetical order)
// ============================================================================

import { toWords as am } from '../../lib/languages/am.js'
import { toWords as amLatn } from '../../lib/languages/am-Latn.js'
import { toWords as ar } from '../../lib/languages/ar.js'
import { toWords as az } from '../../lib/languages/az.js'
import { toWords as bn } from '../../lib/languages/bn.js'
import { toWords as cs } from '../../lib/languages/cs.js'
import { toWords as da } from '../../lib/languages/da.js'
import { toWords as de } from '../../lib/languages/de.js'
import { toWords as el } from '../../lib/languages/el.js'
import { toWords as en } from '../../lib/languages/en.js'
import { toWords as es } from '../../lib/languages/es.js'
import { toWords as fa } from '../../lib/languages/fa.js'
import { toWords as fi } from '../../lib/languages/fi.js'
import { toWords as fil } from '../../lib/languages/fil.js'
import { toWords as fr } from '../../lib/languages/fr.js'
import { toWords as frBE } from '../../lib/languages/fr-BE.js'
import { toWords as gu } from '../../lib/languages/gu.js'
import { toWords as ha } from '../../lib/languages/ha.js'
import { toWords as hbo } from '../../lib/languages/hbo.js'
import { toWords as he } from '../../lib/languages/he.js'
import { toWords as hi } from '../../lib/languages/hi.js'
import { toWords as hr } from '../../lib/languages/hr.js'
import { toWords as hu } from '../../lib/languages/hu.js'
import { toWords as id } from '../../lib/languages/id.js'
import { toWords as it } from '../../lib/languages/it.js'
import { toWords as ja } from '../../lib/languages/ja.js'
import { toWords as kn } from '../../lib/languages/kn.js'
import { toWords as ko } from '../../lib/languages/ko.js'
import { toWords as lt } from '../../lib/languages/lt.js'
import { toWords as lv } from '../../lib/languages/lv.js'
import { toWords as mr } from '../../lib/languages/mr.js'
import { toWords as ms } from '../../lib/languages/ms.js'
import { toWords as nb } from '../../lib/languages/nb.js'
import { toWords as nl } from '../../lib/languages/nl.js'
import { toWords as pa } from '../../lib/languages/pa.js'
import { toWords as pl } from '../../lib/languages/pl.js'
import { toWords as pt } from '../../lib/languages/pt.js'
import { toWords as ro } from '../../lib/languages/ro.js'
import { toWords as ru } from '../../lib/languages/ru.js'
import { toWords as srCyrl } from '../../lib/languages/sr-Cyrl.js'
import { toWords as srLatn } from '../../lib/languages/sr-Latn.js'
import { toWords as sv } from '../../lib/languages/sv.js'
import { toWords as sw } from '../../lib/languages/sw.js'
import { toWords as ta } from '../../lib/languages/ta.js'
import { toWords as te } from '../../lib/languages/te.js'
import { toWords as th } from '../../lib/languages/th.js'
import { toWords as tr } from '../../lib/languages/tr.js'
import { toWords as uk } from '../../lib/languages/uk.js'
import { toWords as ur } from '../../lib/languages/ur.js'
import { toWords as vi } from '../../lib/languages/vi.js'
import { toWords as zhHans } from '../../lib/languages/zh-Hans.js'
import { toWords as zhHant } from '../../lib/languages/zh-Hant.js'

// ============================================================================
// Basic return type - all 52 languages return string
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
expectType<string>(en(1))
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
expectType<string>(zhHans(1))
expectType<string>(zhHant(1))

// ============================================================================
// Input types - all accept number, string, bigint
// ============================================================================

expectType<string>(en(42))
expectType<string>(en('42'))
expectType<string>(en(42n))
expectType<string>(en(3.14))
expectType<string>(en(-42))

// ============================================================================
// Invalid inputs - should error
// ============================================================================

expectError(en(null))
expectError(en(undefined))
expectError(en({}))
expectError(en([]))
expectError(en(true))

// ============================================================================
// Options - Arabic (gender literal union + negativeWord string)
// ============================================================================

expectType<string>(ar(1, { gender: 'masculine' }))
expectType<string>(ar(1, { gender: 'feminine' }))
expectType<string>(ar(1, { negativeWord: 'سالب' }))
expectType<string>(ar(1, { gender: 'masculine', negativeWord: 'سالب' }))

expectError(ar(1, { gender: 'neuter' }))

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
// Options - Modern Hebrew (gender literal union + andWord string)
// ============================================================================

expectType<string>(he(1, { gender: 'masculine' }))
expectType<string>(he(1, { gender: 'feminine' }))
expectType<string>(he(1, { andWord: 'ו' }))

expectError(he(1, { gender: 'neuter' }))

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
