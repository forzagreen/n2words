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

/**
 * Ordinal number test cases
 * Format: [input, expected_output, options?]
 */
export const ordinal = [
  // Special form for first
  [1, 'na farko'],

  // Regular "na" prefix
  [2, 'na biyu'],
  [3, 'na uku'],
  [4, 'na huɗu'],
  [5, 'na biyar'],
  [6, 'na shida'],
  [7, 'na bakwai'],
  [8, 'na takwas'],
  [9, 'na tara'],
  [10, 'na goma'],

  // Teens
  [11, 'na sha ɗaya'],
  [12, 'na sha biyu'],
  [19, 'na sha tara'],

  // Tens
  [20, 'na ashirin'],
  [21, 'na ashirin da ɗaya'],
  [30, 'na talatin'],
  [42, "na arba'in da biyu"],
  [99, "na tis'in da tara"],

  // Hundreds
  [100, 'na ɗari'],
  [101, 'na ɗari da ɗaya'],
  [200, 'na biyu ɗari'],

  // Thousands
  [1000, 'na dubu'],
  [1001, 'na dubu da ɗaya']
]

/**
 * Currency test cases (Nigerian Naira)
 * Format: [input, expected_output, options?]
 */
export const currency = [
  // Zero
  [0, 'sifiri naira'],

  // Whole naira
  [1, 'ɗaya naira'],
  [2, 'biyu naira'],
  [5, 'biyar naira'],
  [10, 'goma naira'],
  [21, 'ashirin da ɗaya naira'],
  [42, "arba'in da biyu naira"],
  [100, 'ɗari naira'],
  [1000, 'dubu naira'],

  // Kobo only
  [0.01, 'ɗaya kobo'],
  [0.25, 'ashirin da biyar kobo'],
  [0.50, 'hamsin kobo'],
  [0.99, "tis'in da tara kobo"],

  // Naira and kobo
  [1.01, 'ɗaya naira da ɗaya kobo'],
  [1.50, 'ɗaya naira da hamsin kobo'],
  [42.50, "arba'in da biyu naira da hamsin kobo"],
  [100.99, "ɗari naira da tis'in da tara kobo"],

  // Negative amounts
  [-1, 'babu ɗaya naira'],
  [-42.50, "babu arba'in da biyu naira da hamsin kobo"],

  // Edge cases
  [5.00, 'biyar naira'],
  ['5.00', 'biyar naira']
]
