/**
 * Cardinal number test cases
 * Format: [input, expected_output, options?]
 */
export const cardinal = [
  [0.01, 'nul komma nul één'],
  [1.007, 'één komma nul nul zeven'],
  [1.7, 'één komma zeven'],
  [17.42, 'zeventien komma tweeënveertig'],
  [27.312, 'zevenentwintig komma driehonderdtwaalf'],
  [53.486, 'drieënvijftig komma vierhonderdzesentachtig'],
  [300.42, 'driehonderd komma tweeënveertig'],
  [4196.42, 'eenenveertighonderd zesennegentig komma tweeënveertig'],

  [-17.42, 'min zeventien komma tweeënveertig'],
  [-1, 'min één'],
  [-20, 'min twintig'],

  [0, 'nul'],
  [1, 'één'],
  [1, 'een', { accentOne: false }],
  [2, 'twee'],
  [3, 'drie'],
  [11, 'elf'],
  [12, 'twaalf'],
  [16, 'zestien'],
  [19, 'negentien'],
  [20, 'twintig'],
  [21, 'eenentwintig'],
  [21, 'eenentwintig', { accentOne: true }],
  [26, 'zesentwintig'],
  [28, 'achtentwintig'],
  [30, 'dertig'],
  [31, 'eenendertig'],
  [40, 'veertig'],
  [44, 'vierenveertig'],
  [50, 'vijftig'],
  [55, 'vijfenvijftig'],
  [60, 'zestig'],
  [67, 'zevenenzestig'],
  [70, 'zeventig'],
  [79, 'negenenzeventig'],
  [89, 'negenentachtig'],
  [95, 'vijfennegentig'],
  [100, 'honderd'],
  [101, 'honderdeen'],
  [101, 'honderdeneen', { includeOptionalAnd: true }],
  [111, 'honderdelf'],
  [111, 'honderdenelf', { includeOptionalAnd: true }],
  [112, 'honderdtwaalf'],
  [112, 'honderdentwaalf', { includeOptionalAnd: true }],
  [113, 'honderddertien'],
  [113, 'honderddertien', { includeOptionalAnd: true }],
  [199, 'honderdnegenennegentig'],
  [200, 'tweehonderd'],
  [235, 'tweehonderdvijfendertig'],
  [203, 'tweehonderddrie'],
  [203, 'tweehonderdendrie', { includeOptionalAnd: true }],
  [242, 'tweehonderdtweeënveertig'],
  [287, 'tweehonderdzevenentachtig'],
  [356, 'driehonderdzesenvijftig'],
  [400, 'vierhonderd'],
  [434, 'vierhonderdvierendertig'],
  [578, 'vijfhonderdachtenzeventig'],
  [689, 'zeshonderdnegenentachtig'],
  [729, 'zevenhonderdnegenentwintig'],
  [894, 'achthonderdvierennegentig'],
  [999, 'negenhonderdnegenennegentig'],
  [1000, 'duizend'],
  [1001, 'duizend één'],
  [1001, 'duizend een', { accentOne: false }],
  [1001, 'duizend en één', { includeOptionalAnd: true }],
  [1010, 'duizend tien'],
  [1010, 'duizend en tien', { includeOptionalAnd: true }],
  [1012, 'duizend twaalf'],
  [1012, 'duizend en twaalf', { includeOptionalAnd: true }],
  [1013, 'duizend dertien'],
  [1013, 'duizend dertien', { includeOptionalAnd: true }],
  [1097, 'duizend zevenennegentig'],
  [1104, 'elfhonderd vier'],
  [1104, 'elfhonderd en vier', { includeOptionalAnd: true }],
  [1104, 'duizend honderdvier', { noHundredPairing: true }],
  [
    1104,
    'duizend honderdenvier',
    { noHundredPairing: true, includeOptionalAnd: true }
  ],
  [1243, 'twaalfhonderd drieënveertig'],
  [1243, 'duizend tweehonderddrieënveertig', { noHundredPairing: true }],
  [1700, 'zeventienhonderd'],
  [2385, 'drieëntwintighonderd vijfentachtig'],
  [2385, 'tweeduizend driehonderdvijfentachtig', { noHundredPairing: true }],
  [3766, 'zevenendertighonderd zesenzestig'],
  [3766, 'drieduizend zevenhonderdzesenzestig', { noHundredPairing: true }],
  [4196, 'eenenveertighonderd zesennegentig'],
  [4196, 'vierduizend honderdzesennegentig', { noHundredPairing: true }],
  [5846, 'achtenvijftighonderd zesenveertig'],
  [5846, 'vijfduizend achthonderdzesenveertig', { noHundredPairing: true }],
  [6028, 'zesduizend achtentwintig'],
  [6459, 'vierenzestighonderd negenenvijftig'],
  [6459, 'zesduizend vierhonderdnegenenvijftig', { noHundredPairing: true }],
  [7232, 'tweeënzeventighonderd tweeëndertig'],
  [7232, 'zevenduizend tweehonderdtweeëndertig', { noHundredPairing: true }],
  [8569, 'vijfentachtighonderd negenenzestig'],
  [8569, 'achtduizend vijfhonderdnegenenzestig', { noHundredPairing: true }],
  [9539, 'vijfennegentighonderd negenendertig'],
  [9539, 'negenduizend vijfhonderdnegenendertig', { noHundredPairing: true }],
  [28_000, 'achtentwintigduizend'],
  [28_064, 'achtentwintigduizend vierenzestig'],
  [100_000, 'honderdduizend'],
  [115_000, 'honderdvijftienduizend'],
  [271_850, 'tweehonderdeenenzeventigduizend achthonderdvijftig'],
  [381_000, 'driehonderdeenentachtigduizend'],
  [500_000, 'vijfhonderdduizend'],
  [1_000_000, 'één miljoen'],
  [1_000_000, 'een miljoen', { accentOne: false }],
  [1_000_001, 'één miljoen één'],
  [1_000_001, 'een miljoen een', { accentOne: false }],
  [1_000_001, 'één miljoen en één', { includeOptionalAnd: true }],
  [4_000_000, 'vier miljoen'],
  [4_323_000, 'vier miljoen driehonderddrieëntwintigduizend'],
  [4_323_055, 'vier miljoen driehonderddrieëntwintigduizend vijfenvijftig'],
  [1_570_025, 'één miljoen vijfhonderdzeventigduizend vijfentwintig'],
  [4_000_000_000, 'vier miljard'],
  [1_000_000_000, 'één miljard'],
  [2_580_000_000, 'twee miljard vijfhonderdtachtig miljoen'],
  [5_200_000_000, 'vijf miljard tweehonderd miljoen'],
  [
    347_625_728_221,
    'driehonderdzevenenveertig miljard zeshonderdvijfentwintig miljoen' +
    ' zevenhonderdachtentwintigduizend tweehonderdeenentwintig'
  ],
  [1_000_000_000_000, 'één biljoen'],
  [3_627_000_000_000, 'drie biljoen zeshonderdzevenentwintig miljard'],
  [10_000_000_000_000, 'tien biljoen'],
  [100_000_000_000_000, 'honderd biljoen'],
  [
    4_500_072_900_000_111,
    'vier biljard vijfhonderd biljoen tweeënzeventig miljard negenhonderd' +
    ' miljoen honderdelf'
  ],
  [
    4_500_072_900_000_111,
    'vier biljard vijfhonderd biljoen tweeënzeventig miljard negenhonderd' +
    ' miljoen honderdenelf',
    { includeOptionalAnd: true }
  ],
  [1_000_000_000_000_000_000n, 'één triljoen']
]

