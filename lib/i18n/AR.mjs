export default function() {
  this.integer_value = 0;
  this._decimalValue = 0;
  this.number = 0;
  this.ZERO = 'صفر';
  // this.isCurrencyPartNameFeminine = true
  // this.isCurrencyNameFeminine = false
  this.arabicOnes = [
    '', 'واحد', 'اثنان', 'ثلاثة', 'أربعة', 'خمسة', 'ستة', 'سبعة', 'ثمانية',
    'تسعة',
    'عشرة', 'أحد عشر', 'اثنا عشر', 'ثلاثة عشر', 'أربعة عشر', 'خمسة عشر',
    'ستة عشر', 'سبعة عشر', 'ثمانية عشر',
    'تسعة عشر',
  ];
  this.arabicFeminineOnes = [
    '', 'إحدى', 'اثنتان', 'ثلاث', 'أربع', 'خمس', 'ست', 'سبع', 'ثمان',
    'تسع',
    'عشر', 'إحدى عشرة', 'اثنتا عشرة', 'ثلاث عشرة', 'أربع عشرة',
    'خمس عشرة', 'ست عشرة', 'سبع عشرة', 'ثماني عشرة',
    'تسع عشرة',
  ];
  this.arabicTens = ['عشرون', 'ثلاثون', 'أربعون', 'خمسون', 'ستون', 'سبعون', 'ثمانون', 'تسعون'];
  this.arabicHundreds = ['', 'مائة', 'مئتان', 'ثلاثمائة', 'أربعمائة', 'خمسمائة', 'ستمائة', 'سبعمائة', 'ثمانمائة', 'تسعمائة'];
  this.arabicAppendedTwos = ['مئتا', 'ألفا', 'مليونا', 'مليارا', 'تريليونا', 'كوادريليونا', 'كوينتليونا', 'سكستيليونا'];
  this.arabicTwos = ['مئتان', 'ألفان', 'مليونان', 'ملياران', 'تريليونان', 'كوادريليونان', 'كوينتليونان', 'سكستيليونان'];
  this.arabicGroup = ['مائة', 'ألف', 'مليون', 'مليار', 'تريليون', 'كوادريليون', 'كوينتليون', 'سكستيليون'];
  this.arabicAppendedGroup = ['', 'ألفاً', 'مليوناً', 'ملياراً', 'تريليوناً', 'كوادريليوناً', 'كوينتليوناً', 'سكستيليوناً'];
  this.arabicPluralGroups = ['', 'آلاف', 'ملايين', 'مليارات', 'تريليونات', 'كوادريليونات', 'كوينتليونات', 'سكستيليونات'];
  this.digit_feminine_status = (digit/* , group_level */) => {
    // if ((group_level == -1 && this.isCurrencyPartNameFeminine) || (group_level == 0 && this.isCurrencyNameFeminine)) {
    //   return this.arabicFeminineOnes[parseInt(digit)]
    // }
    return this.arabicOnes[parseInt(digit)];
  };
  this.process_arabic_group = (group_number, group_level, remaining_number) => {
    let tens = group_number % 100;
    const hundreds = group_number / 100;
    let ret_val = '';
    if (parseInt(hundreds) > 0) {
      ret_val = (tens == 0 && parseInt(hundreds) == 2) ? this.arabicAppendedTwos[0] : this.arabicHundreds[parseInt(hundreds)];
    }
    if (tens > 0) {
      if (tens < 20) {
        if (tens == 2 && parseInt(hundreds) == 0 && group_level > 0) {
          ret_val = ([2000, 2000000, 2000000000, 2000000000000, 2000000000000000, 2000000000000000000].indexOf(this.integer_value) != -1) ? this.arabicAppendedTwos[parseInt(group_level)] : this.arabicTwos[parseInt(group_level)];
        } else {
          if (ret_val != '') {
            ret_val += ' و ';
          }
          if (tens == 1 && group_level > 0 && hundreds == 0) {
            ret_val += '';
          } else if ((tens == 1 || tens == 2) && (group_level == 0 || group_level == -1) && (hundreds == 0 && remaining_number == 0)) {
            ret_val += '';
          } else {
            ret_val += this.digit_feminine_status(parseInt(tens), group_level);
          }
        }
      } else {
        const ones = tens % 10;
        tens = (tens / 10) - 2;
        if (ones > 0) {
          if (ret_val != '' && tens < 4) {
            ret_val += ' و ';
          }
          ret_val += this.digit_feminine_status(ones, group_level);
        }
        if (ret_val != '' && ones != 0) {
          ret_val += ' و ';
        }
        ret_val += this.arabicTens[parseInt(tens)];
      }
    }
    return ret_val;
  };

  this.toCardinal = (number) => {
    if (parseInt(number) == 0) {
      return this.ZERO;
    }
    let temp_number = number;
    this.integer_value = number;
    let ret_val = '';
    let group = 0;
    while (temp_number > 0) {
      const number_to_process = parseInt(temp_number % 1000);
      temp_number = parseInt(temp_number / 1000);
      const group_description = this.process_arabic_group(number_to_process, group, Math.floor(temp_number));
      if (group_description != '') {
        if (group > 0) {
          if (ret_val != '') {
            ret_val = ' و ' + ret_val;
          }
          if (number_to_process != 2) {
            if (number_to_process % 100 != 1) {
              if (number_to_process >= 3 && number_to_process <= 10) {
                ret_val = this.arabicPluralGroups[group] + ' ' + ret_val;
              } else {
                if (ret_val != '') {
                  ret_val = this.arabicAppendedGroup[group] + ' ' + ret_val;
                } else {
                  ret_val = this.arabicGroup[group] + ' ' + ret_val;
                }
              }
            } else {
              ret_val = this.arabicGroup[group] + ' ' + ret_val;
            }
          }
        }
        ret_val = group_description + ' ' + ret_val;
      }
      group += 1;
    }
    return ret_val.trim();
  };
}
