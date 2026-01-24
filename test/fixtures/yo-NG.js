/**
 * Cardinal number test cases
 * Format: [input, expected_output, options?]
 */
export const cardinal = [
  // Zero
  [0, 'òdo'],

  // Basic numbers 1-10
  [1, 'ọ̀kan'],
  [2, 'èjì'],
  [3, 'ẹ̀ta'],
  [4, 'ẹ̀rin'],
  [5, 'àrùn'],
  [6, 'ẹ̀fà'],
  [7, 'èje'],
  [8, 'ẹ̀jọ'],
  [9, 'ẹ̀sán'],
  [10, 'ẹ̀wá'],

  // Teens - additive (11-14): X + 10
  [11, 'ọ̀kànlá'],
  [12, 'èjìlá'],
  [13, 'ẹ̀talá'],
  [14, 'ẹ̀rinlá'],

  // Teens - subtractive (15-19): 20 - X
  [15, 'àrùndínlógún'],
  [16, 'ẹ̀rìndínlógún'],
  [17, 'ẹ̀tadínlógún'],
  [18, 'èjìdínlógún'],
  [19, 'ọ̀kàndínlógún'],

  // Decades
  [20, 'ogún'],
  [30, 'ọgbọ̀n'],
  [40, 'ogójì'],
  [50, 'àádọ́ta'],
  [60, 'ogóta'],
  [70, 'àádọ́rin'],
  [80, 'ogórin'],
  [90, 'àádọ́rùn'],
  [100, 'ọgọ́rùn'],

  // 21-29: additive/subtractive from 20/30
  [21, 'ọ̀kan lé lógún'],
  [22, 'èjì lé lógún'],
  [23, 'ẹ̀ta lé lógún'],
  [24, 'ẹ̀rin lé lógún'],
  [25, 'àrùndínlọgbọ̀n'],
  [26, 'ẹ̀rindínlọgbọ̀n'],
  [27, 'ẹ̀tadínlọgbọ̀n'],
  [28, 'èjìdínlọgbọ̀n'],
  [29, 'ọ̀kandínlọgbọ̀n'],

  // 31-39
  [31, 'ọ̀kan lé lọgbọ̀n'],
  [35, 'àrùndínlógójì'],
  [39, 'ọ̀kandínlógójì'],

  // 41-49
  [41, 'ọ̀kan lé lógójì'],
  [45, 'àrùndínláàádọ́ta'],
  [49, 'ọ̀kandínláàádọ́ta'],

  // 51-59
  [51, 'ọ̀kan lé láàádọ́ta'],
  [54, 'ẹ̀rin lé láàádọ́ta'],
  [55, 'àrùndínlógóta'],
  [59, 'ọ̀kandínlógóta'],

  // 61-69
  [61, 'ọ̀kan lé lógóta'],
  [65, 'àrùndínláàádọ́rin'],
  [69, 'ọ̀kandínláàádọ́rin'],

  // 71-79
  [71, 'ọ̀kan lé láàádọ́rin'],
  [75, 'àrùndínlógórin'],
  [79, 'ọ̀kandínlógórin'],

  // 81-89
  [81, 'ọ̀kan lé lógórin'],
  [85, 'àrùndínláàádọ́rùn'],
  [89, 'ọ̀kandínláàádọ́rùn'],

  // 91-99
  [91, 'ọ̀kan lé láàádọ́rùn'],
  [95, 'àrùndínlọ́gọ́rùn'],
  [99, 'ọ̀kandínlọ́gọ́rùn'],

  // Hundreds - special forms
  [200, 'igba'],
  [400, 'irinwó'],

  // Hundreds - regular
  [101, 'ọgọ́rùn ó lé ọ̀kan'],
  [110, 'ọgọ́rùn ó lé ẹ̀wá'],
  [150, 'ọgọ́rùn ó lé àádọ́ta'],
  [300, 'ẹ̀ta ọgọ́rùn'],
  [500, 'àrùn ọgọ́rùn'],
  [999, 'ẹ̀sán ọgọ́rùn ó lé ọ̀kandínlọ́gọ́rùn'],

  // Thousands
  [1000, 'ẹgbẹ̀rún kan'],
  [1001, 'ẹgbẹ̀rún kan, ó lé ọ̀kan'],
  [2000, 'ẹgbẹ̀rún èjì'],
  [10000, 'ẹgbàárùn'],
  [20000, 'ọ̀kẹ́'],

  // Larger numbers
  [1000000, 'mílíọ̀nù kan'],
  [2000000, 'mílíọ̀nù èjì'],

  // Negative numbers
  [-1, 'àìní ọ̀kan'],
  [-42, 'àìní èjì lé lógójì'],

  // Decimals
  ['3.14', 'ẹ̀ta àmì ọ̀kan ẹ̀rin'],
  ['0.5', 'òdo àmì àrùn']
]