/**
 * Ordinal number test cases
 * Format: [input, expected_output]
 */
export const ordinal = [
  // Basic ones (1-9) - eerste, derde, achtste are irregular
  [1, 'eerste'],
  [2, 'tweede'],
  [3, 'derde'],
  [4, 'vierde'],
  [5, 'vijfde'],
  [6, 'zesde'],
  [7, 'zevende'],
  [8, 'achtste'],
  [9, 'negende'],

  // Teens (10-19) - add -de
  [10, 'tiende'],
  [11, 'elfde'],
  [12, 'twaalfde'],
  [13, 'dertiende'],
  [14, 'veertiende'],
  [15, 'vijftiende'],
  [16, 'zestiende'],
  [17, 'zeventiende'],
  [18, 'achttiende'],
  [19, 'negentiende'],

  // Tens (20-90) - add -ste
  [20, 'twintigste'],
  [30, 'dertigste'],
  [40, 'veertigste'],
  [50, 'vijftigste'],
  [60, 'zestigste'],
  [70, 'zeventigste'],
  [80, 'tachtigste'],
  [90, 'negentigste'],

  // Compound tens-ones
  [21, 'eenentwintigste'],
  [22, 'tweeëntwintigste'],
  [23, 'drieëntwintigste'],
  [32, 'tweeëndertigste'],
  [42, 'tweeënveertigste'],
  [53, 'drieënvijftigste'],
  [67, 'zevenenzestigste'],
  [88, 'achtentachtigste'],
  [99, 'negenennegentigste'],

  // Hundreds
  [100, 'honderdste'],
  [101, 'honderd eerste'],
  [102, 'honderd tweede'],
  [103, 'honderd derde'],
  [110, 'honderd tiende'],
  [111, 'honderd elfde'],
  [121, 'honderd eenentwintigste'],
  [200, 'tweehonderdste'],
  [300, 'driehonderdste'],
  [500, 'vijfhonderdste'],
  [999, 'negenhonderd negenennegentigste'],

  // Thousands
  [1000, 'duizendste'],
  [1001, 'duizend eerste'],
  [1010, 'duizend tiende'],
  [1100, 'duizend honderdste'],
  [1111, 'duizend honderd elfde'],
  [2000, 'tweeduizendste'],
  [5000, 'vijfduizendste'],
  [10000, 'tienduizendste'],
  [12345, 'twaalfduizend driehonderd vijfenveertigste'],
  [99999, 'negenennegentigduizend negenhonderd negenennegentigste'],

  // Larger scales
  [1_000_000, 'een miljoenste'],
  [1_000_001, 'een miljoen eerste'],
  [2_000_000, 'twee miljoenste'],
  [1_000_000_000, 'een miljardste'],
  [1_000_000_000_000, 'een biljoenste'],

  // BigInt support
  [1_000_000_000_000_000_000n, 'een triljoenste']
]

