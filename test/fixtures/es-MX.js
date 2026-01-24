/**
 * Cardinal number test cases for Spanish (Mexico) - Long Scale
 * Format: [input, expected_output, options?]
 *
 * Per RAE and Academia Mexicana, Mexico uses the European long scale:
 * - 10⁶ = un millón
 * - 10⁹ = mil millones (thousand millions)
 * - 10¹² = un billón
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

  // Billions - LONG SCALE (same as es-ES)
  // 10⁹ = mil millones (thousand millions)
  [1_000_000_000, 'mil millones'],
  [2_000_000_000, 'dos mil millones'],
  [5_000_000_000, 'cinco mil millones'],
  [1_234_567_890, 'mil millones doscientos treinta y cuatro millones quinientos sesenta y siete mil ochocientos noventa'],

  // Trillions - LONG SCALE (same as es-ES)
  // 10¹² = un billón
  [1_000_000_000_000, 'un billón'],
  [2_000_000_000_000, 'dos billones'],
  [5_000_000_000_000, 'cinco billones'],

  // Quadrillions - LONG SCALE
  // 10¹⁵ = mil billones
  [1_000_000_000_000_000, 'mil billones'],
  [2_000_000_000_000_000, 'dos mil billones'],

  // Quintillions - LONG SCALE
  // 10¹⁸ = un trillón
  [1_000_000_000_000_000_000n, 'un trillón'],
  [2_000_000_000_000_000_000n, 'dos trillones'],

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

/**
 * Ordinal number test cases
 * Format: [input, expected_output, options?]
 *
 * Spanish ordinals are identical across regions (es-ES and es-MX).
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
  [10, 'décima', { gender: 'feminine' }],

  // Teens and tens
  [11, 'décimo primero'],
  [12, 'décimo segundo'],
  [20, 'vigésimo'],
  [21, 'vigésimo primero'],
  [30, 'trigésimo'],
  [40, 'cuadragésimo'],
  [50, 'quincuagésimo'],
  [99, 'nonagésimo noveno'],

  // Hundreds
  [100, 'centésimo'],
  [101, 'centésimo primero'],
  [200, 'ducentésimo'],
  [500, 'quincentésimo'],

  // Thousands
  [1000, 'milésimo'],
  [1001, 'milésimo primero'],
  [2000, 'segundo milésimo'],

  // Millions
  [1000000, 'millonésimo'],

  // Feminine
  [100, 'centésima', { gender: 'feminine' }],
  [1000, 'milésima', { gender: 'feminine' }],
  [21, 'vigésima primera', { gender: 'feminine' }]
]

/**
 * Currency test cases (Mexican Peso - MXN)
 * Format: [input, expected_output, options?]
 */
export const currency = [
  // Basic amounts
  [0, 'cero pesos'],
  [1, 'un peso'],
  [2, 'dos pesos'],
  [10, 'diez pesos'],
  [21, 'veintiuno pesos'],
  [100, 'cien pesos'],
  [1000, 'mil pesos'],
  [1000000, 'un millón pesos'],

  // Centavos only
  [0.01, 'un centavo'],
  [0.02, 'dos centavos'],
  [0.10, 'diez centavos'],
  [0.21, 'veintiuno centavos'],
  [0.99, 'noventa y nueve centavos'],

  // Pesos and centavos
  [1.01, 'un peso con un centavo'],
  [1.50, 'un peso con cincuenta centavos'],
  [2.25, 'dos pesos con veinticinco centavos'],
  [42.50, 'cuarenta y dos pesos con cincuenta centavos'],
  [100.99, 'cien pesos con noventa y nueve centavos'],
  [1234.56, 'mil doscientos treinta y cuatro pesos con cincuenta y seis centavos'],

  // Without connector
  [42.50, 'cuarenta y dos pesos cincuenta centavos', { and: false }],
  [1.01, 'un peso un centavo', { and: false }],

  // Negative amounts
  [-1, 'menos un peso'],
  [-0.50, 'menos cincuenta centavos'],
  [-42.50, 'menos cuarenta y dos pesos con cincuenta centavos'],

  // Large amounts (long scale)
  [1000000000, 'mil millones pesos'],
  [1000000000000, 'un billón pesos']
]
