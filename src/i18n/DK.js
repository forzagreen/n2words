import Num2Word_Base from '../classes/Num2Word';

export default function() {
    Num2Word_Base.call(this);
    this.ordflag = false
    this.cards = [{"1000000000000000000000000000": 'quadrillarder'}, {"1000000000000000000000000": 'quadrillioner'}, {"1000000000000000000000": 'trillarder'}, {"1000000000000000000": 'trillioner'}, {"1000000000000000": 'billarder'}, {"1000000000000": 'billioner'}, {"1000000000": 'millarder'}, {"1000000": 'millioner'}, {"1000": 'tusind'}, {"100": 'hundrede'}, {"90": 'halvfems'}, {"80": 'firs'}, {"70": 'halvfjerds'}, {"60": 'treds'}, {"50": 'halvtreds'}, {"40": 'fyrre'}, {"30": 'tredive'}, {"20": 'tyve'}, {"19": 'nitten'}, {"18": 'atten'}, {"17": 'sytten'}, {"16": 'seksten'}, {"15": 'femten'}, {"14": 'fjorten'}, {"13": 'tretten'}, {"12": 'tolv'}, {"11": 'elleve'}, {"10": 'ti'}, {"9": 'ni'}, {"8": 'otte'}, {"7": 'syv'}, {"6": 'seks'}, {"5": 'fem'}, {"4": 'fire'}, {"3": 'tre'}, {"2": 'to'}, {"1": 'et'}, {"0": 'nul'}]
    this.merge = (curr, next) => {
      var ctext = Object.keys(curr)[0], cnum = parseInt(Object.values(curr)[0])
      var ntext = Object.keys(next)[0], nnum = parseInt(Object.values(next)[0])
      var val = 1
      if (nnum == 100 || nnum == 1000) { next = { [`et${ntext}`]: nnum } }
      if (cnum == 1) {
        if (nnum < 1000000 || this.ordflag) { return next }
        ctext = "en"
      }
      if (nnum > cnum) {
        if (nnum >= 1000000) { ctext += " " }
        val = cnum * nnum
      } else {
        if (cnum >= 100 && cnum < 1000) {
          ctext += " og "
        } else if (cnum >= 1000 && cnum <= 100000) {
          ctext += "e og "
        }
        if ((nnum < 10) && (10 < cnum) && (cnum < 100)) {
          if (nnum == 1) { ntext = "en" }
          var temp = ntext
          ntext = ctext
          ctext = temp + "og"
        } else if (cnum >= 1000000) { ctext += " " }
        val = cnum + nnum
      }
      var word = ctext + ntext
      return { [`${word}`]: val }
    }
  }