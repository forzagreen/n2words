/**
 * Cardinal number test cases
 * Format: [input, expected_output, options?]
 */
export const cardinal = [
  [0.007, 'nula zarez nula nula sedam'],
  [0.01, 'nula zarez nula jedan'],
  [1.7, 'jedan zarez sedam'],
  [17.42, 'sedamnaest zarez četrdeset dva'],
  [27.312, 'dvadeset sedam zarez tristo dvanaest'],
  [53.486, 'pedeset tri zarez četiristo osamdeset šest'],
  [300.42, 'tristo zarez četrdeset dva'],
  [4196.42, 'četiri tisuće sto devedeset šest zarez četrdeset dva'],

  [-17.42, 'minus sedamnaest zarez četrdeset dva'],
  [-1, 'minus jedan'],
  [-20, 'minus dvadeset'],

  [0, 'nula'],
  [1, 'jedan'],
  [2, 'dva'],
  [3, 'tri'],
  [11, 'jedanaest'],
  [12, 'dvanaest'],
  [16, 'šesnaest'],
  [19, 'devetnaest'],
  [20, 'dvadeset'],
  [21, 'dvadeset jedan'],
  [26, 'dvadeset šest'],
  [28, 'dvadeset osam'],
  [30, 'trideset'],
  [31, 'trideset jedan'],
  [40, 'četrdeset'],
  [44, 'četrdeset četiri'],
  [50, 'pedeset'],
  [55, 'pedeset pet'],
  [60, 'šezdeset'],
  [67, 'šezdeset sedam'],
  [70, 'sedamdeset'],
  [79, 'sedamdeset devet'],
  [89, 'osamdeset devet'],
  [95, 'devedeset pet'],
  [100, 'sto'],
  [101, 'sto jedan'],
  [199, 'sto devedeset devet'],
  [203, 'dvjesto tri'],
  [287, 'dvjesto osamdeset sedam'],
  [356, 'tristo pedeset šest'],
  [400, 'četiristo'],
  [434, 'četiristo trideset četiri'],
  [578, 'petsto sedamdeset osam'],
  [689, 'šesto osamdeset devet'],
  [729, 'sedamsto dvadeset devet'],
  [894, 'osamsto devedeset četiri'],
  [999, 'devetsto devedeset devet'],
  [1000, 'jedna tisuća'],
  [1001, 'jedna tisuća jedan'],
  [1097, 'jedna tisuća devedeset sedam'],
  [1104, 'jedna tisuća sto četiri'],
  [1243, 'jedna tisuća dvjesto četrdeset tri'],
  [2385, 'dvije tisuće tristo osamdeset pet'],
  [3766, 'tri tisuće sedamsto šezdeset šest'],
  [4196, 'četiri tisuće sto devedeset šest'],
  [5846, 'pet tisuća osamsto četrdeset šest'],
  [6459, 'šest tisuća četiristo pedeset devet'],
  [7232, 'sedam tisuća dvjesto trideset dva'],
  [8569, 'osam tisuća petsto šezdeset devet'],
  [9539, 'devet tisuća petsto trideset devet'],
  [1_000_000, 'jedan milijun'],
  [1_000_001, 'jedan milijun jedan'],
  [4_000_000, 'četiri milijuna'],
  [10_000_000_000_000, 'deset bilijuna'],
  [100_000_000_000_000, 'sto bilijuna'],
  [1_000_000_000_000_000_000n, 'jedan trilijun'],

  // Feminine gender tests
  [1, 'jedna', { gender: 'feminine' }],
  [2, 'dvije', { gender: 'feminine' }],
  [21, 'dvadeset jedna', { gender: 'feminine' }],
  [22, 'dvadeset dvije', { gender: 'feminine' }],
  [101, 'sto jedna', { gender: 'feminine' }],
  [102, 'sto dvije', { gender: 'feminine' }],
  [1001, 'jedna tisuća jedna', { gender: 'feminine' }],
  [1002, 'jedna tisuća dvije', { gender: 'feminine' }],
  [2001, 'dvije tisuće jedna', { gender: 'feminine' }],
  [2002, 'dvije tisuće dvije', { gender: 'feminine' }]
]

/**
 * Ordinal number test cases
 * Format: [input, expected_output, options?]
 */
export const ordinal = [
  // Basic ordinals 1-9
  [1, 'prvi'],
  [2, 'drugi'],
  [3, 'treći'],
  [4, 'četvrti'],
  [5, 'peti'],
  [6, 'šesti'],
  [7, 'sedmi'],
  [8, 'osmi'],
  [9, 'deveti'],

  // Teens
  [10, 'deseti'],
  [11, 'jedanaesti'],
  [12, 'dvanaesti'],
  [13, 'trinaesti'],
  [19, 'devetnaesti'],

  // Tens
  [20, 'dvadeseti'],
  [21, 'dvadeset prvi'],
  [30, 'trideseti'],
  [42, 'četrdeset drugi'],
  [99, 'devedeset deveti'],

  // Hundreds
  [100, 'stoti'],
  [101, 'sto prvi'],
  [200, 'dvjestoti'],
  [121, 'sto dvadeset prvi'],

  // Thousands
  [1000, 'tisućiti'],
  [1001, 'jedna tisuća prvi'],
  [2000, 'dvije tisućiti'],

  // Millions
  [1000000, 'milijunti'],
  [2000000, 'dva milijunti']
]

/**
 * Currency test cases (Croatian - Euro)
 * Format: [input, expected_output, options?]
 */
export const currency = [
  // Zero
  [0, 'nula eura'],

  // Whole euros
  [1, 'jedan euro'],
  [2, 'dva eura'],
  [5, 'pet eura'],
  [10, 'deset eura'],
  [21, 'dvadeset jedan euro'],
  [42, 'četrdeset dva eura'],
  [100, 'sto eura'],
  [1000, 'jedna tisuća eura'],

  // Cents only
  [0.01, 'jedan cent'],
  [0.02, 'dva centa'],
  [0.05, 'pet centi'],
  [0.25, 'dvadeset pet centi'],
  [0.50, 'pedeset centi'],
  [0.99, 'devedeset devet centi'],

  // Euros and cents
  [1.01, 'jedan euro jedan cent'],
  [1.50, 'jedan euro pedeset centi'],
  [2.02, 'dva eura dva centa'],
  [42.50, 'četrdeset dva eura pedeset centi'],
  [100.99, 'sto eura devedeset devet centi'],

  // Negative amounts
  [-1, 'minus jedan euro'],
  [-42.50, 'minus četrdeset dva eura pedeset centi'],

  // Edge cases
  [5.00, 'pet eura'],
  ['5.00', 'pet eura']
]
