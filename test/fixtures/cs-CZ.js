/**
 * Cardinal number test cases
 * Format: [input, expected_output, options?]
 */
export const cardinal = [
  [0.01, 'nula celá nula jedna'],
  [1.007, 'jedna celá nula nula sedm'],
  [1.7, 'jedna celá sedm'],
  [17.42, 'sedmnáct celých čtyřicet dva'],
  [27.312, 'dvacet sedm celých tři sta dvanáct'],
  [53.486, 'padesát tři celých čtyři sta osmdesát šest'],
  [300.42, 'tři sta celých čtyřicet dva'],
  [4196.42, 'čtyři tisíce sto devadesát šest celých čtyřicet dva'],

  [-1.42, 'mínus jedna celá čtyřicet dva'],
  [0.5, 'nula celá pět'],
  [4.7, 'čtyři celé sedm'],
  [5.6, 'pět celých šest'],
  [-22.9, 'mínus dvacet dva celých devět'],

  [-17.42, 'mínus sedmnáct celých čtyřicet dva'],
  [-1, 'mínus jedna'],
  [-20, 'mínus dvacet'],

  [0, 'nula'],
  [1, 'jedna'],
  [2, 'dva'],
  [3, 'tři'],
  [11, 'jedenáct'],
  [12, 'dvanáct'],
  [16, 'šestnáct'],
  [19, 'devatenáct'],
  [20, 'dvacet'],
  [21, 'dvacet jedna'],
  [26, 'dvacet šest'],
  [28, 'dvacet osm'],
  [30, 'třicet'],
  [31, 'třicet jedna'],
  [40, 'čtyřicet'],
  [44, 'čtyřicet čtyři'],
  [50, 'padesát'],
  [55, 'padesát pět'],
  [60, 'šedesát'],
  [67, 'šedesát sedm'],
  [70, 'sedmdesát'],
  [79, 'sedmdesát devět'],
  [89, 'osmdesát devět'],
  [95, 'devadesát pět'],
  [100, 'sto'],
  [101, 'sto jedna'],
  [199, 'sto devadesát devět'],
  [203, 'dvě stě tři'],
  [287, 'dvě stě osmdesát sedm'],
  [356, 'tři sta padesát šest'],
  [400, 'čtyři sta'],
  [434, 'čtyři sta třicet čtyři'],
  [578, 'pět set sedmdesát osm'],
  [689, 'šest set osmdesát devět'],
  [729, 'sedm set dvacet devět'],
  [894, 'osm set devadesát čtyři'],
  [999, 'devět set devadesát devět'],
  [1000, 'tisíc'],
  [1001, 'tisíc jedna'],
  [1097, 'tisíc devadesát sedm'],
  [1104, 'tisíc sto čtyři'],
  [1243, 'tisíc dvě stě čtyřicet tři'],
  [2385, 'dva tisíce tři sta osmdesát pět'],
  [3766, 'tři tisíce sedm set šedesát šest'],
  [4196, 'čtyři tisíce sto devadesát šest'],
  [5846, 'pět tisíc osm set čtyřicet šest'],
  [6459, 'šest tisíc čtyři sta padesát devět'],
  [7232, 'sedm tisíc dvě stě třicet dva'],
  [8569, 'osm tisíc pět set šedesát devět'],
  [9539, 'devět tisíc pět set třicet devět'],
  [1_000_000, 'milion'],
  [1_000_001, 'milion jedna'],
  [4_000_000, 'čtyři miliony'],
  [10_000_000_000_000, 'deset bilionů'],
  [100_000_000_000_000, 'sto bilionů'],
  [2_000_000, 'dva miliony'],
  [5_000_000, 'pět milionů'],
  [1_000_000_000, 'miliarda'],
  [2_000_000_000, 'dva miliardy'],
  [5_000_000_000, 'pět miliard'],
  [1_000_000_000_000, 'bilion'],
  [2_000_000_000_000, 'dva biliony'],
  [5_000_000_000_000, 'pět bilionů'],
  [1_000_000_000_000_000, 'biliarda'],
  [2_000_000_000_000_000, 'dva biliardy'],
  [5_000_000_000_000_000, 'pět biliard'],
  [1_000_000_000_000_000_000n, 'trilion'],
  [2_000_000_000_000_000_000n, 'dva triliony'],
  [5_000_000_000_000_000_000n, 'pět trilionů'],
  [1_000_000_000_000_000_000_000n, 'triliarda'],
  [2_000_000_000_000_000_000_000n, 'dva triliardy'],
  [5_000_000_000_000_000_000_000n, 'pět triliard'],
  [1_000_000_000_000_000_000_000_000n, 'kvadrilion'],
  [2_000_000_000_000_000_000_000_000n, 'dva kvadriliony'],
  [5_000_000_000_000_000_000_000_000n, 'pět kvadrilionů']
]

/**
 * Ordinal number test cases
 * Format: [input, expected_output, options?]
 */
export const ordinal = [
  // Basic ordinals 1-9
  [1, 'první'],
  [2, 'druhý'],
  [3, 'třetí'],
  [4, 'čtvrtý'],
  [5, 'pátý'],
  [6, 'šestý'],
  [7, 'sedmý'],
  [8, 'osmý'],
  [9, 'devátý'],

  // Teens
  [10, 'desátý'],
  [11, 'jedenáctý'],
  [12, 'dvanáctý'],
  [13, 'třináctý'],
  [14, 'čtrnáctý'],
  [15, 'patnáctý'],
  [19, 'devatenáctý'],

  // Tens
  [20, 'dvacátý'],
  [21, 'dvacet první'],
  [30, 'třicátý'],
  [42, 'čtyřicet druhý'],
  [99, 'devadesát devátý'],

  // Hundreds
  [100, 'stý'],
  [101, 'sto první'],
  [200, 'dvoustý'],
  [300, 'třístý'],
  [500, 'pětistý'],
  [121, 'sto dvacet první'],

  // Thousands
  [1000, 'tisící'],
  [1001, 'tisíc první'],
  [2000, 'dva tisící'],
  [5000, 'pět tisící'],
  [10000, 'deset tisící'],

  // Millions
  [1000000, 'miliontý'],
  [2000000, 'dva miliontý']
]

/**
 * Currency test cases (Czech Koruna)
 * Format: [input, expected_output, options?]
 */
export const currency = [
  // Zero
  [0, 'nula korun'],

  // Whole koruny
  [1, 'jedna koruna'],
  [2, 'dva koruny'],
  [3, 'tři koruny'],
  [4, 'čtyři koruny'],
  [5, 'pět korun'],
  [10, 'deset korun'],
  [21, 'dvacet jedna korun'],
  [42, 'čtyřicet dva koruny'],
  [100, 'sto korun'],
  [1000, 'tisíc korun'],

  // Haléře only
  [0.01, 'jedna haléř'],
  [0.02, 'dva haléře'],
  [0.05, 'pět haléřů'],
  [0.25, 'dvacet pět haléřů'],
  [0.50, 'padesát haléřů'],
  [0.99, 'devadesát devět haléřů'],

  // Koruny and haléře
  [1.01, 'jedna koruna jedna haléř'],
  [1.50, 'jedna koruna padesát haléřů'],
  [2.02, 'dva koruny dva haléře'],
  [42.50, 'čtyřicet dva koruny padesát haléřů'],
  [100.99, 'sto korun devadesát devět haléřů'],

  // Negative amounts
  [-1, 'mínus jedna koruna'],
  [-42.50, 'mínus čtyřicet dva koruny padesát haléřů'],

  // Edge cases
  [5.00, 'pět korun'],
  ['5.00', 'pět korun']
]
