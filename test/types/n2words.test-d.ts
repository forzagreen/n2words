/**
 * Type tests for n2words library
 * Tests that TypeScript declarations work correctly
 *
 * Run with: npm run test:types
 *
 * NOTE: Tests verify the normalized BCP 47 export names (en, zhHans, frBE, etc.)
 */

import { expectType } from 'tsd'
import {
  am,
  amLatn,
  ar,
  az,
  bn,
  cs,
  da,
  de,
  el,
  en,
  es,
  fa,
  fi,
  fil,
  fr,
  frBE,
  gu,
  ha,
  hbo,
  he,
  hi,
  hr,
  hu,
  id,
  it,
  ja,
  kn,
  ko,
  lt,
  lv,
  mr,
  ms,
  nb,
  nl,
  pa,
  pl,
  pt,
  ro,
  ru,
  srCyrl,
  srLatn,
  sv,
  sw,
  ta,
  te,
  th,
  tr,
  uk,
  ur,
  vi,
  zhHans,
  zhHant
} from '../../lib/n2words.js'

// ============================================================================
// Basic Converter Tests - All converters return string
// ============================================================================

// English converter (representative test for input types)
expectType<string>(en(42))
expectType<string>(en(BigInt(42)))
expectType<string>(en('42'))
expectType<string>(en(3.14))

// All converters return string
expectType<string>(am(42))
expectType<string>(amLatn(42))
expectType<string>(ar(42))
expectType<string>(az(42))
expectType<string>(bn(42))
expectType<string>(cs(42))
expectType<string>(da(42))
expectType<string>(de(42))
expectType<string>(el(42))
expectType<string>(es(42))
expectType<string>(fa(42))
expectType<string>(fi(42))
expectType<string>(fil(42))
expectType<string>(fr(42))
expectType<string>(frBE(42))
expectType<string>(gu(42))
expectType<string>(ha(42))
expectType<string>(hbo(42))
expectType<string>(he(42))
expectType<string>(hi(42))
expectType<string>(hr(42))
expectType<string>(hu(42))
expectType<string>(id(42))
expectType<string>(it(42))
expectType<string>(ja(42))
expectType<string>(kn(42))
expectType<string>(ko(42))
expectType<string>(lt(42))
expectType<string>(lv(42))
expectType<string>(mr(42))
expectType<string>(ms(42))
expectType<string>(nb(42))
expectType<string>(nl(42))
expectType<string>(pa(42))
expectType<string>(pl(42))
expectType<string>(pt(42))
expectType<string>(ro(42))
expectType<string>(ru(42))
expectType<string>(srCyrl(42))
expectType<string>(srLatn(42))
expectType<string>(sv(42))
expectType<string>(sw(42))
expectType<string>(ta(42))
expectType<string>(te(42))
expectType<string>(th(42))
expectType<string>(tr(42))
expectType<string>(uk(42))
expectType<string>(ur(42))
expectType<string>(vi(42))
expectType<string>(zhHans(42))
expectType<string>(zhHant(42))

// ============================================================================
// Converters with Options
// ============================================================================

// Arabic with gender
expectType<string>(ar(42, { gender: 'masculine' }))
expectType<string>(ar(42, { gender: 'feminine' }))

// Chinese with formal
expectType<string>(zhHans(42, { formal: true }))
expectType<string>(zhHant(42, { formal: true }))

// Slavic/Baltic languages with gender
expectType<string>(hr(42, { gender: 'feminine' }))
expectType<string>(lv(42, { gender: 'masculine' }))
expectType<string>(lt(42, { gender: 'feminine' }))
expectType<string>(pl(42, { gender: 'masculine' }))
expectType<string>(ru(42, { gender: 'feminine' }))
expectType<string>(srCyrl(42, { gender: 'masculine' }))
expectType<string>(srLatn(42, { gender: 'feminine' }))
expectType<string>(uk(42, { gender: 'masculine' }))

// Romance languages with gender
expectType<string>(es(42, { gender: 'feminine' }))
expectType<string>(ro(42, { gender: 'masculine' }))

// Hebrew with andWord
expectType<string>(he(42, { andWord: 'ו' }))
expectType<string>(hbo(42, { andWord: 'ו', gender: 'masculine' }))

// French with hyphen separator
expectType<string>(fr(42, { withHyphenSeparator: true }))
expectType<string>(frBE(42, { withHyphenSeparator: true }))

// Dutch options
expectType<string>(nl(42, { includeOptionalAnd: true }))
expectType<string>(nl(42, { noHundredPairing: true }))

// Turkish dropSpaces
expectType<string>(tr(42, { dropSpaces: true }))

// ============================================================================
// Input Type Tests
// ============================================================================

// Test all valid input types
expectType<string>(en(0))
expectType<string>(en(-42))
expectType<string>(en(3.14159))
expectType<string>(en(BigInt('9007199254740992')))
expectType<string>(en('123'))
expectType<string>(en('3.14'))

// ============================================================================
// Return Type Tests
// ============================================================================

// All converters must return string
const result1: string = en(42)
const result2: string = ar(42, { gender: 'feminine' })
const result3: string = zhHans(42, { formal: true })
