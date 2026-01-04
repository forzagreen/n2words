import { TurkicLanguage } from '../classes/turkic-language.js'

/**
 * Azerbaijani language converter.
 *
 * Uses segment-based decomposition for high performance.
 * Supports:
 * - Implicit "bir" (one) omission before hundreds and thousands
 * - Turkic language number patterns
 * - Large numbers up to quintillion
 */
export class Azerbaijani extends TurkicLanguage {
  negativeWord = 'mənfi'
  decimalSeparatorWord = 'nöqtə'
  zeroWord = 'sıfır'

  onesWords = {
    1: 'bir',
    2: 'iki',
    3: 'üç',
    4: 'dörd',
    5: 'beş',
    6: 'altı',
    7: 'yeddi',
    8: 'səkkiz',
    9: 'doqquz'
  }

  teensWords = {
    0: 'on',
    1: 'on bir',
    2: 'on iki',
    3: 'on üç',
    4: 'on dörd',
    5: 'on beş',
    6: 'on altı',
    7: 'on yeddi',
    8: 'on səkkiz',
    9: 'on doqquz'
  }

  tensWords = {
    2: 'iyirmi',
    3: 'otuz',
    4: 'qırx',
    5: 'əlli',
    6: 'altmış',
    7: 'yetmiş',
    8: 'səksən',
    9: 'doxsan'
  }

  hundredWord = 'yüz'
  thousandWord = 'min'

  // Short scale
  scaleWords = ['milyon', 'milyar', 'trilyon', 'katrilyon', 'kentilyon']
}
