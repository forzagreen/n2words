/**
 * Cardinal number test cases
 * Format: [input, expected_output, options?]
 */
export const cardinal = [
  [0.01, 'zero virgola zero uno'],
  [1.007, 'uno virgola zero zero sette'],
  [1.7, 'uno virgola sette'],
  [17.42, 'diciassette virgola quarantadue'],
  [27.312, 'ventisette virgola trecentododici'],
  [53.486, 'cinquantatré virgola quattrocentottantasei'],
  [300.42, 'trecento virgola quarantadue'],
  [4196.42, 'quattromilacentonovantasei virgola quarantadue'],

  [-17.42, 'meno diciassette virgola quarantadue'],
  [-1, 'meno uno'],
  [-20, 'meno venti'],

  [0, 'zero'],
  [1, 'uno'],
  [2, 'due'],
  [3, 'tre'],
  [11, 'undici'],
  [12, 'dodici'],
  [16, 'sedici'],
  [19, 'diciannove'],
  [20, 'venti'],
  [21, 'ventuno'],
  [26, 'ventisei'],
  [28, 'ventotto'],
  [30, 'trenta'],
  [31, 'trentuno'],
  [40, 'quaranta'],
  [44, 'quarantaquattro'],
  [50, 'cinquanta'],
  [55, 'cinquantacinque'],
  [60, 'sessanta'],
  [67, 'sessantasette'],
  [70, 'settanta'],
  [79, 'settantanove'],
  [89, 'ottantanove'],
  [95, 'novantacinque'],
  [100, 'cento'],
  [101, 'centouno'],
  [121, 'centoventuno'],
  [199, 'centonovantanove'],
  [203, 'duecentotré'],
  [287, 'duecentottantasette'],
  [356, 'trecentocinquantasei'],
  [400, 'quattrocento'],
  [421, 'quattrocentoventuno'],
  [434, 'quattrocentotrentaquattro'],
  [578, 'cinquecentosettantotto'],
  [689, 'seicentottantanove'],
  [729, 'settecentoventinove'],
  [894, 'ottocentonovantaquattro'],
  [999, 'novecentonovantanove'],
  [1000, 'mille'],
  [1001, 'milleuno'],
  [1021, 'milleventuno'],
  [1097, 'millenovantasette'],
  [1104, 'millecentoquattro'],
  [1121, 'millecentoventuno'],
  [1243, 'milleduecentoquarantatré'],
  [2385, 'duemilatrecentottantacinque'],
  [3766, 'tremilasettecentosessantasei'],
  [4196, 'quattromilacentonovantasei'],
  [5846, 'cinquemilaottocentoquarantasei'],
  [6421, 'seimilaquattrocentoventuno'],
  [6459, 'seimilaquattrocentocinquantanove'],
  [7232, 'settemiladuecentotrentadue'],
  [8569, 'ottomilacinquecentosessantanove'],
  [9539, 'novemilacinquecentotrentanove'],
  [21_747, 'ventunomilasettecentoquarantasette'],
  [27_821, 'ventisettemilaottocentoventuno'],
  [1_000_000, 'un milione'],
  [1_000_000_000, 'un miliardo'],
  [1_000_001, 'un milione e uno'],
  [4_000_000, 'quattro milioni'],
  [10_000_000_000_000, 'dieci bilioni'],
  [100_000_000_000_000, 'cento bilioni'],
  [1_000_000_000_000_000_000n, 'un trilione']
]

/**
 * Ordinal number test cases (masculine form)
 * Format: [input, expected_output]
 */
