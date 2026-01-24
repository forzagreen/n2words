/**
 * Cardinal number test cases for Spanish (Mexico) - Short Scale
 * Format: [input, expected_output, options?]
 *
 * Key difference from es-ES (long scale):
 * - 10⁹ = un billón (not mil millones)
 * - 10¹² = un trillón (not un billón)
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
  [16, 'dieciseis'],
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

  // Millions (same as es-ES)
  [1_000_000, 'un millón'],
  [1_000_001, 'un millón uno'],
  [2_000_000, 'dos millones'],
  [5_000_000, 'cinco millones'],
  [123_456_789, 'ciento veintitrés millones cuatrocientos cincuenta y seis mil setecientos ochenta y nueve'],

  // Billions - SHORT SCALE (different from es-ES!)
  // 10⁹ = un billón (es-ES: mil millones)
  [1_000_000_000, 'un billón'],
  [2_000_000_000, 'dos billones'],
  [5_000_000_000, 'cinco billones'],
  [1_234_567_890, 'un billón doscientos treinta y cuatro millones quinientos sesenta y siete mil ochocientos noventa'],

  // Trillions - SHORT SCALE (different from es-ES!)
  // 10¹² = un trillón (es-ES: un billón)
  [1_000_000_000_000, 'un trillón'],
  [2_000_000_000_000, 'dos trillones'],
  [5_000_000_000_000, 'cinco trillones'],

  // Quadrillions - SHORT SCALE
  // 10¹⁵ = un cuatrillón (es-ES: mil billones)
  [1_000_000_000_000_000, 'un cuatrillón'],
  [2_000_000_000_000_000, 'dos cuatrillones'],

  // Quintillions - SHORT SCALE
  // 10¹⁸ = un quintillón (es-ES: un trillón)
  [1_000_000_000_000_000_000n, 'un quintillón'],
  [2_000_000_000_000_000_000n, 'dos quintillones'],

  // Feminine gender tests (same as es-ES)
  [1, 'una', { gender: 'feminine' }],
  [21, 'veintiuna', { gender: 'feminine' }],
  [31, 'treinta y una', { gender: 'feminine' }],
  [101, 'cienta una', { gender: 'feminine' }],
  [121, 'cienta veintiuna', { gender: 'feminine' }],
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
  [2121, 'dos mil cienta veintiuna', { gender: 'feminine' }]
]
