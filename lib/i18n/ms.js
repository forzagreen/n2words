import AbstractLanguage from '../classes/abstract-language.js'

/**
 * Malay (Bahasa Melayu) language converter.
 *
 * Conventions:
 * - Base-10 structure
 * - "Se-" prefix for singular units (seratus, seribu, sejuta, sebilion, setrilion)
 * - Space-separated components (no conjunction like "dan" for tens/ones)
 * - Grouping by thousands (ribu, juta, bilion, trilion)
 */
export class Malay extends AbstractLanguage {
  negativeWord = 'minus'

  decimalSeparatorWord = 'perpuluhan'

  zeroWord = 'sifar'

  base = {
    0: [],
    1: ['satu'],
    2: ['dua'],
    3: ['tiga'],
    4: ['empat'],
    5: ['lima'],
    6: ['enam'],
    7: ['tujuh'],
    8: ['lapan'],
    9: ['sembilan']
  }

  thousands = {
    3: 'ribu',
    6: 'juta',
    9: 'bilion',
    12: 'trilion'
  }

  splitBy3 (number) {
    const blocks = []
    const stringNumber = number.toString()
    const length = stringNumber.length
    let firstBlock

    if (length < 3) {
      blocks.push([stringNumber])
    } else {
      const firstBlockLength = length % 3

      if (firstBlockLength > 0) {
        firstBlock = [stringNumber.slice(0, firstBlockLength)]
        blocks.push(firstBlock)
      }

      for (let index = firstBlockLength; index < length; index += 3) {
        const nextBlock = [stringNumber.slice(index, index + 3)]
        blocks.push(nextBlock)
      }
    }
    return blocks
  }

  spell (blocks) {
    let wordBlocks = []
    let spelling
    const firstBlock = blocks[0]
    if (firstBlock[0].length === 1) {
      spelling = firstBlock[0] === '0' ? ['sifar'] : this.base[Math.trunc(firstBlock[0])]
    } else if (firstBlock[0].length === 2) {
      spelling = this.getTens(firstBlock[0])
    } else {
      spelling = [...this.getHundreds(firstBlock[0][0]), ...this.getTens(firstBlock[0].slice(1, 3))]
    }
    wordBlocks = [...wordBlocks, [firstBlock[0], spelling]]
    for (let index = 1; index < blocks.length; index++) {
      let block = blocks[index]
      spelling = [...this.getHundreds(block[0][0]), ...this.getTens(block[0].slice(1, 3))]
      block = [...block, spelling]
      wordBlocks = [...wordBlocks, block]
    }
    return wordBlocks
  }

  getHundreds (number) { // 'ratus'
    if (number === '1') {
      return ['seratus']
    } else if (number === '0') {
      return []
    } else {
      return [...this.base[Math.trunc(number)], 'ratus']
    }
  }

  getTens (number) { // 'puluh' and 'belas'
    if (number[0] === '1') {
      if (number[1] === '0') {
        return ['sepuluh']
      } else if (number[1] === '1') {
        return ['sebelas']
      }
      return [...this.base[Math.trunc(number[1])], 'belas']
    }

    if (number[0] === '0') {
      return this.base[Math.trunc(number[1])]
    }

    return [...this.base[Math.trunc(number[0])], 'puluh', ...this.base[Math.trunc(number[1])]]
  }

  join (wordBlocks) {
    const wordList = []
    const length = wordBlocks.length - 1

    for (let index = 0; index <= length; index++) {
      const words = wordBlocks[index][1]
      const isLast = index === length
      const scaleWord = isLast ? null : this.thousands[(length - index) * 3]

      if (!isLast && words.length === 1 && words[0] === 'satu') {
        // Use se- prefix for singular scale units: seribu, sejuta, sebilion, setrilion
        wordList.push('se' + scaleWord)
        continue
      }

      // Add current block words
      for (const w of words) wordList.push(w)

      // Append scale word if applicable and current block contributed words
      if (!isLast && words.length > 0) {
        wordList.push(scaleWord)
      }
    }

    return wordList.join(' ')
  }

  convertWholePart (number) {
    return this.join(
      this.spell(
        this.splitBy3(number)
      )
    ).trim()
  }
}

export default function convertToWords (value, options = {}) {
  return new Malay(options).convertToWords(value)
}


