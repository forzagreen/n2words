/**
 * Cardinal number test cases
 * Format: [input, expected_output, options?]
 */
export const cardinal = [
  // Decimal numbers
  [0.01, 'zero virgulă zero unu'],
  [0.007, 'zero virgulă zero zero șapte'],
  [1.007, 'unu virgulă zero zero șapte'],
  [5.5, 'cinci virgulă cinci'],
  [17.42, 'șaptesprezece virgulă patruzeci și doi'],
  [27.312, 'douăzeci și șapte virgulă trei sute doisprezece'],
  [53.486, 'cincizeci și trei virgulă patru sute optzeci și șase'],
  [300.42, 'trei sute virgulă patruzeci și doi'],
  [4196.42, 'patru mii o sută nouăzeci și șase virgulă patruzeci și doi'],

  // Negative numbers
  [-17.42, 'minus șaptesprezece virgulă patruzeci și doi'],
  [-1, 'minus unu'],
  [-20, 'minus douăzeci'],

  // Basic numbers 0-20
  [0, 'zero'],
  [1, 'unu'],
  [2, 'doi'],
  [3, 'trei'],
  [4, 'patru'],
  [5, 'cinci'],
  [6, 'șase'],
  [7, 'șapte'],
  [8, 'opt'],
  [9, 'nouă'],
  [10, 'zece'],
  [11, 'unsprezece'],
  [12, 'douăsprezece'],
  [13, 'treisprezece'],
  [14, 'paisprezece'],
  [15, 'cincisprezece'],
  [16, 'șaisprezece'],
  [17, 'șaptesprezece'],
  [18, 'optsprezece'],
  [19, 'nouăsprezece'],
  [20, 'douăzeci'],

  // Numbers 21-99
  [21, 'douăzeci și unu'],
  [26, 'douăzeci și șase'],
  [28, 'douăzeci și opt'],
  [30, 'treizeci'],
  [31, 'treizeci și unu'],
  [40, 'patruzeci'],
  [44, 'patruzeci și patru'],
  [50, 'cincizeci'],
  [55, 'cincizeci și cinci'],
  [60, 'șaizeci'],
  [67, 'șaizeci și șapte'],
  [70, 'șaptezeci'],
  [79, 'șaptezeci și nouă'],
  [89, 'optzeci și nouă'],
  [95, 'nouăzeci și cinci'],
  [99, 'nouăzeci și nouă'],

  // Hundreds
  [100, 'o sută'],
  [101, 'o sută unu'],
  [199, 'o sută nouăzeci și nouă'],
  [200, 'două sute'],
  [203, 'două sute trei'],
  [287, 'două sute optzeci și șapte'],
  [356, 'trei sute cincizeci și șase'],
  [400, 'patru sute'],
  [434, 'patru sute treizeci și patru'],
  [578, 'cinci sute șaptezeci și opt'],
  [689, 'șase sute optzeci și nouă'],
  [729, 'șapte sute douăzeci și nouă'],
  [894, 'opt sute nouăzeci și patru'],
  [999, 'nouă sute nouăzeci și nouă'],

  // Thousands
  [1000, 'o mie'],
  [1001, 'o mie unu'],
  [1097, 'o mie nouăzeci și șapte'],
  [1104, 'o mie o sută patru'],
  [1243, 'o mie două sute patruzeci și trei'],
  [2000, 'două mii'],
  [2385, 'două mii trei sute optzeci și cinci'],
  [3766, 'trei mii șapte sute șaizeci și șase'],
  [4196, 'patru mii o sută nouăzeci și șase'],
  [5846, 'cinci mii opt sute patruzeci și șase'],
  [6459, 'șase mii patru sute cincizeci și nouă'],
  [7232, 'șapte mii două sute treizeci și doi'],
  [8569, 'opt mii cinci sute șaizeci și nouă'],
  [9539, 'nouă mii cinci sute treizeci și nouă'],

  // Larger thousands with "de" preposition
  [20_000, 'douăzeci de mii'],
  [21_000, 'douăzeci și una de mii'],
  [25_000, 'douăzeci și cinci de mii'],
  [100_000, 'o sută de mii'],
  [101_000, 'o sută una de mii'],
  [150_000, 'o sută cincizeci de mii'],
  [200_000, 'două sute de mii'],
  [999_000, 'nouă sute nouăzeci și nouă de mii'],

  // Millions
  [1_000_000, 'un milion'],
  [1_000_001, 'un milion unu'],
  [2_000_000, 'două milioane'],
  [4_000_000, 'patru milioane'],
  [20_000_000, 'douăzeci de milioane'],
  [21_000_000, 'douăzeci și una de milioane'],
  [100_000_000, 'o sută de milioane'],
  [150_000_000, 'o sută cincizeci de milioane'],

  // Billions
  [1_000_000_000, 'un miliard'],
  [2_000_000_000, 'două miliarde'],
  [20_000_000_000, 'douăzeci de miliarde'],
  [100_000_000_000, 'o sută de miliarde'],

  // Trillions
  [1_000_000_000_000, 'un trilion'],
  [2_000_000_000_000, 'două trilioane'],
  [20_000_000_000_000, 'douăzeci de trilioane'],

  // Very large numbers
  [1_000_000_000_000_000_000n, 'un cvintilion'],
  [1_000_000_000_000_000_000_000n, 'un sextilion'],
  [1_000_000_000_000_000_000_000_000n, 'un septilion'],

  // Feminine form tests (with feminine: true option)
  [1, 'una', { gender: 'feminine' }],
  [2, 'două', { gender: 'feminine' }],
  [12, 'douăsprezece', { gender: 'feminine' }],
  [21, 'douăzeci și una', { gender: 'feminine' }],
  [22, 'douăzeci și două', { gender: 'feminine' }],
  [31, 'treizeci și una', { gender: 'feminine' }],
  [42, 'patruzeci și două', { gender: 'feminine' }],
  [101, 'o sută una', { gender: 'feminine' }],
  [102, 'o sută două', { gender: 'feminine' }],
  [112, 'o sută douăsprezece', { gender: 'feminine' }],
  [201, 'două sute una', { gender: 'feminine' }],
  [212, 'două sute douăsprezece', { gender: 'feminine' }],
  [1001, 'o mie una', { gender: 'feminine' }],
  [1002, 'o mie două', { gender: 'feminine' }],
  [1012, 'o mie douăsprezece', { gender: 'feminine' }],
  [2001, 'două mii una', { gender: 'feminine' }],
  [2002, 'două mii două', { gender: 'feminine' }],
  [2012, 'două mii douăsprezece', { gender: 'feminine' }],
  [21001, 'douăzeci și una de mii una', { gender: 'feminine' }],
  [1_000_001, 'un milion una', { gender: 'feminine' }],
  [1_000_002, 'un milion două', { gender: 'feminine' }],
  [2_000_001, 'două milioane una', { gender: 'feminine' }]
]

