/**
 * n2words - Number to words converter
 *
 * This module re-exports all language converters as named exports.
 * Each export is a `toWords(value, options?)` function.
 *
 * Export names use normalized BCP 47 codes (hyphens → camelCase):
 * - `en`, `fr`, `de` (simple codes unchanged)
 * - `zhHans` (zh-Hans), `frBE` (fr-BE), `srCyrl` (sr-Cyrl)
 *
 * Imports and exports are alphabetically sorted by normalized name.
 *
 * @module n2words
 */

import { toWords as am } from './src/am.js'
import { toWords as amLatn } from './src/am-Latn.js'
import { toWords as ar } from './src/ar.js'
import { toWords as az } from './src/az.js'
import { toWords as bn } from './src/bn.js'
import { toWords as cs } from './src/cs.js'
import { toWords as da } from './src/da.js'
import { toWords as de } from './src/de.js'
import { toWords as el } from './src/el.js'
import { toWords as enGB } from './src/en-GB.js'
import { toWords as enUS } from './src/en-US.js'
import { toWords as es } from './src/es.js'
import { toWords as fa } from './src/fa.js'
import { toWords as fi } from './src/fi.js'
import { toWords as fil } from './src/fil.js'
import { toWords as fr } from './src/fr.js'
import { toWords as frBE } from './src/fr-BE.js'
import { toWords as gu } from './src/gu.js'
import { toWords as ha } from './src/ha.js'
import { toWords as hbo } from './src/hbo.js'
import { toWords as he } from './src/he.js'
import { toWords as hi } from './src/hi.js'
import { toWords as hr } from './src/hr.js'
import { toWords as hu } from './src/hu.js'
import { toWords as id } from './src/id.js'
import { toWords as it } from './src/it.js'
import { toWords as ja } from './src/ja.js'
import { toWords as ka } from './src/ka.js'
import { toWords as kn } from './src/kn.js'
import { toWords as ko } from './src/ko.js'
import { toWords as lt } from './src/lt.js'
import { toWords as lv } from './src/lv.js'
import { toWords as mr } from './src/mr.js'
import { toWords as ms } from './src/ms.js'
import { toWords as nb } from './src/nb.js'
import { toWords as nl } from './src/nl.js'
import { toWords as pa } from './src/pa.js'
import { toWords as pl } from './src/pl.js'
import { toWords as pt } from './src/pt.js'
import { toWords as ro } from './src/ro.js'
import { toWords as ru } from './src/ru.js'
import { toWords as srCyrl } from './src/sr-Cyrl.js'
import { toWords as srLatn } from './src/sr-Latn.js'
import { toWords as sv } from './src/sv.js'
import { toWords as sw } from './src/sw.js'
import { toWords as ta } from './src/ta.js'
import { toWords as te } from './src/te.js'
import { toWords as th } from './src/th.js'
import { toWords as tr } from './src/tr.js'
import { toWords as uk } from './src/uk.js'
import { toWords as ur } from './src/ur.js'
import { toWords as vi } from './src/vi.js'
import { toWords as yo } from './src/yo.js'
import { toWords as zhHans } from './src/zh-Hans.js'
import { toWords as zhHant } from './src/zh-Hant.js'

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
  enGB,
  enUS,
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
  ka,
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
  yo,
  zhHans,
  zhHant
}
