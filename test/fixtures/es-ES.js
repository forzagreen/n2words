/**
 * Cardinal number test cases
 * Format: [input, expected_output, options?]
 */
export const cardinal = [
  [0.01, 'cero punto cero uno'],
  [0.007, 'cero punto cero cero siete'],
  [5.5, 'cinco punto cinco'],
  [17.42, 'diecisiete punto cuarenta y dos'],
  [27.312, 'veintisiete punto trescientos doce'],
  [53.486, 'cincuenta y tres punto cuatrocientos ochenta y seis'],
  [300.42, 'trescientos punto cuarenta y dos'],
  [4196.42, 'cuatro mil ciento noventa y seis punto cuarenta y dos'],

  [-17.42, 'menos diecisiete punto cuarenta y dos'],
  [-1, 'menos uno'],
  [-20, 'menos veinte'],

  [0, 'cero'],
  [1, 'uno'],
  [2, 'dos'],
  [3, 'tres'],
  [11, 'once'],
  [12, 'doce'],
  [16, 'dieciséis'],
  [116, 'ciento dieciséis'],
  [16_000, 'dieciséis mil'],
  [0.16, 'cero punto dieciséis'],
  [19, 'diecinueve'],
  [20, 'veinte'],
  [21, 'veintiuno'],
  [26, 'veintiséis'],
  [28, 'veintiocho'],
  [30, 'treinta'],
  [31, 'treinta y uno'],
  [40, 'cuarenta'],
  [44, 'cuarenta y cuatro'],
  [50, 'cincuenta'],
  [55, 'cincuenta y cinco'],
  [60, 'sesenta'],
  [67, 'sesenta y siete'],
  [70, 'setenta'],
  [79, 'setenta y nueve'],
  [89, 'ochenta y nueve'],
  [95, 'noventa y cinco'],
  [100, 'cien'],
  [101, 'ciento uno'],
  [199, 'ciento noventa y nueve'],
  [203, 'doscientos tres'],
  [287, 'doscientos ochenta y siete'],
  [356, 'trescientos cincuenta y seis'],
  [400, 'cuatrocientos'],
  [434, 'cuatrocientos treinta y cuatro'],
  [578, 'quinientos setenta y ocho'],
  [689, 'seiscientos ochenta y nueve'],
  [729, 'setecientos veintinueve'],
  [894, 'ochocientos noventa y cuatro'],
  [999, 'novecientos noventa y nueve'],
  [1000, 'mil'],
  [1001, 'mil uno'],
  [1097, 'mil noventa y siete'],
  [1104, 'mil ciento cuatro'],
  [1243, 'mil doscientos cuarenta y tres'],
  [2385, 'dos mil trescientos ochenta y cinco'],
  [3766, 'tres mil setecientos sesenta y seis'],
  [4196, 'cuatro mil ciento noventa y seis'],
  [5846, 'cinco mil ochocientos cuarenta y seis'],
  [6459, 'seis mil cuatrocientos cincuenta y nueve'],
  [7232, 'siete mil doscientos treinta y dos'],
  [8569, 'ocho mil quinientos sesenta y nueve'],
  [9539, 'nueve mil quinientos treinta y nueve'],
  [1_000_000, 'un millón'],
  [1_000_001, 'un millón uno'],
  [2_000_000, 'dos millones'],
  [5_000_000, 'cinco millones'],
  [1_000_000_000, 'mil millones'],
  [2_000_000_000, 'dos mil millones'],
  [5_000_000_000, 'cinco mil millones'],
  // Long scale: a 6-digit group is read whole in front of its scale word
  [1_234_567_890, 'mil doscientos treinta y cuatro millones quinientos sesenta y siete mil ochocientos noventa'],
  [2_500_000_000, 'dos mil quinientos millones'],
  [1_001_000_000, 'mil un millones'],
  [3_000_001_000, 'tres mil millones mil'],
  [1_500_000_000_000_000n, 'mil quinientos billones'],
  [1_000_000_000_000, 'un billón'],
  [2_000_000_000_000, 'dos billones'],
  [5_000_000_000_000, 'cinco billones'],
  [10_000_000_000_000, 'diez billones'],
  [100_000_000_000_000, 'cien billones'],
  [1_000_000_000_000_000, 'mil billones'],
  [1_000_000_000_000_000_000n, 'un trillón'],
  [2_000_000_000_000_000_000n, 'dos trillones'],
  [5_000_000_000_000_000_000n, 'cinco trillones'],
  [1_000_000_000_000_000_000_000n, 'mil trillones'],
  [1_000_000_000_000_000_000_000_000n, 'un cuatrillón'],
  [2_000_000_000_000_000_000_000_000n, 'dos cuatrillones'],
  [5_000_000_000_000_000_000_000_000n, 'cinco cuatrillones'],

  // Apocopation: a segment ending in 1 that multiplies a scale word drops to
  // "un"/"veintiún" — the scale word is the masculine noun it modifies.
  [21_000, 'veintiún mil'],
  [31_000, 'treinta y un mil'],
  [101_000, 'ciento un mil'],
  [121_000, 'ciento veintiún mil'],
  [1_021_000, 'un millón veintiún mil'],
  [21_000_001, 'veintiún millones uno'],
  [21_000_000, 'veintiún millones'],
  [101_000_000, 'ciento un millones'],
  [21_000_000_000n, 'veintiún mil millones'],
  [41_000_000_000n, 'cuarenta y un mil millones'],
  [21_000_000_000_000n, 'veintiún billones'],
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
  [121, 'ciento veintiuna', { gender: 'feminine' }],
  [201, 'doscientas una', { gender: 'feminine' }],
  [221, 'doscientas veintiuna', { gender: 'feminine' }],
  [300, 'trescientas', { gender: 'feminine' }],
  [301, 'trescientas una', { gender: 'feminine' }],
  [321, 'trescientas veintiuna', { gender: 'feminine' }],
  [400, 'cuatrocientas', { gender: 'feminine' }],
  [500, 'quinientas', { gender: 'feminine' }],
  [600, 'seiscientas', { gender: 'feminine' }],
  [700, 'setecientas', { gender: 'feminine' }],
  [800, 'ochocientas', { gender: 'feminine' }],
  [900, 'novecientas', { gender: 'feminine' }],
  [1001, 'mil una', { gender: 'feminine' }],
  [2001, 'dos mil una', { gender: 'feminine' }],
  [2121, 'dos mil ciento veintiuna', { gender: 'feminine' }],
]