/**
 * Currency test cases (Euro)
 * Format: [input, expected_output, options?]
 */
export const currency = [
  // Zero
  [0, 'nul euro'],

  // Whole euros
  [1, 'één euro'],
  [2, 'twee euro'],
  [10, 'tien euro'],
  [21, 'eenentwintig euro'],
  [100, 'honderd euro'],
  [1000, 'duizend euro'],
  [1000000, 'één miljoen euro'],

  // Cents only
  [0.01, 'één cent'],
  [0.02, 'twee cent'],
  [0.10, 'tien cent'],
  [0.21, 'eenentwintig cent'],
  [0.50, 'vijftig cent'],
  [0.99, 'negenennegentig cent'],

  // Euros and cents
  [1.01, 'één euro en één cent'],
  [1.50, 'één euro en vijftig cent'],
  [2.02, 'twee euro en twee cent'],
  [21.21, 'eenentwintig euro en eenentwintig cent'],
  [42.50, 'tweeënveertig euro en vijftig cent'],
  [100.99, 'honderd euro en negenennegentig cent'],
  [1000.01, 'duizend euro en één cent'],
  [1000000.01, 'één miljoen euro en één cent'],

  // Negative amounts
  [-1, 'min één euro'],
  [-0.50, 'min vijftig cent'],
  [-42.50, 'min tweeënveertig euro en vijftig cent'],

  // Without "en" option
  [42.50, 'tweeënveertig euro vijftig cent', { and: false }],
  [1.01, 'één euro één cent', { and: false }],

  // Edge cases: .00 cents should show euros only
  [5.00, 'vijf euro'],
  ['5.00', 'vijf euro'],
  [100.00, 'honderd euro'],

  // String inputs
  ['42.50', 'tweeënveertig euro en vijftig cent'],
  ['0.99', 'negenennegentig cent'],

  // BigInt (whole euros only)
  [1000000000000n, 'één biljoen euro']
]
