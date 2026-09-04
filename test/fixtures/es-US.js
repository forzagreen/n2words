/**
 * Cardinal number test cases for Spanish (United States) - Short Scale
 * Format: [input, expected_output, options?]
 *
 * Uses short scale (like es-MX and en-US):
 * - 10⁹ = un billón
 * - 10¹² = un trillón
 */
export const cardinal = [
  // Decimals
  [0.01, 'cero punto cero uno'],
  [5.5, 'cinco punto cinco'],
  [17.42, 'diecisiete punto cuarenta y dos'],

  // Negatives
  [-1, 'menos uno'],
  [-20, 'menos veinte'],

  // Basic numbers
  [0, 'cero'],
  [1, 'uno'],
  [2, 'dos'],
  [10, 'diez'],
  [11, 'once'],
  [16, 'dieciseis'],
  [20, 'veinte'],
  [21, 'veintiuno'],
  [30, 'treinta'],
  [31, 'treinta y uno'],
  [100, 'cien'],
  [101, 'ciento uno'],
  [200, 'doscientos'],
  [1000, 'mil'],
  [1001, 'mil uno'],
  [2000, 'dos mil'],

  // Millions (same as es-MX)
  [1_000_000, 'un millón'],
  [2_000_000, 'dos millones'],

  // Billions - SHORT SCALE
  [1_000_000_000, 'un billón'],
  [2_000_000_000, 'dos billones'],

  // Trillions - SHORT SCALE
  [1_000_000_000_000, 'un trillón'],
  [2_000_000_000_000, 'dos trillones'],

  // Apocopation: a segment ending in 1 that multiplies a scale word drops to
  // "un"/"veintiún" — the scale word is the masculine noun it modifies.
  [21_000, 'veintiún mil'],
  [31_000, 'treinta y un mil'],
  [101_000, 'ciento un mil'],
  [1_021_000, 'un millón veintiún mil'],
  [21_000_000, 'veintiún millones'],
  [101_000_000, 'ciento un millones'],
  [21_000_000_000, 'veintiún billones'],
  [41_000_000_000, 'cuarenta y un billones'],
  // ...but a numeral before "punto" is standalone and keeps the full form
  // (as does a bare [21, 'veintiuno'], asserted above)
  [21.21, 'veintiuno punto veintiuno'],
  // Feminine never apocopates; the multiplier of "mil" is masculine either way
  [21_000, 'veintiún mil', { gender: 'feminine' }],
  [21_021, 'veintiún mil veintiuna', { gender: 'feminine' }],

  // Feminine gender tests
  [1, 'una', { gender: 'feminine' }],
  [21, 'veintiuna', { gender: 'feminine' }],
  [31, 'treinta y una', { gender: 'feminine' }],
  [101, 'ciento una', { gender: 'feminine' }],
  [201, 'doscientas una', { gender: 'feminine' }],
]

/**
 * Ordinal number test cases
 * Format: [input, expected_output, options?]
 *
 * Spanish ordinals are identical across all regions.
 */
export const ordinal = [
  // Basic ordinals
  [1, 'primero'],
  [2, 'segundo'],
  [3, 'tercero'],
  [10, 'décimo'],
  [11, 'décimo primero'],
  [20, 'vigésimo'],
  [21, 'vigésimo primero'],
  [100, 'centésimo'],
  [1000, 'milésimo'],
  [1000000, 'millonésimo'],

  // Feminine
  [1, 'primera', { gender: 'feminine' }],
  [10, 'décima', { gender: 'feminine' }],
  [21, 'vigésima primera', { gender: 'feminine' }],
]

/**
 * Currency test cases (US Dollar - USD)
 * Format: [input, expected_output, options?]
 */
export const currency = [
  // Basic amounts
  [0, 'cero dólares'],
  [1, 'un dólar'],
  [2, 'dos dólares'],
  [10, 'diez dólares'],
  [21, 'veintiún dólares'],
  [31, 'treinta y un dólares'],
  [101, 'ciento un dólares'],
  [100, 'cien dólares'],
  [1000, 'mil dólares'],
  [1000000, 'un millón dólares'],

  // Centavos only
  [0.01, 'un centavo'],
  [0.02, 'dos centavos'],
  [0.10, 'diez centavos'],
  [0.21, 'veintiún centavos'],
  [0.99, 'noventa y nueve centavos'],

  // Dollars and centavos
  [1.01, 'un dólar con un centavo'],
  [1.50, 'un dólar con cincuenta centavos'],
  [2.25, 'dos dólares con veinticinco centavos'],
  [42.50, 'cuarenta y dos dólares con cincuenta centavos'],
  [100.99, 'cien dólares con noventa y nueve centavos'],
  [1234.56, 'mil doscientos treinta y cuatro dólares con cincuenta y seis centavos'],
  [21.21, 'veintiún dólares con veintiún centavos'],

  // Without connector
  [42.50, 'cuarenta y dos dólares cincuenta centavos', { and: false }],
  [1.01, 'un dólar un centavo', { and: false }],

  // Negative amounts
  [-1, 'menos un dólar'],
  [-0.50, 'menos cincuenta centavos'],
  [-42.50, 'menos cuarenta y dos dólares con cincuenta centavos'],

  // Large amounts (short scale)
  [1000000000, 'un billón dólares'],
  [1000000000000, 'un trillón dólares'],
]
