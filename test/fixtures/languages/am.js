/**
 * Test fixtures for Amharic (am) language
 *
 * Format: [input, expected_output, options?]
 * - input: number, bigint, or string to convert
 * - expected_output: expected string result
 * - options: (optional) converter options object
 *
 * Default script is 'geez' (Ge'ez/Ethiopic script)
 */
export default [
  // Basic numbers (0-10) - Ge'ez script (default)
  [0, 'ዜሮ'],
  [1, 'አንድ'],
  [2, 'ሁለት'],
  [3, 'ሶስት'],
  [4, 'አራት'],
  [5, 'አምስት'],
  [6, 'ስድስት'],
  [7, 'ሰባት'],
  [8, 'ስምንት'],
  [9, 'ዘጠኝ'],
  [10, 'አስር'],

  // Teens (11-19) - formed with አስራ + unit
  [11, 'አስራ አንድ'],
  [12, 'አስራ ሁለት'],
  [13, 'አስራ ሶስት'],
  [14, 'አስራ አራት'],
  [15, 'አስራ አምስት'],
  [16, 'አስራ ስድስት'],
  [17, 'አስራ ሰባት'],
  [18, 'አስራ ስምንት'],
  [19, 'አስራ ዘጠኝ'],

  // Tens (20-90)
  [20, 'ሃያ'],
  [30, 'ሰላሳ'],
  [40, 'አርባ'],
  [50, 'ሃምሳ'],
  [60, 'ስልሳ'],
  [70, 'ሰባ'],
  [80, 'ሰማንያ'],
  [90, 'ዘጠና'],

  // Compound numbers (21-99)
  [21, 'ሃያ አንድ'],
  [35, 'ሰላሳ አምስት'],
  [42, 'አርባ ሁለት'],
  [99, 'ዘጠና ዘጠኝ'],

  // Hundreds
  [100, 'አንድ መቶ'],
  [101, 'አንድ መቶ አንድ'],
  [110, 'አንድ መቶ አስር'],
  [200, 'ሁለት መቶ'],
  [500, 'አምስት መቶ'],
  [999, 'ዘጠኝ መቶ ዘጠና ዘጠኝ'],

  // Thousands
  [1000, 'አንድ ሺ'],
  [1001, 'አንድ ሺ አንድ'],
  [2000, 'ሁለት ሺ'],
  [10000, 'አስር ሺ'],
  [100000, 'አንድ መቶ ሺ'],

  // Millions
  [1000000, 'አንድ ሚሊዮን'],
  [2000000, 'ሁለት ሚሊዮን'],

  // Billions
  [1000000000, 'አንድ ቢሊዮን'],

  // Negative numbers
  [-1, 'አሉታዊ አንድ'],
  [-42, 'አሉታዊ አርባ ሁለት'],

  // Decimals
  ['3.14', 'ሶስት ነጥብ አንድ አራት'],
  ['0.5', 'ዜሮ ነጥብ አምስት'],

  // BigInt
  [BigInt(999), 'ዘጠኝ መቶ ዘጠና ዘጠኝ'],

  // Latin script option
  [0, 'zero', { script: 'latin' }],
  [1, 'and', { script: 'latin' }],
  [2, 'hulet', { script: 'latin' }],
  [10, 'asir', { script: 'latin' }],
  [11, 'asra and', { script: 'latin' }],
  [20, 'haya', { script: 'latin' }],
  [21, 'haya and', { script: 'latin' }],
  [100, 'and meto', { script: 'latin' }],
  [1000, 'and shi', { script: 'latin' }],
  [1000000, 'and miliyon', { script: 'latin' }],
  [-5, 'asitegna amist', { script: 'latin' }],
  ['3.14', 'sost netib and arat', { script: 'latin' }]
]