export const ordinal = [
  // Irregular ordinals 1-10
  [1, 'primo'],
  [2, 'secondo'],
  [3, 'terzo'],
  [4, 'quarto'],
  [5, 'quinto'],
  [6, 'sesto'],
  [7, 'settimo'],
  [8, 'ottavo'],
  [9, 'nono'],
  [10, 'decimo'],

  // Teens (cardinal + esimo, drop final vowel)
  [11, 'undicesimo'],
  [12, 'dodicesimo'],
  [13, 'tredicesimo'],
  [14, 'quattordicesimo'],
  [15, 'quindicesimo'],
  [16, 'sedicesimo'],
  [17, 'diciassettesimo'],
  [18, 'diciottesimo'],
  [19, 'diciannovesimo'],

  // Tens
  [20, 'ventesimo'],
  [30, 'trentesimo'],
  [40, 'quarantesimo'],
  [50, 'cinquantesimo'],
  [60, 'sessantesimo'],
  [70, 'settantesimo'],
  [80, 'ottantesimo'],
  [90, 'novantesimo'],

  // Compound tens-ones
  [21, 'ventunesimo'],
  [22, 'ventiduesimo'],
  [23, 'ventitreesimo'],
  [28, 'ventottesimo'],
  [31, 'trentunesimo'],
  [42, 'quarantaduesimo'],
  [55, 'cinquantacinquesimo'],
  [67, 'sessantasettesimo'],
  [88, 'ottantottesimo'],
  [99, 'novantanovesimo'],

  // Hundreds
  [100, 'centesimo'],
  [101, 'centounesimo'],
  [102, 'centoduesimo'],
  [111, 'centoundicesimo'],
  [121, 'centoventunesimo'],
  [200, 'duecentesimo'],
  [300, 'trecentesimo'],
  [500, 'cinquecentesimo'],
  [999, 'novecentonovantanovesimo'],

  // Thousands
  [1000, 'millesimo'],
  [1001, 'milleunesimo'],
  [1021, 'milleventunesimo'],
  [1100, 'millecentesimo'],
  [2000, 'duemillesimo'],
  [5000, 'cinquemillesimo'],
  [10000, 'diecimillesimo'],
  [21000, 'ventunomillesimo'],
  [99999, 'novantanovemilanovecentonovantanovesimo'],

  // Larger scales
  [1_000_000, 'un milionesimo'],
  [1_000_001, 'un milione e unesimo'],
  [2_000_000, 'due milionesimo'],
  [1_000_000_000, 'un miliardiesimo'],
  [1_000_000_000_000, 'un bilionesimo'],

  // BigInt support
  [1_000_000_000_000_000_000n, 'un trilionesimo']
]

/**
 * Currency test cases (Euro)
 * Format: [input, expected_output, options?]
 */
export const currency = [
  // Zero
  [0, 'zero euro'],

  // Whole euros (euro is invariable)
  [1, 'un euro'],
  [2, 'due euro'],
  [10, 'dieci euro'],
  [21, 'ventuno euro'],
  [100, 'cento euro'],
  [1000, 'mille euro'],
  [1000000, 'un milione euro'],

  // Centesimi only
  [0.01, 'un centesimo'],
  [0.02, 'due centesimi'],
  [0.10, 'dieci centesimi'],
  [0.21, 'ventuno centesimi'],
  [0.50, 'cinquanta centesimi'],
  [0.99, 'novantanove centesimi'],

  // Euros and centesimi
  [1.01, 'un euro e un centesimo'],
  [1.50, 'un euro e cinquanta centesimi'],
  [2.02, 'due euro e due centesimi'],
  [21.21, 'ventuno euro e ventuno centesimi'],
  [42.50, 'quarantadue euro e cinquanta centesimi'],
  [100.99, 'cento euro e novantanove centesimi'],
  [1000.01, 'mille euro e un centesimo'],
  [1000000.01, 'un milione euro e un centesimo'],

  // Negative amounts
  [-1, 'meno un euro'],
  [-0.50, 'meno cinquanta centesimi'],
  [-42.50, 'meno quarantadue euro e cinquanta centesimi'],

  // Without "e" option
  [42.50, 'quarantadue euro cinquanta centesimi', { and: false }],
  [1.01, 'un euro un centesimo', { and: false }],

  // Edge cases: .00 centesimi should show euros only
  [5.00, 'cinque euro'],
  ['5.00', 'cinque euro'],
  [100.00, 'cento euro'],

  // String inputs
  ['42.50', 'quarantadue euro e cinquanta centesimi'],
  ['0.99', 'novantanove centesimi'],

  // BigInt (whole euros only)
  [1000000000000n, 'un bilione euro']
]
