/**
 * Cardinal number test cases
 * Format: [input, expected_output, options?]
 */
export const cardinal = [
  [0, 'sifar'],
  [1, 'satu'],
  [2, 'dua'],
  [3, 'tiga'],
  [5.5, 'lima perpuluhan lima'],
  ['0.01', 'sifar perpuluhan sifar satu'],
  ['0.005', 'sifar perpuluhan sifar sifar lima'],
  [3.14, 'tiga perpuluhan empat belas'],

  [-5, 'minus lima'],

  [10, 'sepuluh'],
  [11, 'sebelas'],
  [15, 'lima belas'],
  [19, 'sembilan belas'],
  [20, 'dua puluh'],
  [21, 'dua puluh satu'],
  [25, 'dua puluh lima'],
  [29, 'dua puluh sembilan'],
  [30, 'tiga puluh'],
  [33, 'tiga puluh tiga'],
  [40, 'empat puluh'],
  [45, 'empat puluh lima'],
  [50, 'lima puluh'],
  [58, 'lima puluh lapan'],
  [60, 'enam puluh'],
  [68, 'enam puluh lapan'],
  [70, 'tujuh puluh'],
  [79, 'tujuh puluh sembilan'],
  [80, 'lapan puluh'],
  [90, 'sembilan puluh'],
  [99, 'sembilan puluh sembilan'],

  [100, 'seratus'],
  [101, 'seratus satu'],
  [110, 'seratus sepuluh'],
  [125, 'seratus dua puluh lima'],
  [200, 'dua ratus'],
  [215, 'dua ratus lima belas'],
  [999, 'sembilan ratus sembilan puluh sembilan'],

  [1000, 'seribu'],
  [1001, 'seribu satu'],
  [1010, 'seribu sepuluh'],
  [1100, 'seribu seratus'],
  [1234, 'seribu dua ratus tiga puluh empat'],
  [10_000, 'sepuluh ribu'],
  [50_000, 'lima puluh ribu'],
  [99_999, 'sembilan puluh sembilan ribu sembilan ratus sembilan puluh sembilan'],

  [1_000_000, 'sejuta'],
  [2_000_000, 'dua juta'],
  [12_345_678, 'dua belas juta tiga ratus empat puluh lima ribu enam ratus tujuh puluh lapan'],
  [1_000_000_000, 'sebilion'],
  [1_000_000_000_000n, 'setrilion']
]
