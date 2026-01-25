/**
 * Cardinal number test cases
 * Format: [input, expected_output, options?]
 */
export const cardinal = [
  // Formal/financial numerals (default)
  [0.01, '零點零壹'],
  [0.007, '零點零零柒'],
  [17.42, '壹拾柒點肆貳'],
  [-17.42, '負壹拾柒點肆貳'],
  [-1, '負壹'],
  [-20, '負貳拾'],
  [0, '零'],
  [1, '壹'],
  [2, '貳'],
  [3, '參'],
  [5.5, '伍點伍'],
  [11, '壹拾壹'],
  [100, '壹佰'],
  [200, '貳佰'],
  [101, '壹佰零壹'],
  [199, '壹佰玖拾玖'],
  [999, '玖佰玖拾玖'],
  [1000, '壹仟'],
  [2000, '貳仟'],
  [1001, '壹仟零壹'],
  [1010, '壹仟零壹拾'],
  [1011, '壹仟零壹拾壹'],
  [1104, '壹仟壹佰零肆'],
  [1243, '壹仟貳佰肆拾參'],
  [10_000, '壹萬'],
  [11_000, '壹萬壹仟'],
  [21_000, '貳萬壹仟'],
  [100_000, '壹拾萬'],
  [101_000, '壹拾萬零壹仟'],
  [111_000, '壹拾壹萬壹仟'],
  [1_000_000, '壹佰萬'],
  [1_001_000, '壹佰萬零壹仟'],
  [1_111_000, '壹佰壹拾壹萬壹仟'],
  [100_000_000, '壹億'],
  [101_000_000, '壹億零壹佰萬'],

  // Common/everyday numerals
  [0.01, '零點零一', { formal: false }],
  [0.007, '零點零零七', { formal: false }],
  [17.42, '一十七點四二', { formal: false }],
  [-17.42, '負一十七點四二', { formal: false }],
  [-1, '負一', { formal: false }],
  [-20, '負二十', { formal: false }],
  [0, '零', { formal: false }],
  [1, '一', { formal: false }],
  [2, '二', { formal: false }],
  [3, '三', { formal: false }],
  [5.5, '五點五', { formal: false }],
  [11, '一十一', { formal: false }],
  [100, '一百', { formal: false }],
  [200, '二百', { formal: false }],
  [101, '一百零一', { formal: false }],
  [199, '一百九十九', { formal: false }],
  [999, '九百九十九', { formal: false }],
  [1000, '一千', { formal: false }],
  [2000, '二千', { formal: false }],
  [1001, '一千零一', { formal: false }],
  [1010, '一千零一十', { formal: false }],
  [1011, '一千零一十一', { formal: false }],
  [1104, '一千一百零四', { formal: false }],
  [1243, '一千二百四十三', { formal: false }],
  [10_000, '一萬', { formal: false }],
  [11_000, '一萬一千', { formal: false }],
  [21_000, '二萬一千', { formal: false }],
  [100_000, '一十萬', { formal: false }],
  [101_000, '一十萬零一千', { formal: false }],
  [111_000, '一十一萬一千', { formal: false }],
  [1_000_000, '一百萬', { formal: false }],
  [1_001_000, '一百萬零一千', { formal: false }],
  [1_111_000, '一百一十一萬一千', { formal: false }],
  [100_000_000, '一億', { formal: false }],
  [101_000_000, '一億零一百萬', { formal: false }]
]

/**
 * Ordinal number test cases
 * Format: [input, expected_output, options?]
 */
export const ordinal = [
  // Formal numerals (default)
  [1, '第壹'],
  [2, '第貳'],
  [3, '第參'],
  [10, '第壹拾'],
  [11, '第壹拾壹'],
  [21, '第貳拾壹'],
  [100, '第壹佰'],
  [101, '第壹佰零壹'],
  [1000, '第壹仟'],
  [10000, '第壹萬'],
  [100000000, '第壹億'],

  // Common numerals
  [1, '第一', { formal: false }],
  [2, '第二', { formal: false }],
  [3, '第三', { formal: false }],
  [10, '第一十', { formal: false }],
  [11, '第一十一', { formal: false }],
  [21, '第二十一', { formal: false }],
  [100, '第一百', { formal: false }],
  [101, '第一百零一', { formal: false }],
  [1000, '第一千', { formal: false }],
  [10000, '第一萬', { formal: false }],
  [100000000, '第一億', { formal: false }]
]

/**
 * Currency test cases (New Taiwan Dollar)
 * Format: [input, expected_output, options?]
 */
export const currency = [
  // Formal numerals (default) - standard financial writing
  [0, '零圓整'],
  [1, '壹圓整'],
  [2, '貳圓整'],
  [10, '壹拾圓整'],
  [100, '壹佰圓整'],
  [1000, '壹仟圓整'],

  // Jiao only (1/10 yuan)
  [0.10, '壹角整'],
  [0.20, '貳角整'],
  [0.50, '伍角整'],

  // Fen only (1/100 yuan)
  [0.01, '壹分'],
  [0.02, '貳分'],
  [0.05, '伍分'],

  // Yuan and jiao
  [1.10, '壹圓壹角整'],
  [42.50, '肆拾貳圓伍角整'],

  // Yuan and fen (needs zero placeholder)
  [1.01, '壹圓零壹分'],
  [1.05, '壹圓零伍分'],

  // Yuan, jiao, and fen
  [1.11, '壹圓壹角壹分'],
  [42.56, '肆拾貳圓伍角陸分'],
  [1000.99, '壹仟圓玖角玖分'],

  // Negative amounts
  [-1, '負壹圓整'],
  [-42.50, '負肆拾貳圓伍角整'],

  // Common numerals
  [42.50, '四十二元五角整', { formal: false }],
  [1.01, '一元零一分', { formal: false }],
  [0, '零元整', { formal: false }],

  // Edge cases
  [5.00, '伍圓整'],
  ['5.00', '伍圓整']
]
