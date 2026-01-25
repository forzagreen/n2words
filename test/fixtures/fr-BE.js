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
  [4196.42, 'quatre mille cent nonante-six virgule quarante-deux'],

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
  [70, 'septante'],
  [79, 'septante-neuf'],
  [89, 'quatre-vingt-neuf'],
  [95, 'nonante-cinq'],
  [100, 'cent'],
  [101, 'cent un'],
  [199, 'cent nonante-neuf'],
  [203, 'deux cent trois'],
  [287, 'deux cent quatre-vingt-sept'],
  [356, 'trois cent cinquante-six'],
  [400, 'quatre cents'],
  [434, 'quatre cent trente-quatre'],
  [578, 'cinq cent septante-huit'],
  [689, 'six cent quatre-vingt-neuf'],
  [729, 'sept cent vingt-neuf'],
  [894, 'huit cent nonante-quatre'],
  [999, 'neuf cent nonante-neuf'],
  [1000, 'mille'],
  [1001, 'mille un'],
  [1097, 'mille nonante-sept'],
  [1104, 'mille cent quatre'],
  [1243, 'mille deux cent quarante-trois'],
  [2385, 'deux mille trois cent quatre-vingt-cinq'],
  [3766, 'trois mille sept cent soixante-six'],
  [4196, 'quatre mille cent nonante-six'],
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
  [1_000_000_000_000_000_000_000_000_000n, 'un quadrilliard'],

  // Hyphen separator tests
  [71, 'septante-et-un', { withHyphenSeparator: true }],
  [91, 'nonante-et-un', { withHyphenSeparator: true }],
  [142, 'cent-quarante-deux', { withHyphenSeparator: true }],
  [1243, 'mille-deux-cent-quarante-trois', { withHyphenSeparator: true }],
  [21_602, 'vingt-et-un-mille-six-cent-deux', { withHyphenSeparator: true }]
]

/**
 * Ordinal number test cases
 * Format: [input, expected_output, options?]
 */
export const ordinal = [
  // Basic ordinals
  [1, 'premier'],
  [2, 'deuxième'],
  [3, 'troisième'],
  [4, 'quatrième'],
  [5, 'cinquième'],
  [6, 'sixième'],
  [7, 'septième'],
  [8, 'huitième'],
  [9, 'neuvième'],
  [10, 'dixième'],
  [11, 'onzième'],
  [12, 'douzième'],

  // Teens
  [16, 'seizième'],
  [17, 'dix-septième'],
  [19, 'dix-neuvième'],

  // Tens with Belgian patterns
  [20, 'vingtième'],
  [21, 'vingt et unième'],
  [30, 'trentième'],
  [31, 'trente et unième'],
  [40, 'quarantième'],
  [50, 'cinquantième'],
  [60, 'soixantième'],

  // Belgian septante (70s)
  [70, 'septantième'],
  [71, 'septante et unième'],
  [75, 'septante-cinquième'],
  [79, 'septante-neuvième'],

  // Quatre-vingts (80s) - same as France
  [80, 'quatre-vingtième'],
  [81, 'quatre-vingt-unième'],
  [85, 'quatre-vingt-cinquième'],
  [89, 'quatre-vingt-neuvième'],

  // Belgian nonante (90s)
  [90, 'nonantième'],
  [91, 'nonante et unième'],
  [95, 'nonante-cinquième'],
  [99, 'nonante-neuvième'],

  // Hundreds
  [100, 'centième'],
  [101, 'cent unième'],
  [200, 'deux centième'],
  [300, 'trois centième'],

  // Thousands
  [1000, 'millième'],
  [1001, 'mille unième'],
  [2000, 'deux millième'],

  // Larger numbers
  [1_000_000, 'un millionième'],
  [2_000_000, 'deux millionième']
]

/**
 * Currency test cases (Euro)
 * Format: [input, expected_output, options?]
 */
export const currency = [
  // Zero
  [0, 'zéro euro'],

  // Whole euros (singular/plural)
  [1, 'un euro'],
  [2, 'deux euros'],
  [21, 'vingt et un euros'],
  [100, 'cent euros'],
  [1000, 'mille euros'],
  [1_000_000, 'un million euros'],

  // Centimes only (singular/plural)
  [0.01, 'un centime'],
  [0.02, 'deux centimes'],
  [0.50, 'cinquante centimes'],

  // Belgian patterns in centimes
  [0.70, 'septante centimes'],
  [0.71, 'septante et un centimes'],
  [0.90, 'nonante centimes'],
  [0.99, 'nonante-neuf centimes'],

  // Euros and centimes
  [1.01, 'un euro et un centime'],
  [42.50, 'quarante-deux euros et cinquante centimes'],
  [1000.99, 'mille euros et nonante-neuf centimes'],

  // Belgian patterns in full amounts
  [70.70, 'septante euros et septante centimes'],
  [90.90, 'nonante euros et nonante centimes'],

  // Negative amounts
  [-1, 'moins un euro'],
  [-42.50, 'moins quarante-deux euros et cinquante centimes'],

  // Without "et" option
  [42.50, 'quarante-deux euros cinquante centimes', { and: false }],

  // Edge cases
  [5.00, 'cinq euros'],
  ['5.00', 'cinq euros']
]
