import Num2Word_Base from '../classes/Num2Word';

export default function() {
  Num2Word_Base.call(this);
  this.cards = [{'1000000000000000000000000000': 'octillion'}, {'1000000000000000000000000': 'septillion'}, {'1000000000000000000000': 'sextillion'}, {'1000000000000000000': 'quintillion'}, { '1000000000000000': 'quadrillion' }, { '1000000000000': 'trillion' }, { '1000000000': 'billion' }, { '1000000': 'million' }, { '1000': 'thousand' }, { '100': 'hundred' }, { '90': 'ninety' }, { '80': 'eighty' }, { '70': 'seventy' }, { '60': 'sixty' }, { '50': 'fifty' }, { '40': 'forty' }, { '30': 'thirty' }, { '20': 'twenty' }, { '19': 'nineteen' }, { '18': 'eighteen' }, { '17': 'seventeen' }, { '16': 'sixteen' }, { '15': 'fifteen' }, { '14': 'fourteen' }, { '13': 'thirteen' }, { '12': 'twelve' }, { '11': 'eleven' }, { '10': 'ten' }, { '9': 'nine' }, { '8': 'eight' }, { '7': 'seven' }, { '6': 'six' }, { '5': 'five' }, { '4': 'four' }, { '3': 'three' }, { '2': 'two' }, { '1': 'one' }, { '0': 'zero' }];
  this.merge = (lpair, rpair) => { //{'one':1}, {'hundred':100}
    var ltext = Object.keys(lpair)[0], lnum = parseInt(Object.values(lpair)[0]);
    var rtext = Object.keys(rpair)[0], rnum = parseInt(Object.values(rpair)[0]);
    if (lnum == 1 && rnum < 100) return { [rtext]: rnum };
    else if (100 > lnum && lnum > rnum) return { [`${ltext}-${rtext}`]: lnum + rnum };
    else if (lnum >= 100 && 100 > rnum) return { [`${ltext} and ${rtext}`]: lnum + rnum };
    else if (rnum > lnum) return { [`${ltext} ${rtext}`]: lnum * rnum };
    return { [`${ltext} ${rtext}`]: lnum + rnum };
  };
}