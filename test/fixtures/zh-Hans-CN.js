/**
 * Cardinal number test cases
 * Format: [input, expected_output, options?]
 */
export const cardinal = [
  // Formal/financial numerals (default)
  [0.01, '零点零壹'],
  [0.007, '零点零零柒'],
  [17.42, '壹拾柒点肆贰'],
  [-17.42, '负壹拾柒点肆贰'],
  [-1, '负壹'],
  [-20, '负贰拾'],
  [0, '零'],
  [1, '壹'],
  [2, '贰'],
  [3, '叁'],
  [5.5, '伍点伍'],
  [11, '壹拾壹'],
  [100, '壹佰'],
  [200, '贰佰'],
  [101, '壹佰零壹'],
  [199, '壹佰玖拾玖'],
  [999, '玖佰玖拾玖'],
  [1000, '壹仟'],
  [2000, '贰仟'],
  [1001, '壹仟零壹'],
  [1010, '壹仟零壹拾'],
  [1011, '壹仟零壹拾壹'],
  [1104, '壹仟壹佰零肆'],
  [1243, '壹仟贰佰肆拾叁'],
  [10_000, '壹万'],
  [20_000, '贰万'],
  [10_001, '壹万零壹'],
  [10_010, '壹万零壹拾'],
  [30_210, '叁万零贰佰壹拾'],
  [200_000, '贰拾万'],
  [2_000_000, '贰佰万'],
  [20_000_000, '贰仟万'],
  [200_000_000, '贰亿'],
  [2_000_000_000, '贰拾亿'],
  [20_000_000_000, '贰佰亿'],
  [22_222_222_222, '贰佰贰拾贰亿贰仟贰佰贰拾贰万贰仟贰佰贰拾贰'],
  [
    222_222_222_222_222,
    '贰佰贰拾贰万贰仟贰佰贰拾贰亿贰仟贰佰贰拾贰万贰仟贰佰贰拾贰'
  ],

  // Common/everyday numerals (explicit opt-out)
  [123, '一百二十三', { formal: false }],
  [999_999_999_999n, '九千九百九十九亿九千九百九十九万九千九百九十九', { formal: false }],
  [0, '零', { formal: false }],
  [1, '一', { formal: false }],
  [10, '一十', { formal: false }],
  [11, '一十一', { formal: false }],
  [20, '二十', { formal: false }],
  [21, '二十一', { formal: false }],
  [99, '九十九', { formal: false }],
  [101, '一百零一', { formal: false }],
  [110, '一百一十', { formal: false }],
  [111, '一百一十一', { formal: false }],
  [1000, '一千', { formal: false }],
  [1001, '一千零一', { formal: false }],
  [1010, '一千零一十', { formal: false }],
  [1011, '一千零一十一', { formal: false }],
  [1104, '一千一百零四', { formal: false }],
  [1243, '一千二百四十三', { formal: false }],
  [10_000, '一万', { formal: false }],
  [20_000, '二万', { formal: false }],
  [10_001, '一万零一', { formal: false }],
  [10_010, '一万零一十', { formal: false }],
  [30_210, '三万零二百一十', { formal: false }],
  [200_000, '二十万', { formal: false }],
  [2_000_000, '二百万', { formal: false }],
  [20_000_000, '二千万', { formal: false }],
  [200_000_000, '二亿', { formal: false }],
  [2_000_000_000, '二十亿', { formal: false }],
  [20_000_000_000, '二百亿', { formal: false }],
  [22_222_222_222, '二百二十二亿二千二百二十二万二千二百二十二', { formal: false }],
  [
    222_222_222_222_222,
    '二百二十二万二千二百二十二亿二千二百二十二万二千二百二十二',
    { formal: false }
  ],
  [5.5, '五点五', { formal: false }],
  [0.007, '零点零零七', { formal: false }],
  [17.42, '一十七点四二', { formal: false }],
  [-17.42, '负一十七点四二', { formal: false }]
]

/**
 * Ordinal number test cases
 * Format: [input, expected_output, options?]
 */
export const ordinal = [
  // Formal numerals (default)
  [1, '第壹'],
  [2, '第贰'],
  [3, '第叁'],
  [10, '第壹拾'],
  [11, '第壹拾壹'],
  [21, '第贰拾壹'],
  [100, '第壹佰'],
  [101, '第壹佰零壹'],
  [1000, '第壹仟'],
  [10000, '第壹万'],
  [100000000, '第壹亿'],

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
  [10000, '第一万', { formal: false }],
  [100000000, '第一亿', { formal: false }]
]

/**
 * Currency test cases (Chinese Yuan / Renminbi)
 * Format: [input, expected_output, options?]
 */
export const currency = [
  // Formal numerals (default) - standard financial writing
  [0, '零圆整'],
  [1, '壹圆整'],
  [2, '贰圆整'],
  [10, '壹拾圆整'],
  [100, '壹佰圆整'],
  [1000, '壹仟圆整'],

  // Jiao only (1/10 yuan)
  [0.10, '壹角整'],
  [0.20, '贰角整'],
  [0.50, '伍角整'],

  // Fen only (1/100 yuan)
  [0.01, '壹分'],
  [0.02, '贰分'],
  [0.05, '伍分'],

  // Yuan and jiao
  [1.10, '壹圆壹角整'],
  [42.50, '肆拾贰圆伍角整'],

  // Yuan and fen (needs zero placeholder)
  [1.01, '壹圆零壹分'],
  [1.05, '壹圆零伍分'],

  // Yuan, jiao, and fen
  [1.11, '壹圆壹角壹分'],
  [42.56, '肆拾贰圆伍角陆分'],
  [1000.99, '壹仟圆玖角玖分'],

  // Negative amounts
  [-1, '负壹圆整'],
  [-42.50, '负肆拾贰圆伍角整'],

  // Common numerals
  [42.50, '四十二元五角整', { formal: false }],
  [1.01, '一元零一分', { formal: false }],
  [0, '零元整', { formal: false }],

  // Edge cases
  [5.00, '伍圆整'],
  ['5.00', '伍圆整']
]
