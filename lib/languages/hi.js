import { SouthAsianLanguage } from '../classes/south-asian-language.js'

/**
 * @typedef {Object} HindiOptions
 * @property {boolean} [feminine=false] Currently unused in Hindi.
 */

/**
 * Hindi language converter.
 *
 * Implements Hindi number words using South Asian grouping patterns:
 * - Devanagari script numerals (एक, दो, तीन, चार...)
 * - Indian-style digit grouping: 3 digits on right, then 2-2 from right
 * - Traditional Hindi number scales (हज़ार, लाख, करोड़, अरब...)
 * - Complete number words for 0-99 in belowHundred array
 *
 * Grouping examples:
 * - 12,34,567 → "बारह लाख चौंतीस हज़ार पाँच सौ सड़सठ"
 * - 1,23,45,678 → "एक करोड़ तेईस लाख पैंतालीस हज़ार छह सौ अठहत्तर"
 *
 * Inherits from SouthAsianLanguage for Indian-style number grouping algorithms.
 */
export class Hindi extends SouthAsianLanguage {
  negativeWord = 'माइनस'
  decimalSeparatorWord = 'दशमलव'
  zeroWord = 'शून्य'
  hundredWord = 'सौ'

  belowHundred = [
    'शून्य',
    'एक',
    'दो',
    'तीन',
    'चार',
    'पाँच',
    'छह',
    'सात',
    'आठ',
    'नौ',
    'दस',
    'ग्यारह',
    'बारह',
    'तेरह',
    'चौदह',
    'पंद्रह',
    'सोलह',
    'सत्रह',
    'अठारह',
    'उन्नीस',
    'बीस',
    'इक्कीस',
    'बाईस',
    'तेईस',
    'चौबीस',
    'पच्चीस',
    'छब्बीस',
    'सत्ताईस',
    'अट्ठाईस',
    'उनतीस',
    'तीस',
    'इकतीस',
    'बत्तीस',
    'तैंतीस',
    'चौंतीस',
    'पैंतीस',
    'छत्तीस',
    'सैंतीस',
    'अड़तीस',
    'उनतालीस',
    'चालीस',
    'इकतालीस',
    'बयालीस',
    'तेतालीस',
    'चवालीस',
    'पैंतालीस',
    'छियालीस',
    'सैंतालीस',
    'अड़तालीस',
    'उनचास',
    'पचास',
    'इक्यावन',
    'बावन',
    'तिरपन',
    'चौवन',
    'पचपन',
    'छप्पन',
    'सत्तावन',
    'अट्ठावन',
    'उनसठ',
    'साठ',
    'इकसठ',
    'बासठ',
    'तिरसठ',
    'चौंसठ',
    'पैंसठ',
    'छियासठ',
    'सड़सठ',
    'अड़सठ',
    'उनहत्तर',
    'सत्तर',
    'इकहत्तर',
    'बहत्तर',
    'तिहत्तर',
    'चौहत्तर',
    'पचहत्तर',
    'छिहत्तर',
    'सतहत्तर',
    'अठहत्तर',
    'उन्यासी',
    'अस्सी',
    'इक्यासी',
    'बयासी',
    'तिरासी',
    'चौरासी',
    'पचासी',
    'छियासी',
    'सत्तासी',
    'अट्ठासी',
    'नवासी',
    'नब्बे',
    'इक्यानवे',
    'बानवे',
    'तिरानवे',
    'चौरानवे',
    'पचानवे',
    'छियानवे',
    'सत्तानवे',
    'अट्ठानवे',
    'निन्यानवे'
  ]

  scaleWords = [
    '',
    'हज़ार',
    'लाख',
    'करोड़',
    'अरब',
    'खरब',
    'नील',
    'पद्म',
    'शंख'
  ]
}
