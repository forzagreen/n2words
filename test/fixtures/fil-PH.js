/**
 * Cardinal number test cases
 * Format: [input, expected_output, options?]
 */
export const cardinal = [
  [0, 'zero'],
  [1, 'isa'],
  [2, 'dalawa'],
  [3, 'tatlo'],
  [4, 'apat'],
  [5, 'lima'],
  [6, 'anim'],
  [7, 'pito'],
  [8, 'walo'],
  [9, 'siyam'],
  [10, 'sampu'],
  [11, 'labinisa'],
  [12, 'labindalawa'],
  [13, 'labintatlo'],
  [14, 'labinapat'],
  [15, 'labinlima'],
  [16, 'labinanum'],
  [17, 'labimpito'],
  [18, 'labingwalo'],
  [19, 'labinsiyam'],
  [20, 'dalawampu'],
  [21, 'dalawampu isa'],
  [30, 'tatlumpu'],
  [40, 'apatnapu'],
  [42, 'apatnapu dalawa'],
  [50, 'limampu'],
  [60, 'animnapu'],
  [70, 'pitumpu'],
  [80, 'walumpu'],
  [90, 'siyamnapu'],
  [99, 'siyamnapu siyam'],
  [100, 'isang daang'],
  [101, 'isang daang isa'],
  [200, 'dalawang daang'],
  [256, 'dalawang daang limampung anim'],
  [999, 'siyam na daang siyamnapu siyam'],
  [1000, 'isang libong'],
  [1001, 'isang libong isa'],
  [2000, 'dalawang libong'],
  [12345, 'labindalawang libong tatlong daang apatnapu lima'],
  [99999, 'siyamnapu siyam na libong siyam na daang siyamnapu siyam'],
  [1000000, 'isang milyong'],
  [1234567, 'isang milyong dalawang daang tatlumpu apat na libong limang daang animnapu pito'],
  [-1, 'negatibo isa'],
  [-5, 'negatibo lima'],
  [-1000, 'negatibo isang libong'],
  ['3.14', 'tatlo punto isa apat'],
  ['0.5', 'zero punto lima'],
  ['10.05', 'sampu punto zero lima']
]

/**
 * Ordinal number test cases
 * Format: [input, expected_output, options?]
 */
export const ordinal = [
  // Special forms
  [1, 'una'],
  [2, 'ikalawa'],

  // Regular ika- prefix
  [3, 'ika-tatlo'],
  [4, 'ika-apat'],
  [5, 'ika-lima'],
  [6, 'ika-anim'],
  [7, 'ika-pito'],
  [8, 'ika-walo'],
  [9, 'ika-siyam'],
  [10, 'ika-sampu'],

  // Teens
  [11, 'ika-labinisa'],
  [12, 'ika-labindalawa'],
  [19, 'ika-labinsiyam'],

  // Tens
  [20, 'ika-dalawampu'],
  [21, 'ika-dalawampu isa'],
  [30, 'ika-tatlumpu'],
  [42, 'ika-apatnapu dalawa'],
  [99, 'ika-siyamnapu siyam'],

  // Hundreds
  [100, 'ika-isang daang'],
  [101, 'ika-isang daang isa'],
  [200, 'ika-dalawang daang'],

  // Thousands
  [1000, 'ika-isang libong'],
  [1001, 'ika-isang libong isa']
]

/**
 * Currency test cases (Philippine Peso)
 * Format: [input, expected_output, options?]
 */
export const currency = [
  // Zero
  [0, 'zero piso'],

  // Whole pesos
  [1, 'isang piso'],
  [2, 'dalawang piso'],
  [5, 'limang piso'],
  [9, 'siyam na piso'],
  [10, 'sampung piso'],
  [21, 'dalawampu isang piso'],
  [42, 'apatnapu dalawang piso'],
  [100, 'isang daang piso'],
  [1000, 'isang libong piso'],

  // Sentimos only
  [0.01, 'isang sentimo'],
  [0.25, 'dalawampu limang sentimo'],
  [0.50, 'limampung sentimo'],
  [0.99, 'siyamnapu siyam na sentimo'],

  // Pesos and sentimos
  [1.01, 'isang piso at isang sentimo'],
  [1.50, 'isang piso at limampung sentimo'],
  [42.50, 'apatnapu dalawang piso at limampung sentimo'],
  [100.99, 'isang daang piso at siyamnapu siyam na sentimo'],

  // Negative amounts
  [-1, 'negatibo isang piso'],
  [-42.50, 'negatibo apatnapu dalawang piso at limampung sentimo'],

  // Edge cases
  [5.00, 'limang piso'],
  ['5.00', 'limang piso']
]
