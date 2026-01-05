/**
 * n2words - Convert numbers to words in multiple languages
 *
 * Exports converter functions using normalized BCP 47 language codes.
 *
 * ## Usage
 *
 * ```js
 * // ESM - named imports
 * import { en, zhHans, frBE } from 'n2words'
 * en(42)       // 'forty-two'
 * zhHans(42)   // '四十二'
 *
 * // ESM - namespace import
 * import * as n2words from 'n2words'
 * n2words.en(42)
 *
 * // UMD (browser)
 * n2words.en(42)
 * n2words.zhHans(42)
 * ```
 *
 * ## Normalization
 *
 * BCP 47 codes with hyphens are normalized to camelCase:
 * - `zh-Hans` → `zhHans`
 * - `fr-BE` → `frBE`
 * - `sr-Cyrl` → `srCyrl`
 *
 * @module n2words
 */

// ============================================================================
// Language Imports (alphabetically sorted by normalized name)
// ============================================================================

import { toWords as am } from './languages/am.js'
import { toWords as amLatn } from './languages/am-Latn.js'
import { toWords as ar } from './languages/ar.js'
import { toWords as az } from './languages/az.js'
import { toWords as bn } from './languages/bn.js'
import { toWords as cs } from './languages/cs.js'
import { toWords as da } from './languages/da.js'
import { toWords as de } from './languages/de.js'
import { toWords as el } from './languages/el.js'
import { toWords as en } from './languages/en.js'
import { toWords as es } from './languages/es.js'
import { toWords as fa } from './languages/fa.js'
import { toWords as fi } from './languages/fi.js'
import { toWords as fil } from './languages/fil.js'
import { toWords as fr } from './languages/fr.js'
import { toWords as frBE } from './languages/fr-BE.js'
import { toWords as gu } from './languages/gu.js'
import { toWords as ha } from './languages/ha.js'
import { toWords as hbo } from './languages/hbo.js'
import { toWords as he } from './languages/he.js'
import { toWords as hi } from './languages/hi.js'
import { toWords as hr } from './languages/hr.js'
import { toWords as hu } from './languages/hu.js'
import { toWords as id } from './languages/id.js'
import { toWords as it } from './languages/it.js'
import { toWords as ja } from './languages/ja.js'
import { toWords as kn } from './languages/kn.js'
import { toWords as ko } from './languages/ko.js'
import { toWords as lt } from './languages/lt.js'
import { toWords as lv } from './languages/lv.js'
import { toWords as mr } from './languages/mr.js'
import { toWords as ms } from './languages/ms.js'
import { toWords as nb } from './languages/nb.js'
import { toWords as nl } from './languages/nl.js'
import { toWords as pa } from './languages/pa.js'
import { toWords as pl } from './languages/pl.js'
import { toWords as pt } from './languages/pt.js'
import { toWords as ro } from './languages/ro.js'
import { toWords as ru } from './languages/ru.js'
import { toWords as srCyrl } from './languages/sr-Cyrl.js'
import { toWords as srLatn } from './languages/sr-Latn.js'
import { toWords as sv } from './languages/sv.js'
import { toWords as sw } from './languages/sw.js'
import { toWords as ta } from './languages/ta.js'
import { toWords as te } from './languages/te.js'
import { toWords as th } from './languages/th.js'
import { toWords as tr } from './languages/tr.js'
import { toWords as uk } from './languages/uk.js'
import { toWords as ur } from './languages/ur.js'
import { toWords as vi } from './languages/vi.js'
import { toWords as zhHans } from './languages/zh-Hans.js'
import { toWords as zhHant } from './languages/zh-Hant.js'

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * Numeric value that can be converted to words.
 * @typedef {number | bigint | string} NumericValue
 */

// ============================================================================
// Exports
// ============================================================================

// Named exports for ESM tree-shaking
export {
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
}

// Default export for UMD builds (window.n2words = { en, es, ... })
export default {
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
}
