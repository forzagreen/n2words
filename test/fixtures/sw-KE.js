/**
 * Cardinal number test cases
 * Format: [input, expected_output, options?]
 */
export const cardinal = [
  [0, 'sifuri'],
  [1, 'moja'],
  [2, 'mbili'],
  [3, 'tatu'],
  [5.5, 'tano nukta tano'],
  ['0.01', 'sifuri nukta sifuri moja'],
  ['0.005', 'sifuri nukta sifuri sifuri tano'],
  [3.14, 'tatu nukta kumi na nne'],

  [-5, 'minus tano'],

  [10, 'kumi'],
  [11, 'kumi na moja'],
  [15, 'kumi na tano'],
  [19, 'kumi na tisa'],
  [20, 'ishirini'],
  [21, 'ishirini na moja'],
  [25, 'ishirini na tano'],
  [29, 'ishirini na tisa'],
  [30, 'thelathini'],
  [33, 'thelathini na tatu'],
  [40, 'arobaini'],
  [45, 'arobaini na tano'],
  [50, 'hamsini'],
  [58, 'hamsini na nane'],
  [60, 'sitini'],
  [68, 'sitini na nane'],
  [70, 'sabini'],
  [79, 'sabini na tisa'],
  [80, 'themanini'],
  [90, 'tisini'],
  [99, 'tisini na tisa'],

  [100, 'mia moja'],
  [101, 'mia moja na moja'],
  [110, 'mia moja kumi'],
  [125, 'mia moja ishirini na tano'],
  [200, 'mia mbili'],
  [215, 'mia mbili kumi na tano'],
  [999, 'mia tisa tisini na tisa'],

  [1000, 'elfu moja'],
  [1001, 'elfu moja na moja'],
  [1010, 'elfu moja kumi'],
  [1100, 'elfu moja mia'],
  [1234, 'elfu moja mia mbili thelathini na nne'],
  [10_000, 'elfu kumi'],
  [50_000, 'elfu hamsini'],
  [99_999, 'elfu tisini na tisa mia tisa tisini na tisa'],

  [1_000_000, 'milioni moja'],
  [2_000_000, 'milioni mbili'],
  [12_345_678, 'milioni kumi na mbili elfu mia tatu arobaini na tano mia sita sabini na nane'],
  [1_000_000_000, 'bilioni moja'],
  [1_000_000_000_000n, 'trilioni moja']
]

/**
 * Ordinal number test cases
 * Format: [input, expected_output, options?]
 */
export const ordinal = [
  // Special forms for 1-9
  [1, 'wa kwanza'],
  [2, 'wa pili'],
  [3, 'wa tatu'],
  [4, 'wa nne'],
  [5, 'wa tano'],
  [6, 'wa sita'],
  [7, 'wa saba'],
  [8, 'wa nane'],
  [9, 'wa tisa'],

  // Tens (wa + cardinal)
  [10, 'wa kumi'],
  [11, 'wa kumi na moja'],
  [12, 'wa kumi na mbili'],
  [19, 'wa kumi na tisa'],
  [20, 'wa ishirini'],
  [21, 'wa ishirini na moja'],
  [30, 'wa thelathini'],
  [42, 'wa arobaini na mbili'],
  [99, 'wa tisini na tisa'],

  // Hundreds
  [100, 'wa mia moja'],
  [101, 'wa mia moja na moja'],
  [200, 'wa mia mbili'],

  // Thousands
  [1000, 'wa elfu moja'],
  [1001, 'wa elfu moja na moja']
]

/**
 * Currency test cases (Kenyan Shilling)
 * Format: [input, expected_output, options?]
 */
export const currency = [
  // Zero
  [0, 'shilingi sifuri'],

  // Whole shillings
  [1, 'shilingi moja'],
  [2, 'shilingi mbili'],
  [5, 'shilingi tano'],
  [10, 'shilingi kumi'],
  [21, 'shilingi ishirini na moja'],
  [42, 'shilingi arobaini na mbili'],
  [100, 'shilingi mia moja'],
  [1000, 'shilingi elfu moja'],

  // Senti only
  [0.01, 'senti moja'],
  [0.25, 'senti ishirini na tano'],
  [0.50, 'senti hamsini'],
  [0.99, 'senti tisini na tisa'],

  // Shillings and senti
  [1.01, 'shilingi moja na senti moja'],
  [1.50, 'shilingi moja na senti hamsini'],
  [42.50, 'shilingi arobaini na mbili na senti hamsini'],
  [100.99, 'shilingi mia moja na senti tisini na tisa'],

  // Negative amounts
  [-1, 'minus shilingi moja'],
  [-42.50, 'minus shilingi arobaini na mbili na senti hamsini'],

  // Edge cases
  [5.00, 'shilingi tano'],
  ['5.00', 'shilingi tano']
]