/**
 * Ordinal number test cases
 * Format: [input, expected_output, options?]
 */
export const ordinal = [
  // Basic ordinals 1-9
  [1, 'primul'],
  [2, 'al doilea'],
  [3, 'al treilea'],
  [4, 'al patrulea'],
  [5, 'al cincilea'],
  [6, 'al șaselea'],
  [7, 'al șaptelea'],
  [8, 'al optulea'],
  [9, 'al nouălea'],

  // Teens
  [10, 'al zecelea'],
  [11, 'al unsprezecelea'],
  [12, 'al doisprezecelea'],
  [13, 'al treisprezecelea'],
  [19, 'al nouăsprezecelea'],

  // Tens
  [20, 'al douăzecilea'],
  [21, 'douăzeci și primul'],
  [30, 'al treizecilea'],
  [42, 'patruzeci și al doilea'],
  [99, 'nouăzeci și al nouălea'],

  // Hundreds
  [100, 'al sutălea'],
  [101, 'o sută primul'],
  [200, 'al sutălea'],
  [121, 'o sută douăzeci și primul'],

  // Thousands
  [1000, 'al miilea'],
  [1001, 'o mie primul'],
  [2000, 'două mii al miilea'],

  // Millions
  [1000000, 'al milionulea'],
  [2000000, 'două milioane al milionulea']
]

/**
 * Currency test cases (Romanian Leu)
 * Format: [input, expected_output, options?]
 */
export const currency = [
  // Zero
  [0, 'zero lei'],

  // Whole lei
  [1, 'un leu'],
  [2, 'doi lei'],
  [5, 'cinci lei'],
  [10, 'zece lei'],
  [21, 'douăzeci și unu lei'],
  [42, 'patruzeci și doi lei'],
  [100, 'o sută lei'],
  [1000, 'o mie lei'],

  // Bani only
  [0.01, 'un ban'],
  [0.02, 'doi bani'],
  [0.05, 'cinci bani'],
  [0.25, 'douăzeci și cinci de bani'],
  [0.50, 'cincizeci de bani'],
  [0.99, 'nouăzeci și nouă de bani'],

  // Lei and bani
  [1.01, 'un leu un ban'],
  [1.50, 'un leu cincizeci de bani'],
  [2.02, 'doi lei doi bani'],
  [42.50, 'patruzeci și doi lei cincizeci de bani'],
  [100.99, 'o sută lei nouăzeci și nouă de bani'],

  // Negative amounts
  [-1, 'minus un leu'],
  [-42.50, 'minus patruzeci și doi lei cincizeci de bani'],

  // Edge cases
  [5.00, 'cinci lei'],
  ['5.00', 'cinci lei']
]
