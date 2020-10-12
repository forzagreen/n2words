import Num2Word_Base from '../classes/Num2Word.mjs';

export default function() {
  Num2Word_Base.call(this);

  this.gender_stem = 'o';

  this.separator_word = 'punto';
  this.cards = [{'1000000000000000000000000': 'cuatrillón'}, {'1000000000000000000': 'trillón'}, {'1000000000000': 'billón'}, {'1000000': 'millón'}, {'1000': 'mil'}, {'100': 'cien'}, {'90': 'noventa'}, {'80': 'ochenta'}, {'70': 'setenta'}, {'60': 'sesenta'}, {'50': 'cincuenta'}, {'40': 'cuarenta'}, {'30': 'treinta'}, {'29': 'veintinueve'}, {'28': 'veintiocho'}, {'27': 'veintisiete'}, {'26': 'veintiséis'}, {'25': 'veinticinco'}, {'24': 'veinticuatro'}, {'23': 'veintitrés'}, {'22': 'veintidós'}, {'21': 'veintiuno'}, {'20': 'veinte'}, {'19': 'diecinueve'}, {'18': 'dieciocho'}, {'17': 'diecisiete'}, {'16': 'dieciseis'}, {'15': 'quince'}, {'14': 'catorce'}, {'13': 'trece'}, {'12': 'doce'}, {'11': 'once'}, {'10': 'diez'}, {'9': 'nueve'}, {'8': 'ocho'}, {'7': 'siete'}, {'6': 'seis'}, {'5': 'cinco'}, {'4': 'cuatro'}, {'3': 'tres'}, {'2': 'dos'}, {'1': 'uno'}, {'0': 'cero'}];
  this.merge = (curr, next) => {
    let ctext = Object.keys(curr)[0]; const cnum = parseInt(Object.values(curr)[0]);
    let ntext = Object.keys(next)[0]; const nnum = parseInt(Object.values(next)[0]);
    if (cnum == 1) {
      if (nnum < 1000000) return {[ntext]: nnum};
      ctext = 'un';
    } else if (cnum == 100 && nnum % 1000 != 0) {
      ctext += 't' + this.gender_stem;
    }

    if (nnum < cnum) {
      if (cnum < 100) {
        return {[`${ctext} y ${ntext}`]: cnum + nnum};
      }
      return {[`${ctext} ${ntext}`]: cnum + nnum};
    } else if (nnum % 1000000 == 0 && cnum > 1) {
      ntext = ntext.slice(0, -3) + 'lones';
    }

    if (nnum == 100) {
      if (cnum == 5) {
        ctext = 'quinien';
        ntext = '';
      } else if (cnum == 7) {
        ctext = 'sete';
      } else if (cnum == 9) {
        ctext = 'nove';
      }
      ntext += 't' + this.gender_stem + 's';
    } else {
      ntext = ' ' + ntext;
    }
    return {[`${ctext}${ntext}`]: cnum * nnum};
  };
}
