/**
 * Cardinal number test cases
 * Format: [input, expected_output, options?]
 */
export const cardinal = [
  // Basic numbers (0-10)
  [0, 'sifiri'],
  [1, 'ɗaya'],
  [2, 'biyu'],
  [3, 'uku'],
  [4, 'huɗu'],
  [5, 'biyar'],
  [6, 'shida'],
  [7, 'bakwai'],
  [8, 'takwas'],
  [9, 'tara'],
  [10, 'goma'],

  // Teens (11-19) - "sha" + unit
  [11, 'sha ɗaya'],
  [12, 'sha biyu'],
  [13, 'sha uku'],
  [14, 'sha huɗu'],
  [15, 'sha biyar'],
  [16, 'sha shida'],
  [17, 'sha bakwai'],
  [18, 'sha takwas'],
  [19, 'sha tara'],

  // Tens (20-90) - Arabic loanwords
  [20, 'ashirin'],
  [30, 'talatin'],
  [40, "arba'in"],
  [50, 'hamsin'],
  [60, 'sittin'],
  [70, "saba'in"],
  [80, 'tamanin'],
  [90, "tis'in"],

  // Compound numbers (21-99) - tens + "da" + unit
  [21, 'ashirin da ɗaya'],
  [25, 'ashirin da biyar'],
  [32, 'talatin da biyu'],
  [44, "arba'in da huɗu"],
  [57, 'hamsin da bakwai'],
  [63, 'sittin da uku'],
  [78, "saba'in da takwas"],
  [86, 'tamanin da shida'],
  [99, "tis'in da tara"],

  // Hundreds - implicit one for 100
  [100, 'ɗari'],
  [101, 'ɗari da ɗaya'],
  [110, 'ɗari goma'],
  [111, 'ɗari sha ɗaya'],
  [120, 'ɗari ashirin'],
  [121, 'ɗari ashirin da ɗaya'],
  [200, 'biyu ɗari'],
  [300, 'uku ɗari'],
  [500, 'biyar ɗari'],
  [999, "tara ɗari tis'in da tara"],

  // Thousands - implicit one for 1000
  [1000, 'dubu'],
  [1001, 'dubu da ɗaya'],
  [1010, 'dubu goma'],
  [1100, 'dubu ɗari'],
  [2000, 'biyu dubu'],
  [5000, 'biyar dubu'],
  [10000, 'goma dubu'],
  [12345, "sha biyu dubu uku ɗari arba'in da biyar"],
  [100000, 'ɗari dubu'],

  // Millions
  [1000000, 'ɗaya miliyan'],
  [2000000, 'biyu miliyan'],
  [1234567, 'ɗaya miliyan biyu ɗari talatin da huɗu dubu biyar ɗari sittin da bakwai'],

  // Billions
  [1000000000, 'ɗaya biliyan'],
  [2000000000, 'biyu biliyan'],

  // Negative numbers
  [-1, 'babu ɗaya'],
  [-5, 'babu biyar'],
  [-42, "babu arba'in da biyu"],
  [-100, 'babu ɗari'],

  // Decimals - per-digit after separator
  ['3.14', 'uku digo ɗaya huɗu'],
  ['0.5', 'sifiri digo biyar'],
  ['10.25', 'goma digo biyu biyar'],

  // BigInt
  [BigInt(999), "tara ɗari tis'in da tara"],
  [BigInt(1000000), 'ɗaya miliyan']
]
