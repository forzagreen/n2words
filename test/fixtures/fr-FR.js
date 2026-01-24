/**
 * Cardinal number test cases
 * Format: [input, expected_output, options?]
 */
export const cardinal = [
  [0.01, 'zéro virgule zéro un'],
  [1.007, 'un virgule zéro zéro sept'],
  [5.5, 'cinq virgule cinq'],
  [17.42, 'dix-sept virgule quarante-deux'],
  [27.312, 'vingt-sept virgule trois cent douze'],
  [53.486, 'cinquante-trois virgule quatre cent quatre-vingt-six'],
  [300.42, 'trois cents virgule quarante-deux'],
  [4196.42, 'quatre mille cent quatre-vingt-seize virgule quarante-deux'],

  [2824, 'deux-mille-huit-cent-vingt-quatre', { withHyphenSeparator: true }],
  [21_602, 'vingt-et-un-mille-six-cent-deux', { withHyphenSeparator: true }],
  [142.61, 'cent-quarante-deux-virgule-soixante-et-un', { withHyphenSeparator: true }],

  [-17.42, 'moins dix-sept virgule quarante-deux'],
  [-1, 'moins un'],
  [-20, 'moins vingt'],

  [0, 'zéro'],
  [1, 'un'],
  [2, 'deux'],
  [3, 'trois'],
  [11, 'onze'],
  [12, 'douze'],
  [16, 'seize'],
  [19, 'dix-neuf'],
  [20, 'vingt'],
  [21, 'vingt et un'],
  [26, 'vingt-six'],
  [28, 'vingt-huit'],
  [30, 'trente'],
  [31, 'trente et un'],
  [40, 'quarante'],
  [44, 'quarante-quatre'],
  [50, 'cinquante'],
  [55, 'cinquante-cinq'],
  [60, 'soixante'],
  [67, 'soixante-sept'],
  [70, 'soixante-dix'],
  [79, 'soixante-dix-neuf'],
  [89, 'quatre-vingt-neuf'],
  [95, 'quatre-vingt-quinze'],
  [100, 'cent'],
  [101, 'cent un'],
  [199, 'cent quatre-vingt-dix-neuf'],
  [203, 'deux cent trois'],
  [287, 'deux cent quatre-vingt-sept'],
  [356, 'trois cent cinquante-six'],
  [400, 'quatre cents'],
  [434, 'quatre cent trente-quatre'],
  [578, 'cinq cent soixante-dix-huit'],
  [689, 'six cent quatre-vingt-neuf'],
  [729, 'sept cent vingt-neuf'],
  [894, 'huit cent quatre-vingt-quatorze'],
  [999, 'neuf cent quatre-vingt-dix-neuf'],
  [1000, 'mille'],
  [1001, 'mille un'],
  [1097, 'mille quatre-vingt-dix-sept'],
  [1104, 'mille cent quatre'],
  [1243, 'mille deux cent quarante-trois'],
  [2385, 'deux mille trois cent quatre-vingt-cinq'],
  [3766, 'trois mille sept cent soixante-six'],
  [4196, 'quatre mille cent quatre-vingt-seize'],
  [5846, 'cinq mille huit cent quarante-six'],
  [6459, 'six mille quatre cent cinquante-neuf'],
  [7232, 'sept mille deux cent trente-deux'],
  [8569, 'huit mille cinq cent soixante-neuf'],
  [9539, 'neuf mille cinq cent trente-neuf'],
  [1_000_000, 'un million'],
  [1_000_001, 'un million un'],
  [4_000_000, 'quatre millions'],
  [4_000_004, 'quatre millions quatre'],
  [4_300_000, 'quatre millions trois cent mille'],
  [80_000_000, 'quatre-vingts millions'],
  [300_000_000, 'trois cents millions'],
  [10_000_000_000_000, 'dix billions'],
  [10_000_000_000_010, 'dix billions dix'],
  [100_000_000_000_000, 'cent billions'],
  [1_000_000_000_000_000, 'un billiard'],
  [2_000_000_000_000_000, 'deux billiards'],
  [5_000_000_000_000_000, 'cinq billiards'],
  [1_000_000_000_000_000_000n, 'un trillion'],
  [2_000_000_000_000_000_000n, 'deux trillions'],
  [5_000_000_000_000_000_000n, 'cinq trillions'],
  [1_000_000_000_000_000_000_000n, 'un trilliard'],
  [2_000_000_000_000_000_000_000n, 'deux trilliards'],
  [5_000_000_000_000_000_000_000n, 'cinq trilliards'],
  [1_000_000_000_000_000_000_000_000n, 'un quadrillion'],
  [2_000_000_000_000_000_000_000_000n, 'deux quadrillions'],
  [5_000_000_000_000_000_000_000_000n, 'cinq quadrillions'],
  [10_000_000_000_000_000_000_000_000n, 'dix quadrillions'],
  [1_000_000_000_000_000_000_000_000_000n, 'un quadrilliard']
]

/**
 * Ordinal number test cases
 * Format: [input, expected_output]
 */
