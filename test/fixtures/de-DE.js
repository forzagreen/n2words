/**
 * Cardinal number test cases
 * Format: [input, expected_output, options?]
 */
export const cardinal = [
  [0.01, 'null komma null eins'],
  [1.007, 'eins komma null null sieben'],
  [1.7, 'eins komma sieben'],
  [17.42, 'siebzehn komma zweiundvierzig'],
  [27.312, 'siebenundzwanzig komma dreihundertzwölf'],
  [53.486, 'dreiundfünfzig komma vierhundertsechsundachtzig'],
  [300.42, 'dreihundert komma zweiundvierzig'],
  [4196.42, 'viertausendeinhundertsechsundneunzig komma zweiundvierzig'],

  [-17.42, 'minus siebzehn komma zweiundvierzig'],
  [-1, 'minus eins'],
  [-20, 'minus zwanzig'],

  [0, 'null'],
  [1, 'eins'],
  [2, 'zwei'],
  [3, 'drei'],
  [11, 'elf'],
  [12, 'zwölf'],
  [16, 'sechzehn'],
  [19, 'neunzehn'],
  [20, 'zwanzig'],
  [21, 'einundzwanzig'],
  [26, 'sechsundzwanzig'],
  [28, 'achtundzwanzig'],
  [30, 'dreißig'],
  [31, 'einunddreißig'],
  [40, 'vierzig'],
  [44, 'vierundvierzig'],
  [50, 'fünfzig'],
  [55, 'fünfundfünfzig'],
  [60, 'sechzig'],
  [67, 'siebenundsechzig'],
  [70, 'siebzig'],
  [79, 'neunundsiebzig'],
  [89, 'neunundachtzig'],
  [95, 'fünfundneunzig'],
  [100, 'einhundert'],
  [101, 'einhunderteins'],
  [199, 'einhundertneunundneunzig'],
  [203, 'zweihundertdrei'],
  [287, 'zweihundertsiebenundachtzig'],
  [356, 'dreihundertsechsundfünfzig'],
  [400, 'vierhundert'],
  [434, 'vierhundertvierunddreißig'],
  [578, 'fünfhundertachtundsiebzig'],
  [689, 'sechshundertneunundachtzig'],
  [729, 'siebenhundertneunundzwanzig'],
  [894, 'achthundertvierundneunzig'],
  [999, 'neunhundertneunundneunzig'],
  [1000, 'eintausend'],
  [1001, 'eintausendeins'],
  [1097, 'eintausendsiebenundneunzig'],
  [1104, 'eintausendeinhundertvier'],
  [1243, 'eintausendzweihundertdreiundvierzig'],
  [2385, 'zweitausenddreihundertfünfundachtzig'],
  [3766, 'dreitausendsiebenhundertsechsundsechzig'],
  [4196, 'viertausendeinhundertsechsundneunzig'],
  [5846, 'fünftausendachthundertsechsundvierzig'],
  [6459, 'sechstausendvierhundertneunundfünfzig'],
  [7232, 'siebentausendzweihundertzweiunddreißig'],
  [8569, 'achttausendfünfhundertneunundsechzig'],
  [9539, 'neuntausendfünfhundertneununddreißig'],
  [1_000_000, 'eine Million'],
  [1_000_001, 'eine Million eins'],
  [4_000_000, 'vier Millionen'],
  [4_000_000_000, 'vier Milliarden'],
  [1_000_000_000, 'eine Milliarde'],
  [10_000_000_000_000, 'zehn Billionen'],
  [100_000_000_000_000, 'einhundert Billionen'],
  [4_500_072_900_000_111, 'vier Billiarden fünfhundert Billionen zweiundsiebzig Milliarden neunhundert Millionen einhundertelf'],
  [1_000_000_000_000_000_000n, 'eine Trillion']
]

/**
 * Ordinal number test cases
 * Format: [input, expected_output]
 */
