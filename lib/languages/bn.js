import { SouthAsianLanguage } from '../classes/south-asian-language.js'

/**
 * @typedef {Object} BengaliOptions
 * @property {boolean} [feminine=false] Currently unused in Bengali.
 */

/**
 * Bengali language converter.
 *
 * Implements Bengali number words using South Asian grouping patterns:
 * - Bengali script numerals (এক, দুই, তিন, চার...)
 * - Indian-style digit grouping: 3 digits on right, then 2-2 from right
 * - Traditional Bengali number scales (হাজার, লাখ, কোটি, আরব...)
 * - Complete number words for 0-99 in belowHundred array
 *
 * Grouping examples:
 * - 12,34,567 → "বারো লাখ চৌত্রিশ হাজার পাঁচ শত সাতষট্টি"
 * - 1,23,45,678 → "এক কোটি তেইশ লাখ পঁয়তাল্লিশ হাজার ছয় শত আটাত্তর"
 *
 * Inherits from SouthAsianLanguage for Indian-style number grouping algorithms.
 */
export class Bengali extends SouthAsianLanguage {
  negativeWord = 'মাইনাস'
  decimalSeparatorWord = 'দশমিক'
  zeroWord = 'শূন্য'
  hundredWord = 'শত'

  belowHundred = [
    'শূন্য',
    'এক',
    'দুই',
    'তিন',
    'চার',
    'পাঁচ',
    'ছয়',
    'সাত',
    'আট',
    'নয়',
    'দশ',
    'এগারো',
    'বারো',
    'তেরো',
    'চৌদ্দ',
    'পনেরো',
    'ষোল',
    'সতেরো',
    'আঠারো',
    'উনিশ',
    'বিশ',
    'একুশ',
    'বাইশ',
    'তেইশ',
    'চব্বিশ',
    'পঁচিশ',
    'ছাব্বিশ',
    'সাতাশ',
    'আঠাশ',
    'উনত্রিশ',
    'ত্রিশ',
    'একত্রিশ',
    'বত্রিশ',
    'তেত্রিশ',
    'চৌত্রিশ',
    'পঁয়ত্রিশ',
    'ছত্রিশ',
    'সাঁইত্রিশ',
    'আটত্রিশ',
    'উনচল্লিশ',
    'চল্লিশ',
    'একচল্লিশ',
    'বেয়াল্লিশ',
    'তেতাল্লিশ',
    'চুয়াল্লিশ',
    'পঁয়তাল্লিশ',
    'ছেচল্লিশ',
    'সাতচল্লিশ',
    'আটচল্লিশ',
    'উনপঞ্চাশ',
    'পঞ্চাশ',
    'একান্ন',
    'বাহান্ন',
    'তিপ্পান্ন',
    'চুয়ান্ন',
    'পঞ্চান্ন',
    'ছাপ্পান্ন',
    'সাতান্ন',
    'আটান্ন',
    'উনষাট',
    'ষাট',
    'একষট্টি',
    'বাষট্টি',
    'তেষট্টি',
    'চৌষট্টি',
    'পঁয়ষট্টি',
    'ছেষট্টি',
    'সাতষট্টি',
    'আটষট্টি',
    'ঊনসত্তর',
    'সত্তর',
    'একাত্তর',
    'বাহাত্তর',
    'তেহাত্তর',
    'চুয়াত্তর',
    'পঁচাত্তর',
    'ছিয়াত্তর',
    'সাতাত্তর',
    'আটাত্তর',
    'উনআশি',
    'আশি',
    'একাশি',
    'বিরাশি',
    'তিরাশি',
    'চুরাশি',
    'পঁচাশি',
    'ছিয়াশি',
    'সাতাশি',
    'আটাশি',
    'উননব্বই',
    'নব্বই',
    'একানব্বই',
    'বিরানব্বই',
    'তিরানব্বই',
    'চুরানব্বই',
    'পঁচানব্বই',
    'ছিয়ানব্বই',
    'সাতানব্বই',
    'আটানব্বই',
    'নিরানব্বই'
  ]

  scaleWords = [
    '',
    'হাজার',
    'লাখ',
    'কোটি',
    'আরব',
    'খরব',
    'নীল',
    'পদ্ম',
    'শঙ্খ'
  ]
}
