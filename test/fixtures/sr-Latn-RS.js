/**
 * Cardinal number test cases
 * Format: [input, expected_output, options?]
 */
export const cardinal = [
  [0.007, 'nula zapeta nula nula sedam'],
  [0.01, 'nula zapeta nula jedan'],
  [1.7, 'jedan zapeta sedam'],
  [17.42, 'sedamnaest zapeta četrdeset dva'],
  [27.312, 'dvadeset sedam zapeta trista dvanaest'],
  [53.486, 'pedeset tri zapeta četiristo osamdeset šest'],
  [300.42, 'trista zapeta četrdeset dva'],
  [4196.42, 'četiri hiljade sto devedeset šest zapeta četrdeset dva'],

  [-17.42, 'minus sedamnaest zapeta četrdeset dva'],
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
  [203, 'dvesta tri'],
  [287, 'dvesta osamdeset sedam'],
  [356, 'trista pedeset šest'],
  [400, 'četiristo'],
  [434, 'četiristo trideset četiri'],
  [578, 'petsto sedamdeset osam'],
  [689, 'šesto osamdeset devet'],
  [729, 'sedamsto dvadeset devet'],
  [894, 'osamsto devedeset četiri'],
  [999, 'devetsto devedeset devet'],
  [1000, 'jedna hiljada'],
  [1001, 'jedna hiljada jedan'],
  [1097, 'jedna hiljada devedeset sedam'],
  [1104, 'jedna hiljada sto četiri'],
  [1243, 'jedna hiljada dvesta četrdeset tri'],
  [2385, 'dve hiljade trista osamdeset pet'],
  [3766, 'tri hiljade sedamsto šezdeset šest'],
  [4196, 'četiri hiljade sto devedeset šest'],
  [5846, 'pet hiljada osamsto četrdeset šest'],
  [6459, 'šest hiljada četiristo pedeset devet'],
  [7232, 'sedam hiljada dvesta trideset dva'],
  [8569, 'osam hiljada petsto šezdeset devet'],
  [9539, 'devet hiljada petsto trideset devet'],
  [1_000_000, 'jedan milion'],
  [1_000_001, 'jedan milion jedan'],
  [4_000_000, 'četiri miliona'],
  [10_000_000_000_000, 'deset biliona'],
  [100_000_000_000_000, 'sto biliona'],
  [1_000_000_000_000_000_000n, 'jedan trilion']
]

/**
 * Ordinal number test cases
 * Format: [input, expected_output, options?]
 */
export const ordinal = [
  // Basic ordinals (1-10)
  [1, 'prvi'],
  [2, 'drugi'],
  [3, 'treći'],
  [4, 'četvrti'],
  [5, 'peti'],
  [6, 'šesti'],
  [7, 'sedmi'],
  [8, 'osmi'],
  [9, 'deveti'],
  [10, 'deseti'],

  // Teens
  [11, 'jedanaesti'],
  [12, 'dvanaesti'],
  [13, 'trinaesti'],
  [14, 'četrnaesti'],
  [15, 'petnaesti'],
  [16, 'šesnaesti'],
  [17, 'sedamnaesti'],
  [18, 'osamnaesti'],
  [19, 'devetnaesti'],

  // Round tens
  [20, 'dvadeseti'],
  [30, 'trideseti'],
  [40, 'četrdeseti'],
  [50, 'pedeseti'],
  [60, 'šezdeseti'],
  [70, 'sedamdeseti'],
  [80, 'osamdeseti'],
  [90, 'devedeseti'],

  // Compound tens
  [21, 'dvadeset prvi'],
  [42, 'četrdeset drugi'],
  [99, 'devedeset deveti'],

  // Hundreds
  [100, 'stoti'],
  [101, 'sto prvi'],
  [200, 'dvestoti'],
  [300, 'tristoti'],
  [500, 'petstoti'],
  [999, 'devetsto devedeset deveti'],

  // Thousands
  [1000, 'hiljaditi'],
  [1001, 'jedna hiljada prvi'],
  [2000, 'dve hiljaditi'],
  [5000, 'pet hiljaditi'],

  // Larger numbers
  [1_000_000, 'milioniti'],
  [2_000_000, 'dva milioniti']
]

/**
 * Currency test cases (Serbian Dinar)
 * Format: [input, expected_output, options?]
 */
export const currency = [
  // Zero
  [0, 'nula dinara'],

  // Whole dinars (singular/plural forms)
  [1, 'jedan dinar'],
  [2, 'dva dinara'],
  [3, 'tri dinara'],
  [4, 'četiri dinara'],
  [5, 'pet dinara'],
  [11, 'jedanaest dinara'],
  [21, 'dvadeset jedan dinar'],
  [22, 'dvadeset dva dinara'],
  [100, 'sto dinara'],
  [1000, 'jedna hiljada dinara'],
  [1_000_000, 'jedan milion dinara'],

  // Para only (singular/plural forms)
  [0.01, 'jedna para'],
  [0.02, 'dve pare'],
  [0.03, 'tri pare'],
  [0.04, 'četiri pare'],
  [0.05, 'pet para'],
  [0.11, 'jedanaest para'],
  [0.21, 'dvadeset jedna para'],
  [0.50, 'pedeset para'],
  [0.99, 'devedeset devet para'],

  // Dinars and para
  [1.01, 'jedan dinar i jedna para'],
  [42.50, 'četrdeset dva dinara i pedeset para'],
  [1000.99, 'jedna hiljada dinara i devedeset devet para'],

  // Negative amounts
  [-1, 'minus jedan dinar'],
  [-42.50, 'minus četrdeset dva dinara i pedeset para'],

  // Without "i" option
  [42.50, 'četrdeset dva dinara pedeset para', { and: false }],

  // Edge cases
  [5.00, 'pet dinara'],
  ['5.00', 'pet dinara']
]
