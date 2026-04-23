/**
 * Cardinal number test cases
 * Format: [input, expected_output, options?]
 */
export const cardinal = [
  [0.01, 'zero vírgula zero um'],
  [1.007, 'um vírgula zero zero sete'],
  [1.7, 'um vírgula sete'],
  [17.42, 'dezessete vírgula quarenta e dois'],
  [27.312, 'vinte e sete vírgula trezentos e doze'],
  [53.486, 'cinquenta e três vírgula quatrocentos e oitenta e seis'],
  [300.42, 'trezentos vírgula quarenta e dois'],
  [4196.42, 'quatro mil cento e noventa e seis vírgula quarenta e dois'],

  [-17.42, 'menos dezessete vírgula quarenta e dois'],
  [-1, 'menos um'],
  [-20, 'menos vinte'],

  [0, 'zero'],
  [1, 'um'],
  [2, 'dois'],
  [3, 'três'],
  [11, 'onze'],
  [12, 'doze'],
  [14, 'quatorze'],
  [16, 'dezesseis'],
  [17, 'dezessete'],
  [18, 'dezoito'],
  [19, 'dezenove'],
  [20, 'vinte'],
  [21, 'vinte e um'],
  [26, 'vinte e seis'],
  [28, 'vinte e oito'],
  [30, 'trinta'],
  [31, 'trinta e um'],
  [40, 'quarenta'],
  [44, 'quarenta e quatro'],
  [50, 'cinquenta'],
  [55, 'cinquenta e cinco'],
  [60, 'sessenta'],
  [67, 'sessenta e sete'],
  [70, 'setenta'],
  [79, 'setenta e nove'],
  [89, 'oitenta e nove'],
  [95, 'noventa e cinco'],
  [100, 'cem'],
  [101, 'cento e um'],
  [199, 'cento e noventa e nove'],
  [203, 'duzentos e três'],
  [287, 'duzentos e oitenta e sete'],
  [356, 'trezentos e cinquenta e seis'],
  [400, 'quatrocentos'],
  [434, 'quatrocentos e trinta e quatro'],
  [578, 'quinhentos e setenta e oito'],
  [689, 'seiscentos e oitenta e nove'],
  [729, 'setecentos e vinte e nove'],
  [894, 'oitocentos e noventa e quatro'],
  [999, 'novecentos e noventa e nove'],
  [1000, 'mil'],
  [1001, 'mil e um'],
  [1097, 'mil e noventa e sete'],
  [1100, 'mil e cem'],
  [1104, 'mil cento e quatro'],
  [1243, 'mil duzentos e quarenta e três'],
  [2385, 'dois mil trezentos e oitenta e cinco'],
  [3766, 'três mil setecentos e sessenta e seis'],
  [4196, 'quatro mil cento e noventa e seis'],
  [5846, 'cinco mil oitocentos e quarenta e seis'],
  [6459, 'seis mil quatrocentos e cinquenta e nove'],
  [7232, 'sete mil duzentos e trinta e dois'],
  [8569, 'oito mil quinhentos e sessenta e nove'],
  [9539, 'nove mil quinhentos e trinta e nove'],
  [1_000_000, 'um milhão'],
  [1_000_001, 'um milhão e um'],
  [4_000_000, 'quatro milhões'],
  [1_000_000_000, 'um bilhão'],
  [10_000_000_000_000, 'dez trilhões'],
  [100_000_000_000_000, 'cem trilhões'],
  [1_000_000_000_000_000_000n, 'um quintilhão']
]

/**
 * Ordinal number test cases
 * Format: [input, expected_output]
 */
