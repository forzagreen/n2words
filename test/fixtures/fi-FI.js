/**
 * Cardinal number test cases
 * Format: [input, expected_output, options?]
 */
export const cardinal = [
  // Basic numbers (0-10)
  [0, 'nolla'],
  [1, 'yksi'],
  [2, 'kaksi'],
  [3, 'kolme'],
  [4, 'neljä'],
  [5, 'viisi'],
  [6, 'kuusi'],
  [7, 'seitsemän'],
  [8, 'kahdeksan'],
  [9, 'yhdeksän'],
  [10, 'kymmenen'],

  // Teens (11-19) - use "-toista" suffix
  [11, 'yksitoista'],
  [12, 'kaksitoista'],
  [13, 'kolmetoista'],
  [14, 'neljätoista'],
  [15, 'viisitoista'],
  [16, 'kuusitoista'],
  [17, 'seitsemäntoista'],
  [18, 'kahdeksantoista'],
  [19, 'yhdeksäntoista'],

  // Tens (20-90) - compound with units, no space
  [20, 'kaksikymmentä'],
  [21, 'kaksikymmentäyksi'],
  [22, 'kaksikymmentäkaksi'],
  [30, 'kolmekymmentä'],
  [42, 'neljäkymmentäkaksi'],
  [50, 'viisikymmentä'],
  [67, 'kuusikymmentäseitsemän'],
  [99, 'yhdeksänkymmentäyhdeksän'],

  // Hundreds - "yksi" omitted before sata
  [100, 'sata'],
  [101, 'sata yksi'],
  [110, 'sata kymmenen'],
  [111, 'sata yksitoista'],
  [123, 'sata kaksikymmentäkolme'],
  [200, 'kaksi sata'],
  [500, 'viisi sata'],
  [999, 'yhdeksän sata yhdeksänkymmentäyhdeksän'],

  // Thousands - "yksi" omitted before tuhat
  [1000, 'tuhat'],
  [1001, 'tuhat yksi'],
  [1100, 'tuhat sata'],
  [1234, 'tuhat kaksi sata kolmekymmentäneljä'],
  [2000, 'kaksi tuhat'],
  [10000, 'kymmenen tuhat'],
  [100000, 'sata tuhat'],

  // Millions - "yksi" kept before miljoona
  [1000000, 'yksi miljoona'],
  [2000000, 'kaksi miljoona'],
  [1000001, 'yksi miljoona yksi'],

  // Billions (miljardi)
  [1000000000, 'yksi miljardi'],

  // Negatives
  [-1, 'miinus yksi'],
  [-42, 'miinus neljäkymmentäkaksi'],

  // Decimals
  ['3.14', 'kolme pilkku yksi neljä'],
  ['0.5', 'nolla pilkku viisi'],

  // BigInt
  [BigInt(999), 'yhdeksän sata yhdeksänkymmentäyhdeksän'],
]

/**
 * Ordinal number test cases
 * Format: [input, expected_output, options?]
 */
export const ordinal = [
  // Special forms
  [1, 'ensimmäinen'],
  [2, 'toinen'],

  // Basic ordinals (-s forms)
  [3, 'kolmas'],
  [4, 'neljäs'],
  [5, 'viides'],
  [6, 'kuudes'],
  [7, 'seitsemäs'],
  [8, 'kahdeksas'],
  [9, 'yhdeksäs'],
  [10, 'kymmenes'],

  // Teens
  [11, 'yhdestoista'],
  [12, 'kahdestoista'],
  [13, 'kolmastoista'],
  [15, 'viidestoista'],
  [19, 'yhdeksästoista'],

  // Tens
  [20, 'kahdeskymmenes'],
  [21, 'kaksikymmentäensimmäinen'],
  [30, 'kolmaskymmenes'],
  [42, 'neljäkymmentätoinen'],
  [99, 'yhdeksänkymmentäyhdeksäs'],

  // Hundreds (simplified form)
  [100, 'satas'],
  [1000, 'tuhats'],
]

/**
 * Currency test cases (Euro)
 * Format: [input, expected_output, options?]
 */
export const currency = [
  // Zero
  [0, 'nolla euroa'],

  // Singular euro
  [1, 'yksi euro'],

  // Plural euro
  [2, 'kaksi euroa'],
  [5, 'viisi euroa'],
  [10, 'kymmenen euroa'],
  [100, 'sata euroa'],
  [1000, 'tuhat euroa'],

  // Singular cent
  [0.01, 'yksi sentti'],

  // Plural cents
  [0.02, 'kaksi senttiä'],
  [0.50, 'viisikymmentä senttiä'],
  [0.99, 'yhdeksänkymmentäyhdeksän senttiä'],

  // Euro and cents
  [1.01, 'yksi euro yksi sentti'],
  [1.50, 'yksi euro viisikymmentä senttiä'],
  [42.50, 'neljäkymmentäkaksi euroa viisikymmentä senttiä'],
  [1000.99, 'tuhat euroa yhdeksänkymmentäyhdeksän senttiä'],

  // Negative amounts
  [-1, 'miinus yksi euro'],
  [-42.50, 'miinus neljäkymmentäkaksi euroa viisikymmentä senttiä'],

  // Edge cases
  [5.00, 'viisi euroa'],
  ['5.00', 'viisi euroa'],
]
