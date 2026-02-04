/**
 * Cardinal number test cases
 * Format: [input, expected_output, options?]
 */
export const cardinal = [
  [0.01, 'nulle komats nulle viens'],
  [1.007, 'viens komats nulle nulle septiņi'],
  [1.7, 'viens komats septiņi'],
  [17.42, 'septiņpadsmit komats četrdesmit divi'],
  [27.312, 'divdesmit septiņi komats trīs simti divpadsmit'],
  [53.486, 'piecdesmit trīs komats četri simti astoņdesmit seši'],
  [300.42, 'trīs simti komats četrdesmit divi'],
  [4196.42, 'četri tūkstoši simts deviņdesmit seši komats četrdesmit divi'],

  [-17.42, 'mīnus septiņpadsmit komats četrdesmit divi'],
  [-1, 'mīnus viens'],
  [-20, 'mīnus divdesmit'],

  [0, 'nulle'],
  [1, 'viens'],
  [2, 'divi'],
  [3, 'trīs'],
  [11, 'vienpadsmit'],
  [12, 'divpadsmit'],
  [16, 'sešpadsmit'],
  [19, 'deviņpadsmit'],
  [20, 'divdesmit'],
  [21, 'divdesmit viens'],
  [26, 'divdesmit seši'],
  [28, 'divdesmit astoņi'],
  [30, 'trīsdesmit'],
  [31, 'trīsdesmit viens'],
  [40, 'četrdesmit'],
  [44, 'četrdesmit četri'],
  [50, 'piecdesmit'],
  [55, 'piecdesmit pieci'],
  [60, 'sešdesmit'],
  [67, 'sešdesmit septiņi'],
  [70, 'septiņdesmit'],
  [79, 'septiņdesmit deviņi'],
  [89, 'astoņdesmit deviņi'],
  [95, 'deviņdesmit pieci'],
  [100, 'simts'],
  [101, 'simtu viens'],
  [199, 'simts deviņdesmit deviņi'],
  [203, 'divi simti trīs'],
  [287, 'divi simti astoņdesmit septiņi'],
  [356, 'trīs simti piecdesmit seši'],
  [400, 'četri simti'],
  [434, 'četri simti trīsdesmit četri'],
  [578, 'pieci simti septiņdesmit astoņi'],
  [689, 'seši simti astoņdesmit deviņi'],
  [729, 'septiņi simti divdesmit deviņi'],
  [894, 'astoņi simti deviņdesmit četri'],
  [999, 'deviņi simti deviņdesmit deviņi'],
  [1000, 'tūkstotis'],
  [1001, 'tūkstotis viens'],
  [1097, 'tūkstotis deviņdesmit septiņi'],
  [1104, 'tūkstotis simtu četri'],
  [1243, 'tūkstotis divi simti četrdesmit trīs'],
  [2385, 'divi tūkstoši trīs simti astoņdesmit pieci'],
  [3766, 'trīs tūkstoši septiņi simti sešdesmit seši'],
  [4196, 'četri tūkstoši simts deviņdesmit seši'],
  [5846, 'pieci tūkstoši astoņi simti četrdesmit seši'],
  [6459, 'seši tūkstoši četri simti piecdesmit deviņi'],
  [7232, 'septiņi tūkstoši divi simti trīsdesmit divi'],
  [8569, 'astoņi tūkstoši pieci simti sešdesmit deviņi'],
  [9539, 'deviņi tūkstoši pieci simti trīsdesmit deviņi'],
  [1_000_000, 'miljons'],
  [1_000_001, 'miljons viens'],
  [4_000_000, 'četri miljoni'],
  [10_000_000_000_000, 'desmit triljoni'],
  [100_000_000_000_000, 'simts triljoni'],
  [1_000_000_000_000_000_000n, 'kvintiljons'],

  // Feminine gender tests
  [1, 'viena', { gender: 'feminine' }],
  [2, 'divas', { gender: 'feminine' }],
  [4, 'četras', { gender: 'feminine' }],
  [5, 'piecas', { gender: 'feminine' }],
  [21, 'divdesmit viena', { gender: 'feminine' }],
  [22, 'divdesmit divas', { gender: 'feminine' }],
  [101, 'simtu viena', { gender: 'feminine' }],
  [102, 'simtu divas', { gender: 'feminine' }],
  [1001, 'tūkstotis viens', { gender: 'feminine' }],
  [1002, 'tūkstotis divi', { gender: 'feminine' }]
]

/**
 * Ordinal number test cases
 * Format: [input, expected_output, options?]
 */
export const ordinal = [
  // Basic ordinals 1-9
  [1, 'pirmais'],
  [2, 'otrais'],
  [3, 'trešais'],
  [4, 'ceturtais'],
  [5, 'piektais'],
  [6, 'sestais'],
  [7, 'septītais'],
  [8, 'astotais'],
  [9, 'devītais'],

  // Teens
  [10, 'desmitais'],
  [11, 'vienpadsmitais'],
  [12, 'divpadsmitais'],
  [13, 'trīspadsmitais'],
  [19, 'deviņpadsmitais'],

  // Tens
  [20, 'divdesmitais'],
  [21, 'divdesmit pirmais'],
  [30, 'trīsdesmitais'],
  [42, 'četrdesmit otrais'],
  [99, 'deviņdesmit devītais'],

  // Hundreds
  [100, 'simtais'],
  [101, 'simts pirmais'],
  [200, 'divsimtais'],

  // Thousands
  [1000, 'tūkstošais'],
  [1001, 'tūkstotis pirmais'],
  [2000, 'divi tūkstoši tūkstošais'],

  // Millions
  [1000000, 'miljonais'],
  [2000000, 'divi miljoni miljonais']
]

/**
 * Currency test cases (Euro)
 * Format: [input, expected_output, options?]
 */
export const currency = [
  // Zero
  [0, 'nulle eiro'],

  // Whole euros (eiro is indeclinable)
  [1, 'viens eiro'],
  [2, 'divi eiro'],
  [5, 'pieci eiro'],
  [10, 'desmit eiro'],
  [21, 'divdesmit viens eiro'],
  [42, 'četrdesmit divi eiro'],
  [100, 'simts eiro'],
  [1000, 'tūkstotis eiro'],

  // Cents only
  [0.01, 'viens cents'],
  [0.02, 'divi centi'],
  [0.05, 'pieci centi'],
  [0.10, 'desmit centu'],
  [0.11, 'vienpadsmit centu'],
  [0.25, 'divdesmit pieci centi'],
  [0.50, 'piecdesmit centu'],
  [0.99, 'deviņdesmit deviņi centi'],

  // Euros and cents
  [1.01, 'viens eiro viens cents'],
  [1.50, 'viens eiro piecdesmit centu'],
  [2.02, 'divi eiro divi centi'],
  [42.50, 'četrdesmit divi eiro piecdesmit centu'],
  [100.99, 'simts eiro deviņdesmit deviņi centi'],

  // Negative amounts
  [-1, 'mīnus viens eiro'],
  [-42.50, 'mīnus četrdesmit divi eiro piecdesmit centu'],

  // Edge cases
  [5.00, 'pieci eiro'],
  ['5.00', 'pieci eiro']
]
