import { currency as baseCurrency } from './es-ES.js'
import { withCurrency } from '../helpers/alias-fixtures.js'

// n2words/es requires an explicit currency — a bare tag names a language and
// has no country to default from (docs/bare-tag-aliases.md). es-ES's cases are
// replayed with EUR named, so the alias is checked against the same expected
// strings its target is, while the local `currency` below shadows the
// star-exported one. That it *throws* without a currency is asserted in
// test/bare-tag-contract.test.js, which the fixture format can't express.
// eslint-disable-next-line import-x/export -- deliberate shadow, see comment above
export * from './es-ES.js'

// eslint-disable-next-line import-x/export -- deliberate shadow, see comment above
export const currency = withCurrency(baseCurrency, 'EUR')