/**
 * Ordinal number test cases
 * Format: [input, expected_output, options?]
 *
 * Spanish ordinals agree in gender with the noun they modify.
 * Default is masculine.
 */
export const ordinal = [
  // Basic ordinals 1-10 (masculine)
  [1, 'primero'],
  [2, 'segundo'],
  [3, 'tercero'],
  [4, 'cuarto'],
  [5, 'quinto'],
  [6, 'sexto'],
  [7, 'séptimo'],
  [8, 'octavo'],
  [9, 'noveno'],
  [10, 'décimo'],

  // Basic ordinals 1-10 (feminine)
  [1, 'primera', { gender: 'feminine' }],
  [2, 'segunda', { gender: 'feminine' }],
  [3, 'tercera', { gender: 'feminine' }],
  [4, 'cuarta', { gender: 'feminine' }],
  [5, 'quinta', { gender: 'feminine' }],
  [6, 'sexta', { gender: 'feminine' }],
  [7, 'séptima', { gender: 'feminine' }],
  [8, 'octava', { gender: 'feminine' }],
  [9, 'novena', { gender: 'feminine' }],
  [10, 'décima', { gender: 'feminine' }],

  // 11-19: one word (RAE), 11 and 12 with their own forms
  [11, 'undécimo'],
  [12, 'duodécimo'],
  [13, 'decimotercero'],
  [14, 'decimocuarto'],
  [15, 'decimoquinto'],
  [16, 'decimosexto'],
  [17, 'decimoséptimo'],
  [18, 'decimoctavo'],
  [19, 'decimonoveno'],

  // 21-29: one word; from 30 on, two words
  [20, 'vigésimo'],
  [21, 'vigesimoprimero'],
  [22, 'vigesimosegundo'],
  [28, 'vigesimoctavo'],
  [30, 'trigésimo'],
  [31, 'trigésimo primero'],
  [40, 'cuadragésimo'],
  [50, 'quincuagésimo'],
  [60, 'sexagésimo'],
  [70, 'septuagésimo'],
  [80, 'octogésimo'],
  [90, 'nonagésimo'],
  [99, 'nonagésimo noveno'],

  // Hundreds
  [100, 'centésimo'],
  [101, 'centésimo primero'],
  [110, 'centésimo décimo'],
  [111, 'centésimo undécimo'],
  [116, 'centésimo decimosexto'],
  [121, 'centésimo vigesimoprimero'],
  [200, 'ducentésimo'],
  [300, 'tricentésimo'],
  [400, 'cuadringentésimo'],
  [500, 'quingentésimo'],
  [600, 'sexcentésimo'],
  [700, 'septingentésimo'],
  [800, 'octingentésimo'],
  [900, 'noningentésimo'],
  [999, 'noningentésimo nonagésimo noveno'],

  // Thousands: the cardinal multiplier fuses into one word, unaccented
  [1000, 'milésimo'],
  [1001, 'milésimo primero'],
  [1100, 'milésimo centésimo'],
  [1248, 'milésimo ducentésimo cuadragésimo octavo'],
  [2000, 'dosmilésimo'],
  [3000, 'tresmilésimo'],
  [10000, 'diezmilésimo'],
  [16000, 'dieciseismilésimo'],
  [21000, 'veintiunmilésimo'],
  [22000, 'veintidosmilésimo'],
  [31000, 'treintaiunmilésimo'],
  [100000, 'cienmilésimo'],
  [500000, 'quinientosmilésimo'],
  [2345, 'dosmilésimo tricentésimo cuadragésimo quinto'],

  // Millions
  [1000000, 'millonésimo'],
  [2000000, 'dosmillonésimo'],
  [1000001, 'millonésimo primero'],
  [2500000, 'dosmillonésimo quinientosmilésimo'],

  // Feminine: one-word forms inflect only their last element
  [11, 'undécima', { gender: 'feminine' }],
  [16, 'decimosexta', { gender: 'feminine' }],
  [21, 'vigesimoprimera', { gender: 'feminine' }],
  [31, 'trigésima primera', { gender: 'feminine' }],
  [100, 'centésima', { gender: 'feminine' }],
  [500, 'quingentésima', { gender: 'feminine' }],
  [1000, 'milésima', { gender: 'feminine' }],
  [2000, 'dosmilésima', { gender: 'feminine' }],
  [1000000, 'millonésima', { gender: 'feminine' }],
]

