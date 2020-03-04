import Num2Word_Base from './Num2Word_Base';

export default function Num2Word_DE() {
    Num2Word_Base.call(this);
  
    this.cards = [{ "1000000000000000000000000000": 'Quadrilliarde' }, { "1000000000000000000000000": 'Quadrillion' }, { "1000000000000000000000": 'Trilliarde' }, { "1000000000000000000": 'Trillion' }, { "1000000000000000": 'Billiarde' }, { "1000000000000": 'Billion' }, { "1000000000": 'Milliarde' }, { "1000000": 'Million' }, { "1000": 'tausend' }, { "100": 'hundert' }, { "90": 'neunzig' }, { "80": 'achtzig' }, { "70": 'siebzig' }, { "60": 'sechzig' }, { "50": 'fünfzig' }, { "40": 'vierzig' }, { "30": 'dreißig' }, { "20": 'zwanzig' }, { "19": 'neunzehn' }, { "18": 'achtzehn' }, { "17": 'siebzehn' }, { "16": 'sechzehn' }, { "15": 'fünfzehn' }, { "14": 'vierzehn' }, { "13": 'dreizehn' }, { "12": 'zwölf' }, { "11": 'elf' }, { "10": 'zehn' }, { "9": 'neun' }, { "8": 'acht' }, { "7": 'sieben' }, { "6": 'sechs' }, { "5": 'fünf' }, { "4": 'vier' }, { "3": 'drei' }, { "2": 'zwei' }, { "1": 'eins' }, { "0": 'null' }]
    this.merge = (curr, next) => {
      var ctext = Object.keys(curr)[0], cnum = parseInt(Object.values(curr)[0])
      var ntext = Object.keys(next)[0], nnum = parseInt(Object.values(next)[0])
      if (cnum == 1) {
        if (nnum == 100 || nnum == 1000) {
          return { [`ein${ntext}`]: nnum }
        }
        else if (nnum < 1000000) {
          return { [ntext]: nnum }
        }
        ctext = "eine"
      }
  
      var val = 0;
      if (nnum > cnum) {
        if (nnum >= 1000000) {
          if (cnum > 1) {
            if (ntext[ntext.length - 1] == "e") {
              ntext += "n"
            } else {
              ntext += "en"
            }
          }
          ctext += " "
        }
        val = cnum * nnum
  
      } else {
        if (nnum < 10 && 10 < cnum && cnum < 100) {
          if (nnum == 1) {
            ntext = "ein"
          }
          var temp = ntext
          ntext = ctext
          ctext = `${temp}und`
        } else if (cnum >= 1000000) {
          ctext += " "
        }
        val = cnum + nnum
      }
  
      return { [`${ctext}${ntext}`]: val }
    }
}