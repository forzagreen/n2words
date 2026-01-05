/**
 * Type tests for n2words main export
 *
 * Tests the main entry point exports all converters with correct types.
 * Language-specific type tests are in languages.test-d.ts.
 *
 * Run with: npm run test:types
 */

import { expectType } from 'tsd'
import * as n2words from '../../lib/n2words.js'
import { en, ar, zhHans, frBE } from '../../lib/n2words.js'

// ============================================================================
// Main Export Structure
// ============================================================================

// Verify key exports exist and are functions
expectType<(value: number | string | bigint) => string>(n2words.en)
expectType<(value: number | string | bigint) => string>(n2words.de)
expectType<(value: number | string | bigint) => string>(n2words.ja)

// Verify normalized export names work (BCP 47 → camelCase)
expectType<string>(n2words.zhHans(42))   // zh-Hans
expectType<string>(n2words.zhHant(42))   // zh-Hant
expectType<string>(n2words.frBE(42))     // fr-BE
expectType<string>(n2words.srCyrl(42))   // sr-Cyrl
expectType<string>(n2words.srLatn(42))   // sr-Latn
expectType<string>(n2words.amLatn(42))   // am-Latn

// ============================================================================
// Input Types (representative test)
// ============================================================================

// All converters accept number, string, or bigint
expectType<string>(en(42))
expectType<string>(en('42'))
expectType<string>(en(42n))
expectType<string>(en(3.14))
expectType<string>(en(-42))

// ============================================================================
// Options (representative tests)
// ============================================================================

// Gender option
expectType<string>(ar(1, { gender: 'masculine' }))
expectType<string>(ar(1, { gender: 'feminine' }))

// Formal option
expectType<string>(zhHans(123, { formal: true }))
expectType<string>(zhHans(123, { formal: false }))

// Other options
expectType<string>(frBE(42, { withHyphenSeparator: true }))
