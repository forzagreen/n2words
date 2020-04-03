import Num2Word_Base from '../classes/Num2Word.mjs';

export default function() {
  Num2Word_Base.call(this);
  
  this.cards = [{ '1000000000000000000000000000': 'quadriljard' }, { '1000000000000000000000000': 'quadriljoen' }, { '1000000000000000000000': 'triljard' }, { '1000000000000000000': 'triljoen' }, { '1000000000000000': 'biljard' }, { '1000000000000': 'biljoen' }, { '1000000000': 'miljard' }, { '1000000': 'miljoen' }, { '1000': 'duizend' }, { '100': 'honderd' }, { '90': 'negentig' }, { '80': 'tachtig' }, { '70': 'zeventig' }, { '60': 'zestig' }, { '50': 'vijftig' }, { '40': 'veertig' }, { '30': 'dertig' }, { '20': 'twintig' }, { '19': 'negentien' }, { '18': 'achtien' }, { '17': 'zeventien' }, { '16': 'zestien' }, { '15': 'vijftien' }, { '14': 'veertien' }, { '13': 'dertien' }, { '12': 'twaalf' }, { '11': 'elf' }, { '10': 'tien' }, { '9': 'negen' }, { '8': 'acht' }, { '7': 'zeven' }, { '6': 'zes' }, { '5': 'vijf' }, { '4': 'vier' }, { '3': 'drie' }, { '2': 'twee' }, { '1': 'een' }, { '0': 'nul' }];
  this.merge = (curr, next) => {
    var ctext = Object.keys(curr)[0], cnum = parseInt(Object.values(curr)[0]);
    var ntext = Object.keys(next)[0], nnum = parseInt(Object.values(next)[0]);
    if (cnum == 1) {
      if (nnum < 1000000) {
        return { [ntext]: nnum };
      }
      ctext = 'een';
    }
  
    var val = 0;
    if (nnum > cnum) {
      if (nnum >= 1000000) {
        ctext += ' ';
      }
      else if(nnum > 100) {
        ntext += ' ';
      }
      val = cnum * nnum;
  
    } else {
      if (nnum < 10 && 10 < cnum && cnum < 100) {
        var temp = ntext;
        ntext = ctext;
        ctext = `${temp}en`;
      } else if(nnum < 13 && cnum < 1000) {
        ctext = `${ctext}en`;
      } else if(nnum < 13 && cnum >= 1000 ) {
        ntext = ` en ${ntext}`;
      } else if (cnum >= 1000000) {
       ctext += ' ';
      } else {
        if(cnum === 1000) {
          ctext +=' '
        }
      }
      val = cnum + nnum;
    }
    return { [`${ctext}${ntext}`]: val };
  };
}
