import { SimplifiedChinese } from './zh-Hans.js'

/**
 * Traditional Chinese language converter.
 *
 * Inherits from SimplifiedChinese with Traditional character variants.
 * Supports:
 * - Traditional Chinese characters (繁體中文)
 * - No word separators (concatenated format)
 * - Formal (financial) vs common numerals
 * - Zero insertion for skipped positions
 *
 * Differences from Simplified:
 * - Different character forms (e.g., 負/负, 點/点, 億/亿, 萬/万)
 * - Some formal numerals differ (參/叁, 貳/贰, 陸/陆)
 */
export class TraditionalChinese extends SimplifiedChinese {
  negativeWord = '負'
  decimalSeparatorWord = '點'
  zeroWord = '零'

  // Common (everyday) numerals - Traditional forms
  onesWordsCommon = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九']
  tenWordCommon = '十'
  hundredWordCommon = '百'
  thousandWordCommon = '千'

  // Formal (financial) numerals - Traditional forms
  onesWordsFormal = ['零', '壹', '貳', '參', '肆', '伍', '陸', '柒', '捌', '玖']
  tenWordFormal = '拾'
  hundredWordFormal = '佰'
  thousandWordFormal = '仟'

  // Scale words - Traditional forms
  wanWord = '萬' // 10,000
  yiWord = '億' // 100,000,000
}
