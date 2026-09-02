# Migrating to v6

Three breaking changes, all in `toCurrency`. `toCardinal` and `toOrdinal` are
untouched, and whole amounts in a language's own currency are unaffected
everywhere.

If you call `toCurrency(value)` with no options and import a region-qualified
code (`n2words/en-US`, `n2words/de-DE`), nothing changes.

## 1. Bare tags no longer carry a default currency

A bare tag names a **language**; a default currency belongs to a **country**.
`n2words/en` used to inherit `en-US`'s USD, which quietly returned dollars to a
caller who asked only for English — across sixteen variants spanning USD, GBP,
INR, KES, NGN and ZAR.

```js
import { toCurrency } from 'n2words/en'

toCurrency(42.50)                      // v5: 'forty-two dollars and fifty cents'
                                       // v6: TypeError
toCurrency(42.50, { currency: 'GBP' }) // 'forty-two pounds and fifty pence'
```

**To migrate**, either name the currency, or import the region-qualified entry
point to keep a default:

```js
import { toCurrency } from 'n2words/en-US'
toCurrency(42.50) // 'forty-two dollars and fifty cents' — unchanged
```

This applies to all 46 bare tags, including single-variant families: `de` is
the only German variant shipped, but German is also spoken in Austria and
Switzerland, and CHF is not EUR. `toCardinal` and `toOrdinal` from a bare tag
are the exact same functions its target exports — only `toCurrency` changed.

See [bare-tag-aliases.md](./bare-tag-aliases.md#bare-tags-carry-no-default-currency).

## 2. The `currency` option is now validated in 41 languages

These languages declared `toCurrency(value)` with no options parameter and so
discarded the option silently. Passing `{ currency: 'USD' }` to `hi-IN`
returned `पाँच रुपये` ("five rupees") on 5.1.2; it now throws `RangeError`
naming the accepted set.

```js
import { toCurrency } from 'n2words/hi-IN'

toCurrency(5, { currency: 'USD' }) // v5: 'पाँच रुपये' (option ignored)
                                   // v6: RangeError: must be one of: INR
```

Affected: am-ET, am-Latn-ET, ar-SA, az-AZ, bn-BD, cs-CZ, da-DK, el-GR, fa-IR,
fi-FI, fil-PH, gu-IN, ha-NG, hbo-IL, he-IL, hi-IN, hr-HR, hu-HU, id-ID, ja-JP,
ka-GE, kn-IN, ko-KR, lt-LT, lv-LV, mr-IN, ms-MY, nb-NO, pa-IN, pl-PL, ro-RO,
sv-SE, sw-KE, ta-IN, te-IN, th-TH, tr-TR, uk-UA, ur-PK, vi-VN, yo-NG.

**To migrate**, drop the option (the output was already the language's own
currency) or check what the language accepts — every currency-exporting
language exports `currencyValues.currency`:

```js
import { currencyValues } from 'n2words/hi-IN'
currencyValues.currency // ['INR']
```

## 3. Unsupported currencies throw `RangeError`, not `TypeError`

In the 30 languages that already took an options object, an unsupported
`currency` changes error type. `currency` is now a *known* key, so an
out-of-set value is a range problem rather than a shape problem.

```js
try {
  toCurrency(5, { currency: 'XYZ' })
}
catch (error) {
  // v5: TypeError
  // v6: RangeError
}
```

Callers matching on `instanceof TypeError` must catch `RangeError` too.

Affected: de-DE, en-AU, en-BD, en-CA, en-GB, en-GH, en-IE, en-IN, en-KE, en-MY,
en-NG, en-NZ, en-PH, en-PK, en-SG, en-US, en-ZA, es-ES, es-MX, es-US, fr-BE,
fr-FR, it-IT, nl-NL, pt-PT, ru-RU, sr-Cyrl-RS, sr-Latn-RS, zh-Hans-CN,
zh-Hant-TW.

Passing a language's *own* code now succeeds where it used to throw, so
`toCurrency(5, { currency: 'USD' })` on en-US returns "five dollars".

### pt-BR specifically

`pt-BR`'s `currency` changed from a free-form string to a validated enum, so
three previously-accepted inputs now throw `RangeError`:

| input | v5 behaviour | v6 |
| --- | --- | --- |
| `{ currency: '' }` | documented default, auto-detected BRL | `RangeError` — the default is now the literal `BRL` |
| `{ currency: 'brl' }` | worked; lowercase codes were uppercased | `RangeError` — codes are case-sensitive |
| `{ currency: 'CAD' }` | documented fallback spelling the bare ISO code, e.g. "cinco CAD" | `RangeError` — pt-BR has no CAD words |

The currencies pt-BR can name are in its exported `currencyValues.currency`.

## What got better

The same release makes any language able to name any currency it has words
for, rather than only its own — `en-KE` can quote GBP, `en-AU` can quote KES —
because "which words" and "which country" are now separate axes. See
[currency-vocab.md](./currency-vocab.md) and
[language-layers.md](./language-layers.md).