export const ordinal = [
  // Basic ones - special case for 1 (premier)
  [1, 'premier'],
  [2, 'deuxième'],
  [3, 'troisième'],
  [4, 'quatrième'],
  [5, 'cinquième'],
  [6, 'sixième'],
  [7, 'septième'],
  [8, 'huitième'],
  [9, 'neuvième'],

  // Teens
  [10, 'dixième'],
  [11, 'onzième'],
  [12, 'douzième'],
  [13, 'treizième'],
  [14, 'quatorzième'],
  [15, 'quinzième'],
  [16, 'seizième'],
  [17, 'dix-septième'],
  [18, 'dix-huitième'],
  [19, 'dix-neuvième'],

  // Tens
  [20, 'vingtième'],
  [30, 'trentième'],
  [40, 'quarantième'],
  [50, 'cinquantième'],
  [60, 'soixantième'],
  [70, 'soixante-dixième'],
  [80, 'quatre-vingtième'],
  [90, 'quatre-vingt-dixième'],

  // Compound tens-ones (vigesimal pattern)
  [21, 'vingt et unième'],
  [22, 'vingt-deuxième'],
  [31, 'trente et unième'],
  [42, 'quarante-deuxième'],
  [55, 'cinquante-cinquième'],
  [69, 'soixante-neuvième'],
  [71, 'soixante et onzième'],
  [75, 'soixante-quinzième'],
  [81, 'quatre-vingt-unième'],
  [85, 'quatre-vingt-cinquième'],
  [89, 'quatre-vingt-neuvième'],
  [91, 'quatre-vingt-onzième'],
  [99, 'quatre-vingt-dix-neuvième'],

  // Hundreds
  [100, 'centième'],
  [101, 'cent unième'],
  [102, 'cent deuxième'],
  [105, 'cent cinquième'],
  [109, 'cent neuvième'],
  [111, 'cent onzième'],
  [121, 'cent vingt et unième'],
  [200, 'deux centième'],
  [300, 'trois centième'],
  [500, 'cinq centième'],
  [999, 'neuf cent quatre-vingt-dix-neuvième'],

  // Thousands
  [1000, 'millième'],
  [1001, 'mille unième'],
  [1005, 'mille cinquième'],
  [1009, 'mille neuvième'],
  [1100, 'mille centième'],
  [2000, 'deux millième'],
  [5000, 'cinq millième'],
  [10000, 'dix millième'],
  [21000, 'vingt et un millième'],
  [99999, 'quatre-vingt-dix-neuf mille neuf cent quatre-vingt-dix-neuvième'],

  // Larger scales
  [1_000_000, 'un millionième'],
  [1_000_001, 'un million unième'],
  [2_000_000, 'deux millionième'],
  [1_000_000_000, 'un milliardième'],
  [1_000_000_000_000, 'un billionième'],

  // BigInt support
  [1_000_000_000_000_000_000n, 'un trillionième']
]

/**
 * Currency test cases (Euro)
 * Format: [input, expected_output, options?]
 */
export const currency = [
  // Zero
  [0, 'zéro euro'],

  // Whole euros
  [1, 'un euro'],
  [2, 'deux euros'],
  [10, 'dix euros'],
  [21, 'vingt et un euros'],
  [80, 'quatre-vingts euros'],
  [100, 'cent euros'],
  [1000, 'mille euros'],
  [1000000, 'un million euros'],

  // Centimes only
  [0.01, 'un centime'],
  [0.02, 'deux centimes'],
  [0.10, 'dix centimes'],
  [0.21, 'vingt et un centimes'],
  [0.50, 'cinquante centimes'],
  [0.80, 'quatre-vingts centimes'],
  [0.99, 'quatre-vingt-dix-neuf centimes'],

  // Euros and centimes
  [1.01, 'un euro et un centime'],
  [1.50, 'un euro et cinquante centimes'],
  [2.02, 'deux euros et deux centimes'],
  [21.21, 'vingt et un euros et vingt et un centimes'],
  [42.50, 'quarante-deux euros et cinquante centimes'],
  [80.80, 'quatre-vingts euros et quatre-vingts centimes'],
  [100.99, 'cent euros et quatre-vingt-dix-neuf centimes'],
  [1000.01, 'mille euros et un centime'],
  [1000000.01, 'un million euros et un centime'],

  // Negative amounts
  [-1, 'moins un euro'],
  [-0.50, 'moins cinquante centimes'],
  [-42.50, 'moins quarante-deux euros et cinquante centimes'],

  // Without "et" option
  [42.50, 'quarante-deux euros cinquante centimes', { and: false }],
  [1.01, 'un euro un centime', { and: false }],

  // Edge cases: .00 centimes should show euros only
  [5.00, 'cinq euros'],
  ['5.00', 'cinq euros'],
  [100.00, 'cent euros'],

  // String inputs
  ['42.50', 'quarante-deux euros et cinquante centimes'],
  ['0.99', 'quatre-vingt-dix-neuf centimes'],

  // BigInt (whole euros only)
  [1000000000000n, 'un billion euros']
]
