import SouthAsianLanguage from '../classes/south-asian-language.js'

/**
 * Marathi language implementation
 * Extends SouthAsianLanguage for Indian-style grouping
 */
class MarathiLanguage extends SouthAsianLanguage {
  negativeWord = 'उणे'
  decimalSeparatorWord = 'दशांश'
  zeroWord = 'शून्य'
  hundredWord = 'शंभर'
  convertDecimalsPerDigit = true

  belowHundred = [
    'शून्य',
    'एक',
    'दोन',
    'तीन',
    'चार',
    'पाच',
    'सहा',
    'सात',
    'आठ',
    'नऊ',
    'दहा',
    'अकरा',
    'बारा',
    'तेरा',
    'चौदा',
    'पंधरा',
    'सोळा',
    'सतरा',
    'अठरा',
    'एकोणीस',
    'वीस',
    'एकवीस',
    'बावीस',
    'तेवीस',
    'चोवीस',
    'पंचवीस',
    'सव्वीस',
    'सत्तावीस',
    'अठ्ठावीस',
    'एकोणतीस',
    'तीस',
    'एकतीस',
    'बत्तीस',
    'तेहेतीस',
    'चौतीस',
    'पस्तीस',
    'छत्तीस',
    'सदतीस',
    'अडतीस',
    'एकोणचाळीस',
    'चाळीस',
    'एकेचाळीस',
    'बेचाळीस',
    'त्रेचाळीस',
    'चव्वेचाळीस',
    'पंचेचाळीस',
    'सेहेचाळीस',
    'सत्तेचाळीस',
    'अठ्ठेचाळीस',
    'एकोणपन्नास',
    'पन्नास',
    'एक्काव्वन',
    'बावन्न',
    'त्रेपन्न',
    'चोपन्न',
    'पंचाव्वन',
    'छप्पन्न',
    'सत्तावन्न',
    'अठ्ठावन्न',
    'एकोणसाठ',
    'साठ',
    'एकसष्ठ',
    'बासष्ठ',
    'त्रेसष्ठ',
    'चौसष्ठ',
    'पासष्ठ',
    'सहासष्ठ',
    'सदुसष्ठ',
    'अडुसष्ठ',
    'एकोणसत्तर',
    'सत्तर',
    'एकाहत्तर',
    'बाहत्तर',
    'त्र्याहत्तर',
    'चौऱ्याहत्तर',
    'पंच्याहत्तर',
    'शहात्तर',
    'सत्याहत्तर',
    'अठ्ठ्याहत्तर',
    'एकोणऐंशी',
    'ऐंशी',
    'एक्याऐंशी',
    'ब्याऐंशी',
    'त्र्याऐंशी',
    'चौऱ्याऐंशी',
    'पंच्याऐंशी',
    'शहाऐंशी',
    'सत्याऐंशी',
    'अठ्ठ्याऐंशी',
    'एकोणनव्वद',
    'नव्वद',
    'एक्याण्णव',
    'ब्याण्णव',
    'त्र्याण्णव',
    'चौऱ्याण्णव',
    'पंच्याण्णव',
    'शहाण्णव',
    'सत्याण्णव',
    'अठ्ठ्याण्णव',
    'नव्याण्णव'
  ]

  scaleWords = [
    '',
    'हजार',
    'लाख',
    'कोटी',
    'अब्ज',
    'खर्व',
    'निखर्व',
    'महापद्म',
    'शंकू'
  ]
}

/**
 * Converts a number to Marathi cardinal (written) form.
 *
 * @param {number|string|bigint} value The number to convert.
 * @param {Object} [options={}] Configuration options.
 * @returns {string} The number expressed in Marathi words.
 * @throws {TypeError} If value is an invalid type.
 * @throws {Error} If value is NaN or an invalid number string.
 * @example
 * convertToWords(42); // 'बेचाळीस'
 * convertToWords(1000); // 'एक हजार'
 * convertToWords(100000); // 'एक लाख'
 */
export default function convertToWords (value, options = {}) {
  return new MarathiLanguage(options).convertToWords(value)
}