/**
 * Currency test cases (Euro - Spain's official currency)
 * Format: [input, expected_output, options?]
 */
export const currency = [
  // Basic amounts
  [0, 'cero euros'],
  [1, 'un euro'],
  [2, 'dos euros'],
  [10, 'diez euros'],
  [16, 'dieciséis euros'],
  [21, 'veintiún euros'],
  [31, 'treinta y un euros'],
  [101, 'ciento un euros'],
  [100, 'cien euros'],
  [1000, 'mil euros'],
  // A round amount of millones takes "de" before the currency
  [1000000, 'un millón de euros'],
  [2000000, 'dos millones de euros'],
  [1000000.50, 'un millón de euros con cincuenta céntimos'],
  [1200000, 'un millón doscientos mil euros'],
  [1000001, 'un millón un euros'],

  // Cents only
  [0.01, 'un céntimo'],
  [0.02, 'dos céntimos'],
  [0.10, 'diez céntimos'],
  [0.21, 'veintiún céntimos'],
  [0.99, 'noventa y nueve céntimos'],

  // Euros and cents
  [1.01, 'un euro con un céntimo'],
  [1.50, 'un euro con cincuenta céntimos'],
  [2.25, 'dos euros con veinticinco céntimos'],
  [42.50, 'cuarenta y dos euros con cincuenta céntimos'],
  [100.99, 'cien euros con noventa y nueve céntimos'],
  [1234.56, 'mil doscientos treinta y cuatro euros con cincuenta y seis céntimos'],
  [21.21, 'veintiún euros con veintiún céntimos'],

  // Without connector
  [42.50, 'cuarenta y dos euros cincuenta céntimos', { and: false }],
  [1.01, 'un euro un céntimo', { and: false }],

  // Negative amounts
  [-1, 'menos un euro'],
  [-0.50, 'menos cincuenta céntimos'],
  [-42.50, 'menos cuarenta y dos euros con cincuenta céntimos'],

  // Large amounts (long scale)
  [1000000000, 'mil millones de euros'],
  [2500000000, 'dos mil quinientos millones de euros'],
  [1000000000000, 'un billón de euros'],
]