export const ordinal = [
  // Basic ones (1-9) - irregular: erste, dritte, siebte, achte
  [1, 'erste'],
  [2, 'zweite'],
  [3, 'dritte'],
  [4, 'vierte'],
  [5, 'fünfte'],
  [6, 'sechste'],
  [7, 'siebte'],
  [8, 'achte'],
  [9, 'neunte'],

  // Teens (10-19) - add -te
  [10, 'zehnte'],
  [11, 'elfte'],
  [12, 'zwölfte'],
  [13, 'dreizehnte'],
  [14, 'vierzehnte'],
  [15, 'fünfzehnte'],
  [16, 'sechzehnte'],
  [17, 'siebzehnte'],
  [18, 'achtzehnte'],
  [19, 'neunzehnte'],

  // Tens (20-90) - add -ste
  [20, 'zwanzigste'],
  [30, 'dreißigste'],
  [40, 'vierzigste'],
  [50, 'fünfzigste'],
  [60, 'sechzigste'],
  [70, 'siebzigste'],
  [80, 'achtzigste'],
  [90, 'neunzigste'],

  // Compound tens-ones (inverted order)
  [21, 'einundzwanzigste'],
  [22, 'zweiundzwanzigste'],
  [23, 'dreiundzwanzigste'],
  [32, 'zweiunddreißigste'],
  [42, 'zweiundvierzigste'],
  [53, 'dreiundfünfzigste'],
  [67, 'siebenundsechzigste'],
  [88, 'achtundachtzigste'],
  [99, 'neunundneunzigste'],

  // Hundreds
  [100, 'einhundertste'],
  [101, 'einhunderterste'],
  [102, 'einhundertzweite'],
  [103, 'einhundertdritte'],
  [110, 'einhundertzehnte'],
  [111, 'einhundertelfte'],
  [121, 'einhunderteinundzwanzigste'],
  [200, 'zweihundertste'],
  [300, 'dreihundertste'],
  [500, 'fünfhundertste'],
  [999, 'neunhundertneunundneunzigste'],

  // Thousands
  [1000, 'eintausendste'],
  [1001, 'eintausenderste'],
  [1010, 'eintausendzehnte'],
  [1100, 'eintausendeinhundertste'],
  [1111, 'eintausendeinhundertelfte'],
  [2000, 'zweitausendste'],
  [5000, 'fünftausendste'],
  [10000, 'zehntausendste'],
  [12345, 'zwölftausenddreihundertfünfundvierzigste'],
  [99999, 'neunundneunzigtausendneunhundertneunundneunzigste'],

  // Larger scales
  [1_000_000, 'eine Millionste'],
  [1_000_001, 'eine Million erste'],
  [2_000_000, 'zwei Millionenste'],
  [1_000_000_000, 'eine Milliardeste'],
  [1_000_000_000_000, 'eine Billionste'],

  // BigInt support
  [1_000_000_000_000_000_000n, 'eine Trillionste']
]

/**
 * Currency test cases (Euro)
 * Format: [input, expected_output, options?]
 */
export const currency = [
  // Zero
  [0, 'null Euro'],

  // Whole euros
  [1, 'ein Euro'],
  [2, 'zwei Euro'],
  [10, 'zehn Euro'],
  [21, 'einundzwanzig Euro'],
  [100, 'einhundert Euro'],
  [1000, 'eintausend Euro'],
  [1000000, 'eine Million Euro'],

  // Cents only
  [0.01, 'ein Cent'],
  [0.02, 'zwei Cent'],
  [0.10, 'zehn Cent'],
  [0.21, 'einundzwanzig Cent'],
  [0.50, 'fünfzig Cent'],
  [0.99, 'neunundneunzig Cent'],

  // Euros and cents
  [1.01, 'ein Euro und ein Cent'],
  [1.50, 'ein Euro und fünfzig Cent'],
  [2.02, 'zwei Euro und zwei Cent'],
  [21.21, 'einundzwanzig Euro und einundzwanzig Cent'],
  [42.50, 'zweiundvierzig Euro und fünfzig Cent'],
  [100.99, 'einhundert Euro und neunundneunzig Cent'],
  [1000.01, 'eintausend Euro und ein Cent'],
  [1000000.01, 'eine Million Euro und ein Cent'],

  // Negative amounts
  [-1, 'minus ein Euro'],
  [-0.50, 'minus fünfzig Cent'],
  [-42.50, 'minus zweiundvierzig Euro und fünfzig Cent'],

  // Without "und" option
  [42.50, 'zweiundvierzig Euro fünfzig Cent', { and: false }],
  [1.01, 'ein Euro ein Cent', { and: false }],

  // Edge cases: .00 cents should show euros only
  [5.00, 'fünf Euro'],
  ['5.00', 'fünf Euro'],
  [100.00, 'einhundert Euro'],

  // String inputs
  ['42.50', 'zweiundvierzig Euro und fünfzig Cent'],
  ['0.99', 'neunundneunzig Cent'],

  // BigInt (whole euros only)
  [1000000000000n, 'eine Billion Euro']
]