export const ordinal = [
  // Basic ones (1-9)
  [1, 'primeiro'],
  [2, 'segundo'],
  [3, 'terceiro'],
  [4, 'quarto'],
  [5, 'quinto'],
  [6, 'sexto'],
  [7, 'sétimo'],
  [8, 'oitavo'],
  [9, 'nono'],

  // Teens (10-19)
  [10, 'décimo'],
  [11, 'décimo primeiro'],
  [12, 'décimo segundo'],
  [13, 'décimo terceiro'],
  [14, 'décimo quarto'],
  [15, 'décimo quinto'],
  [16, 'décimo sexto'],
  [17, 'décimo sétimo'],
  [18, 'décimo oitavo'],
  [19, 'décimo nono'],

  // Tens (20-90)
  [20, 'vigésimo'],
  [30, 'trigésimo'],
  [40, 'quadragésimo'],
  [50, 'quinquagésimo'],
  [60, 'sexagésimo'],
  [70, 'septuagésimo'],
  [80, 'octogésimo'],
  [90, 'nonagésimo'],

  // Compound tens-ones
  [21, 'vigésimo primeiro'],
  [22, 'vigésimo segundo'],
  [23, 'vigésimo terceiro'],
  [32, 'trigésimo segundo'],
  [42, 'quadragésimo segundo'],
  [53, 'quinquagésimo terceiro'],
  [67, 'sexagésimo sétimo'],
  [88, 'octogésimo oitavo'],
  [99, 'nonagésimo nono'],

  // Hundreds
  [100, 'centésimo'],
  [101, 'centésimo primeiro'],
  [102, 'centésimo segundo'],
  [103, 'centésimo terceiro'],
  [110, 'centésimo décimo'],
  [111, 'centésimo décimo primeiro'],
  [121, 'centésimo vigésimo primeiro'],
  [200, 'ducentésimo'],
  [300, 'tricentésimo'],
  [500, 'quingentésimo'],
  [999, 'nongentésimo nonagésimo nono'],

  // Thousands
  [1000, 'milésimo'],
  [1001, 'mil primeiro'],
  [1010, 'mil décimo'],
  [1100, 'mil centésimo'],
  [1111, 'mil centésimo décimo primeiro'],
  [2000, 'segundo milésimo'],
  [5000, 'quinto milésimo'],
  [10000, 'décimo milésimo'],
  [12345, 'doze mil tricentésimo quadragésimo quinto'],
  [99999, 'noventa e nove mil nongentésimo nonagésimo nono'],

  // Larger scales (short scale for pt-BR)
  [1_000_000, 'milionésimo'],
  [1_000_001, 'um milhão primeiro'],
  [2_000_000, 'segundo milionésimo'],
  [1_000_000_000, 'bilionésimo'],
  [1_000_000_000_000, 'trilionésimo'],

  // BigInt support
  [1_000_000_000_000_000_000n, 'quintilionésimo']
]

/**
 * Currency test cases (Brazilian Real by default)
 * Format: [input, expected_output, options?]
 */
export const currency = [
  // Zero
  [0, 'zero reais'],

  // Whole reais
  [1, 'um real'],
  [2, 'dois reais'],
  [10, 'dez reais'],
  [21, 'vinte e um reais'],
  [100, 'cem reais'],
  [1000, 'mil reais'],
  [1000000, 'um milhão reais'],

  // Centavos only
  [0.01, 'um centavo'],
  [0.02, 'dois centavos'],
  [0.10, 'dez centavos'],
  [0.21, 'vinte e um centavos'],
  [0.50, 'cinquenta centavos'],
  [0.99, 'noventa e nove centavos'],

  // Reais and centavos
  [1.01, 'um real e um centavo'],
  [1.50, 'um real e cinquenta centavos'],
  [2.02, 'dois reais e dois centavos'],
  [21.21, 'vinte e um reais e vinte e um centavos'],
  [42.50, 'quarenta e dois reais e cinquenta centavos'],
  [100.99, 'cem reais e noventa e nove centavos'],
  [1000.01, 'mil reais e um centavo'],
  [1000000.01, 'um milhão reais e um centavo'],

  // Negative amounts
  [-1, 'menos um real'],
  [-0.50, 'menos cinquenta centavos'],
  [-42.50, 'menos quarenta e dois reais e cinquenta centavos'],

  // Without "e" option
  [42.50, 'quarenta e dois reais cinquenta centavos', { and: false }],
  [1.01, 'um real um centavo', { and: false }],

  // Edge cases: .00 cents should show reais only
  [5.00, 'cinco reais'],
  ['5.00', 'cinco reais'],
  [50.00, 'cinquenta reais'],

  // String inputs
  ['42.50', 'quarenta e dois reais e cinquenta centavos'],
  ['1.99', 'um real e noventa e nove centavos'],

  // Other currencies via CURRENCIES dictionary
  [1, 'um dólar', { currency: 'USD' }],
  [42.50, 'quarenta e dois dólares e cinquenta centavos', { currency: 'USD' }],
  [42.50, 'quarenta e dois euros e cinquenta centavos', { currency: 'EUR' }],
  [5, 'cinco libras', { currency: 'GBP' }],
  [100, 'cem ienes', { currency: 'JPY' }],

  // Unknown currency falls back to using the code as the major word
  [5, 'cinco CAD', { currency: 'CAD' }],

  // BigInt (whole reais only)
  [1_000_000_000_000n, 'um trilhão reais']
]
