/**
 * Cardinal number test cases
 * Format: [input, expected_output, options?]
 */
export const cardinal = [
  [0.01, 'nulis kablelis nulis vienas'],
  [1.007, 'vienas kablelis nulis nulis septyni'],
  [1.7, 'vienas kablelis septyni'],
  [17.42, 'septyniolika kablelis keturiasdešimt du'],
  [27.312, 'dvidešimt septyni kablelis trys šimtai dvylika'],
  [53.486, 'penkiasdešimt trys kablelis keturi šimtai aštuoniasdešimt šeši'],
  [300.42, 'trys šimtai kablelis keturiasdešimt du'],
  [4196.42, 'keturi tūkstančiai vienas šimtas devyniasdešimt šeši kablelis keturiasdešimt du'],

  [-17.42, 'minus septyniolika kablelis keturiasdešimt du'],
  [-1, 'minus vienas'],
  [-20, 'minus dvidešimt'],

  [0, 'nulis'],
  [1, 'vienas'],
  [2, 'du'],
  [3, 'trys'],
  [11, 'vienuolika'],
  [12, 'dvylika'],
  [16, 'šešiolika'],
  [19, 'devyniolika'],
  [20, 'dvidešimt'],
  [21, 'dvidešimt vienas'],
  [26, 'dvidešimt šeši'],
  [28, 'dvidešimt aštuoni'],
  [30, 'trisdešimt'],
  [31, 'trisdešimt vienas'],
  [40, 'keturiasdešimt'],
  [44, 'keturiasdešimt keturi'],
  [50, 'penkiasdešimt'],
  [55, 'penkiasdešimt penki'],
  [60, 'šešiasdešimt'],
  [67, 'šešiasdešimt septyni'],
  [70, 'septyniasdešimt'],
  [79, 'septyniasdešimt devyni'],
  [89, 'aštuoniasdešimt devyni'],
  [95, 'devyniasdešimt penki'],
  [100, 'vienas šimtas'],
  [101, 'vienas šimtas vienas'],
  [199, 'vienas šimtas devyniasdešimt devyni'],
  [203, 'du šimtai trys'],
  [287, 'du šimtai aštuoniasdešimt septyni'],
  [356, 'trys šimtai penkiasdešimt šeši'],
  [400, 'keturi šimtai'],
  [434, 'keturi šimtai trisdešimt keturi'],
  [578, 'penki šimtai septyniasdešimt aštuoni'],
  [689, 'šeši šimtai aštuoniasdešimt devyni'],
  [729, 'septyni šimtai dvidešimt devyni'],
  [894, 'aštuoni šimtai devyniasdešimt keturi'],
  [999, 'devyni šimtai devyniasdešimt devyni'],
  [1000, 'vienas tūkstantis'],
  [1001, 'vienas tūkstantis vienas'],
  [1097, 'vienas tūkstantis devyniasdešimt septyni'],
  [1104, 'vienas tūkstantis vienas šimtas keturi'],
  [1243, 'vienas tūkstantis du šimtai keturiasdešimt trys'],
  [2385, 'du tūkstančiai trys šimtai aštuoniasdešimt penki'],
  [3766, 'trys tūkstančiai septyni šimtai šešiasdešimt šeši'],
  [4196, 'keturi tūkstančiai vienas šimtas devyniasdešimt šeši'],
  [5846, 'penki tūkstančiai aštuoni šimtai keturiasdešimt šeši'],
  [6459, 'šeši tūkstančiai keturi šimtai penkiasdešimt devyni'],
  [7232, 'septyni tūkstančiai du šimtai trisdešimt du'],
  [8569, 'aštuoni tūkstančiai penki šimtai šešiasdešimt devyni'],
  [9539, 'devyni tūkstančiai penki šimtai trisdešimt devyni'],
  [1_000_000, 'vienas milijonas'],
  [1_000_001, 'vienas milijonas vienas'],
  [4_000_000, 'keturi milijonai'],
  [10_000_000_000_000, 'dešimt trilijonų'],
  [100_000_000_000_000, 'vienas šimtas trilijonų'],
  [1_000_000_000_000_000_000n, 'vienas kvintilijonas'],

  // Feminine gender tests
  [1, 'viena', { gender: 'feminine' }],
  [2, 'dvi', { gender: 'feminine' }],
  [4, 'keturios', { gender: 'feminine' }],
  [5, 'penkios', { gender: 'feminine' }],
  [21, 'dvidešimt viena', { gender: 'feminine' }],
  [22, 'dvidešimt dvi', { gender: 'feminine' }],
  [101, 'vienas šimtas viena', { gender: 'feminine' }],
  [102, 'vienas šimtas dvi', { gender: 'feminine' }],
  [1001, 'vienas tūkstantis vienas', { gender: 'feminine' }],
  [1002, 'vienas tūkstantis du', { gender: 'feminine' }]
]

/**
 * Ordinal number test cases
 * Format: [input, expected_output, options?]
 */
export const ordinal = [
  // Basic ordinals 1-9
  [1, 'pirmas'],
  [2, 'antras'],
  [3, 'trečias'],
  [4, 'ketvirtas'],
  [5, 'penktas'],
  [6, 'šeštas'],
  [7, 'septintas'],
  [8, 'aštuntas'],
  [9, 'devintas'],

  // Teens
  [10, 'dešimtas'],
  [11, 'vienuoliktas'],
  [12, 'dvyliktas'],
  [13, 'tryliktas'],
  [19, 'devynioliktas'],

  // Tens
  [20, 'dvidešimtas'],
  [21, 'dvidešimt pirmas'],
  [30, 'trisdešimtas'],
  [42, 'keturiasdešimt antras'],
  [99, 'devyniasdešimt devintas'],

  // Hundreds
  [100, 'šimtasis'],
  [101, 'vienas šimtas pirmas'],
  [200, 'dviejų šimtasis'],

  // Thousands
  [1000, 'tūkstantasis'],
  [1001, 'vienas tūkstantis pirmas'],
  [2000, 'du tūkstančiai tūkstantasis'],

  // Millions
  [1000000, 'milijonasis'],
  [2000000, 'du milijonai milijonasis']
]

/**
 * Currency test cases (Euro)
 * Format: [input, expected_output, options?]
 */
export const currency = [
  // Zero
  [0, 'nulis eurų'],

  // Whole euros
  [1, 'vienas euras'],
  [2, 'du eurai'],
  [5, 'penki eurai'],
  [10, 'dešimt eurų'],
  [21, 'dvidešimt vienas euras'],
  [42, 'keturiasdešimt du eurai'],
  [100, 'vienas šimtas eurų'],
  [1000, 'vienas tūkstantis eurų'],

  // Cents only
  [0.01, 'vienas centas'],
  [0.02, 'du centai'],
  [0.05, 'penki centai'],
  [0.10, 'dešimt centų'],
  [0.25, 'dvidešimt penki centai'],
  [0.50, 'penkiasdešimt centų'],
  [0.99, 'devyniasdešimt devyni centai'],

  // Euros and cents
  [1.01, 'vienas euras vienas centas'],
  [1.50, 'vienas euras penkiasdešimt centų'],
  [2.02, 'du eurai du centai'],
  [42.50, 'keturiasdešimt du eurai penkiasdešimt centų'],
  [100.99, 'vienas šimtas eurų devyniasdešimt devyni centai'],

  // Negative amounts
  [-1, 'minus vienas euras'],
  [-42.50, 'minus keturiasdešimt du eurai penkiasdešimt centų'],

  // Edge cases
  [5.00, 'penki eurai'],
  ['5.00', 'penki eurai']
]
