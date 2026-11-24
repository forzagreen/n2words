/**
 * Cardinal number test cases
 * Format: [input, expected_output, options?]
 */
export const cardinal = [
  [0.01, 'zero vírgula zero um'],
  [1.007, 'um vírgula zero zero sete'],
  [1.7, 'um vírgula sete'],
  [17.42, 'dezassete vírgula quarenta e dois'],
  [27.312, 'vinte e sete vírgula trezentos e doze'],
  [53.486, 'cinquenta e três vírgula quatrocentos e oitenta e seis'],
  [300.42, 'trezentos vírgula quarenta e dois'],
  [4196.42, 'quatro mil cento e noventa e seis vírgula quarenta e dois'],

  [-17.42, 'menos dezassete vírgula quarenta e dois'],
  [-1, 'menos um'],
  [-20, 'menos vinte'],

  [0, 'zero'],
  [1, 'um'],
  [2, 'dois'],
  [3, 'três'],
  [11, 'onze'],
  [12, 'doze'],
  [16, 'dezasseis'],
  [19, 'dezanove'],
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
  [1800, 'mil e oitocentos'],
  [1801, 'mil oitocentos e um'],
  [5500, 'cinco mil e quinhentos'],
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
  [1_001_000, 'um milhão e mil'],
  [1_001_500, 'um milhão mil e quinhentos'],
  [1_250_000, 'um milhão duzentos e cinquenta mil'],
  [1_500_000, 'um milhão e quinhentos mil'],
  [4_000_000, 'quatro milhões'],

  // Long scale: the number in front of each scale word runs up to 999 999
  [1_000_000_000, 'mil milhões'],
  [1_000_000_500, 'mil milhões e quinhentos'],
  [1_001_000_000, 'mil e um milhões'],
  [1_500_000_000, 'mil e quinhentos milhões'],
  [21_000_000_000, 'vinte e um mil milhões'],
  [12_345_678_901, 'doze mil trezentos e quarenta e cinco milhões seiscentos e setenta e oito mil novecentos e um'],
  [2_000_300_000_000, 'dois biliões e trezentos milhões'],
  [10_000_000_000_000, 'dez biliões'],
  [100_000_000_000_000, 'cem biliões'],
  [1_000_000_000_000_000, 'mil biliões'],
  [1_000_000_000_000_000_000n, 'um trilião'],
  [1_000_000_000_000_000_000_000_000_000n, 'mil quatriliões'],
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

  // Thousands: from 2000 on the first numeral is a cardinal, the rest ordinals
  [1000, 'milésimo'],
  [1001, 'milésimo primeiro'],
  [1010, 'milésimo décimo'],
  [1100, 'milésimo centésimo'],
  [1111, 'milésimo centésimo décimo primeiro'],
  [2345, 'dois milésimo tricentésimo quadragésimo quinto'],
  [12345, 'doze milésimo tricentésimo quadragésimo quinto'],
  [99999, 'noventa e nove milésimo nongentésimo nonagésimo nono'],

  // Round numbers keep an ordinal multiplier
  [2000, 'segundo milésimo'],
  [5000, 'quinto milésimo'],
  [10000, 'décimo milésimo'],
  [21000, 'vigésimo primeiro milésimo'],

  // Larger scales
  [1_000_000, 'milionésimo'],
  [1_000_001, 'milionésimo primeiro'],
  [2_000_000, 'segundo milionésimo'],
  [1_234_567, 'milionésimo ducentésimo trigésimo quarto milésimo quingentésimo sexagésimo sétimo'],
  [1_000_000_000, 'mil milionésimo'],
  [1_500_000_000, 'mil e quinhentos milionésimo'],
  [1_000_000_000_000, 'bilionésimo'],
  [1_001_000_000_000n, 'bilionésimo milésimo milionésimo'],
  [1_001_500_000_000n, 'bilionésimo milésimo quingentésimo milionésimo'],
  [2_002_000_000_000n, 'dois bilionésimo segundo milésimo milionésimo'],

  // BigInt support
  [1_000_000_000_000_000_000n, 'trilionésimo'],

  // Feminine: ordinals end in -a, and a leading cardinal agrees too
  [1, 'primeira', { gender: 'feminine' }],
  [2, 'segunda', { gender: 'feminine' }],
  [21, 'vigésima primeira', { gender: 'feminine' }],
  [100, 'centésima', { gender: 'feminine' }],
  [2000, 'segunda milésima', { gender: 'feminine' }],
  [2345, 'duas milésima tricentésima quadragésima quinta', { gender: 'feminine' }],
  [221345, 'duzentas e vinte e uma milésima tricentésima quadragésima quinta', { gender: 'feminine' }],
  [1_000_000_000, 'mil milionésima', { gender: 'feminine' }],
  [2_002_000_000_000n, 'duas bilionésima segunda milésima milionésima', { gender: 'feminine' }],
]

/**
 * Currency test cases (Euro)
 * Format: [input, expected_output, options?]
 */
export const currency = [
  // Zero
  [0, 'zero euros'],

  // Whole euros
  [1, 'um euro'],
  [2, 'dois euros'],
  [10, 'dez euros'],
  [21, 'vinte e um euros'],
  [100, 'cem euros'],
  [1000, 'mil euros'],
  [1000000, 'um milhão de euros'],
  [1_000_000_000, 'mil milhões de euros'],
  [1_500_000, 'um milhão e quinhentos mil euros'],
  [1_000_003, 'um milhão e três euros'],

  // Cents only
  [0.01, 'um cêntimo'],
  [0.02, 'dois cêntimos'],
  [0.10, 'dez cêntimos'],
  [0.21, 'vinte e um cêntimos'],
  [0.50, 'cinquenta cêntimos'],
  [0.99, 'noventa e nove cêntimos'],

  // Euros and cents
  [1.01, 'um euro e um cêntimo'],
  [1.50, 'um euro e cinquenta cêntimos'],
  [2.02, 'dois euros e dois cêntimos'],
  [21.21, 'vinte e um euros e vinte e um cêntimos'],
  [42.50, 'quarenta e dois euros e cinquenta cêntimos'],
  [100.99, 'cem euros e noventa e nove cêntimos'],
  [1000.01, 'mil euros e um cêntimo'],
  [1000000.01, 'um milhão de euros e um cêntimo'],

  // Negative amounts
  [-1, 'menos um euro'],
  [-0.50, 'menos cinquenta cêntimos'],
  [-42.50, 'menos quarenta e dois euros e cinquenta cêntimos'],

  // Without "e" option
  [42.50, 'quarenta e dois euros cinquenta cêntimos', { and: false }],
  [1.01, 'um euro um cêntimo', { and: false }],

  // Edge cases: .00 cents should show euros only
  [5.00, 'cinco euros'],
  ['5.00', 'cinco euros'],

  // String inputs
  ['42.50', 'quarenta e dois euros e cinquenta cêntimos'],

  // BigInt (whole euros only)
  [1000000000000n, 'um bilião de euros'],
]
