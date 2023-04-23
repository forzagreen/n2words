import N2WordsAbs from '../../classes/N2WordsAbs.mjs';
import {
  ones,
  feminineOnes,
  tens,
  hundreds,
  twos,
  appendedTwos,
  groups,
  appendedGroups,
  pluralGroups,
} from './number_lists.mjs';

export class N2WordsAR extends N2WordsAbs {
  constructor() {
    super();

    this.integerValue = 0;
    this.decimalValue = 0;
    this.negativeWord = 'ناقص';
    this.separatorWord = 'فاصلة';
    this.number = 0;
    this.zero = 'صفر';
    // this.isCurrencyPartNameFeminine = true
    // this.isCurrencyNameFeminine = false
    this.ones = ones;
    this.feminineOnes = feminineOnes;
    this.tens = tens;
    this.hundreds = hundreds;
    this.twos = twos;
    this.appendedTwos = appendedTwos;
    this.groups = groups;
    this.appendedGroups = appendedGroups;
    this.pluralGroups = pluralGroups;
  }

  digitFeminineStatus(digit /* , groupLevel */) {
    // if ((groupLevel == -1 && this.isCurrencyPartNameFeminine) || (groupLevel == 0 && this.isCurrencyNameFeminine)) {
    //   return this.arabicFeminineOnes[parseInt(digit)]
    // }
    return this.ones[parseInt(digit)];
  }

  processArabicGroup(groupNumber, groupLevel, remainingNumber) {
    let tens = groupNumber % 100;
    const hundreds = groupNumber / 100;
    let retVal = '';
    if (parseInt(hundreds) > 0) {
      retVal =
        tens == 0 && parseInt(hundreds) == 2
          ? this.appendedTwos[0]
          : this.hundreds[parseInt(hundreds)];
    }
    if (tens > 0) {
      if (tens < 20) {
        if (tens == 2 && parseInt(hundreds) == 0 && groupLevel > 0) {
          retVal =
            [
              2000, 2000000, 2000000000, 2000000000000, 2000000000000000,
              2000000000000000000,
            ].indexOf(this.integerValue) != -1
              ? this.appendedTwos[parseInt(groupLevel)]
              : this.twos[parseInt(groupLevel)];
        } else {
          if (retVal != '') {
            retVal += ' و ';
          }
          if (tens == 1 && groupLevel > 0 && hundreds == 0) {
            retVal += '';
          } else if (
            (tens == 1 || tens == 2) &&
            (groupLevel == 0 || groupLevel == -1) &&
            hundreds == 0 &&
            remainingNumber == 0
          ) {
            retVal += '';
          } else {
            retVal += this.digitFeminineStatus(parseInt(tens), groupLevel);
          }
        }
      } else {
        const ones = tens % 10;
        tens = tens / 10 - 2;
        if (ones > 0) {
          if (retVal != '' && tens < 4) {
            retVal += ' و ';
          }
          retVal += this.digitFeminineStatus(ones, groupLevel);
        }
        if (retVal != '' && ones != 0) {
          retVal += ' و ';
        }
        retVal += this.tens[parseInt(tens)];
      }
    }
    return retVal;
  }

  toCardinal(number) {
    if (parseInt(number) == 0) {
      return this.zero;
    }
    let tempNumber = number;
    this.integerValue = number;
    let retVal = '';
    let group = 0;
    while (tempNumber > 0) {
      const numberToProcess = parseInt(tempNumber % 1000);
      tempNumber = parseInt(tempNumber / 1000);
      const groupDescription = this.processArabicGroup(
        numberToProcess,
        group,
        Math.floor(tempNumber)
      );
      if (groupDescription != '') {
        if (group > 0) {
          if (retVal != '') {
            retVal = ' و ' + retVal;
          }
          if (numberToProcess != 2) {
            if (numberToProcess % 100 != 1) {
              if (numberToProcess >= 3 && numberToProcess <= 10) {
                retVal = this.pluralGroups[group] + ' ' + retVal;
              } else {
                if (retVal != '') {
                  retVal = this.appendedGroup[group] + ' ' + retVal;
                } else {
                  retVal = this.groups[group] + ' ' + retVal;
                }
              }
            } else {
              retVal = this.groups[group] + ' ' + retVal;
            }
          }
        }
        retVal = groupDescription + ' ' + retVal;
      }
      group += 1;
    }
    return retVal.trim();
  }
}

export default function (n) {
  return new N2WordsAR().floatToCardinal(n);
}
