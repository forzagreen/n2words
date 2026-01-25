/**
 * Cardinal number test cases
 * Format: [input, expected_output, options?]
 */
export const cardinal = [
  [0.01, 'null komma null en'],
  [1.007, 'en komma null null syv'],
  [1.7, 'en komma syv'],
  [17.42, 'sytten komma førti-to'],
  [27.312, 'tjue-syv komma tre hundre og tolv'],
  [53.486, 'femti-tre komma fire hundre og åtti-seks'],
  [300.42, 'tre hundre komma førti-to'],
  [4196.42, 'fire tusen, en hundre og nitti-seks komma førti-to'],

  [-17.42, 'minus sytten komma førti-to'],
  [-1, 'minus en'],
  [-20, 'minus tjue'],

  [0, 'null'],
  [1, 'en'],
  [2, 'to'],
  [3, 'tre'],
  [11, 'elleve'],
  [12, 'tolv'],
  [16, 'seksten'],
  [19, 'nitten'],
  [20, 'tjue'],
  [21, 'tjue-en'],
  [26, 'tjue-seks'],
  [28, 'tjue-åtte'],
  [30, 'tretti'],
  [31, 'tretti-en'],
  [40, 'førti'],
  [44, 'førti-fire'],
  [50, 'femti'],
  [55, 'femti-fem'],
  [60, 'seksti'],
  [67, 'seksti-syv'],
  [70, 'sytti'],
  [79, 'sytti-ni'],
  [89, 'åtti-ni'],
  [95, 'nitti-fem'],
  [100, 'en hundre'],
  [101, 'en hundre og en'],
  [199, 'en hundre og nitti-ni'],
  [203, 'to hundre og tre'],
  [287, 'to hundre og åtti-syv'],
  [356, 'tre hundre og femti-seks'],
  [400, 'fire hundre'],
  [434, 'fire hundre og tretti-fire'],
  [578, 'fem hundre og sytti-åtte'],
  [689, 'seks hundre og åtti-ni'],
  [729, 'syv hundre og tjue-ni'],
  [894, 'åtte hundre og nitti-fire'],
  [999, 'ni hundre og nitti-ni'],
  [1000, 'en tusen'],
  [1001, 'en tusen og en'],
  [1097, 'en tusen og nitti-syv'],
  [1104, 'en tusen, en hundre og fire'],
  [1243, 'en tusen, to hundre og førti-tre'],
  [2385, 'to tusen, tre hundre og åtti-fem'],
  [3766, 'tre tusen, syv hundre og seksti-seks'],
  [4196, 'fire tusen, en hundre og nitti-seks'],
  [5846, 'fem tusen, åtte hundre og førti-seks'],
  [6459, 'seks tusen, fire hundre og femti-ni'],
  [7232, 'syv tusen, to hundre og tretti-to'],
  [8569, 'åtte tusen, fem hundre og seksti-ni'],
  [9539, 'ni tusen, fem hundre og tretti-ni'],
  [1_000_000, 'en million'],
  [1_000_001, 'en million og en'],
  [4_000_000, 'fire million'],
  [10_000_000_000_000, 'ti billion'],
  [100_000_000_000_000, 'en hundre billion'],
  [1_000_000_000_000_000_000n, 'en kvintillion']
]

/**
 * Ordinal number test cases
 * Format: [input, expected_output, options?]
 */
export const ordinal = [
  // Special forms 1-12
  [1, 'første'],
  [2, 'andre'],
  [3, 'tredje'],
  [4, 'fjerde'],
  [5, 'femte'],
  [6, 'sjette'],
  [7, 'sjuende'],
  [8, 'åttende'],
  [9, 'niende'],
  [10, 'tiende'],
  [11, 'ellevte'],
  [12, 'tolvte'],

  // Regular forms (cardinal + de)
  [13, 'trettende'],
  [14, 'fjortende'],
  [19, 'nittende'],
  [20, 'tjuede'],
  [21, 'tjue-ende'],
  [30, 'trettide'],
  [42, 'førti-tode'],
  [99, 'nitti-niede'],

  // Hundreds
  [100, 'en hundrede'],
  [101, 'en hundre og ende'],
  [200, 'to hundrede'],

  // Thousands
  [1000, 'en tusende'],
  [1001, 'en tusen og ende']
]

/**
 * Currency test cases (Norwegian Krone)
 * Format: [input, expected_output, options?]
 */
export const currency = [
  // Zero
  [0, 'null kroner'],

  // Whole kroner
  [1, 'en krone'],
  [2, 'to kroner'],
  [5, 'fem kroner'],
  [10, 'ti kroner'],
  [21, 'tjue-en kroner'],
  [42, 'førti-to kroner'],
  [100, 'en hundre kroner'],
  [1000, 'en tusen kroner'],

  // Øre only
  [0.01, 'en øre'],
  [0.25, 'tjue-fem øre'],
  [0.50, 'femti øre'],
  [0.99, 'nitti-ni øre'],

  // Kroner and øre
  [1.01, 'en krone og en øre'],
  [1.50, 'en krone og femti øre'],
  [42.50, 'førti-to kroner og femti øre'],
  [100.99, 'en hundre kroner og nitti-ni øre'],

  // Negative amounts
  [-1, 'minus en krone'],
  [-42.50, 'minus førti-to kroner og femti øre'],

  // Edge cases
  [5.00, 'fem kroner'],
  ['5.00', 'fem kroner']
]
