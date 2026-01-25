/**
 * Cardinal number test cases
 * Format: [input, expected_output, options?]
 */
export const cardinal = [
  [0.01, 'nol koma nol satu'],
  [0.007, 'nol koma nol nol tujuh'],
  [5.5, 'lima koma lima'],
  [17.42, 'tujuh belas koma empat puluh dua'],
  [27.312, 'dua puluh tujuh koma tiga ratus dua belas'],
  [53.486, 'lima puluh tiga koma empat ratus delapan puluh enam'],
  [300.42, 'tiga ratus koma empat puluh dua'],
  [4196.42, 'empat ribu seratus sembilan puluh enam koma empat puluh dua'],

  [-17.42, 'min tujuh belas koma empat puluh dua'],
  [-1, 'min satu'],
  [-20, 'min dua puluh'],

  [0, 'nol'],
  [1, 'satu'],
  [2, 'dua'],
  [3, 'tiga'],
  [11, 'sebelas'],
  [12, 'dua belas'],
  [16, 'enam belas'],
  [19, 'sembilan belas'],
  [20, 'dua puluh'],
  [21, 'dua puluh satu'],
  [26, 'dua puluh enam'],
  [28, 'dua puluh delapan'],
  [30, 'tiga puluh'],
  [31, 'tiga puluh satu'],
  [40, 'empat puluh'],
  [44, 'empat puluh empat'],
  [50, 'lima puluh'],
  [55, 'lima puluh lima'],
  [60, 'enam puluh'],
  [67, 'enam puluh tujuh'],
  [70, 'tujuh puluh'],
  [79, 'tujuh puluh sembilan'],
  [89, 'delapan puluh sembilan'],
  [95, 'sembilan puluh lima'],
  [100, 'seratus'],
  [101, 'seratus satu'],
  [199, 'seratus sembilan puluh sembilan'],
  [203, 'dua ratus tiga'],
  [287, 'dua ratus delapan puluh tujuh'],
  [356, 'tiga ratus lima puluh enam'],
  [400, 'empat ratus'],
  [434, 'empat ratus tiga puluh empat'],
  [578, 'lima ratus tujuh puluh delapan'],
  [689, 'enam ratus delapan puluh sembilan'],
  [729, 'tujuh ratus dua puluh sembilan'],
  [894, 'delapan ratus sembilan puluh empat'],
  [999, 'sembilan ratus sembilan puluh sembilan'],
  [1000, 'seribu'],
  [1001, 'seribu satu'],
  [1097, 'seribu sembilan puluh tujuh'],
  [1104, 'seribu seratus empat'],
  [1243, 'seribu dua ratus empat puluh tiga'],
  [2385, 'dua ribu tiga ratus delapan puluh lima'],
  [3766, 'tiga ribu tujuh ratus enam puluh enam'],
  [4196, 'empat ribu seratus sembilan puluh enam'],
  [5846, 'lima ribu delapan ratus empat puluh enam'],
  [6459, 'enam ribu empat ratus lima puluh sembilan'],
  [7232, 'tujuh ribu dua ratus tiga puluh dua'],
  [8569, 'delapan ribu lima ratus enam puluh sembilan'],
  [9539, 'sembilan ribu lima ratus tiga puluh sembilan'],
  [1_000_000, 'satu juta'],
  [1_000_001, 'satu juta satu'],
  [4_000_000, 'empat juta'],
  [10_000_000_000_000, 'sepuluh triliun'],
  [100_000_000_000_000, 'seratus triliun'],
  [1_000_000_000_000_000_000n, 'satu kuantiliun']
]

/**
 * Ordinal number test cases
 * Format: [input, expected_output, options?]
 */
export const ordinal = [
  // Special case: 1st is "pertama"
  [1, 'pertama'],

  // Regular ordinals use ke- prefix
  [2, 'kedua'],
  [3, 'ketiga'],
  [4, 'keempat'],
  [5, 'kelima'],
  [6, 'keenam'],
  [7, 'ketujuh'],
  [8, 'kedelapan'],
  [9, 'kesembilan'],
  [10, 'kesepuluh'],

  // Teens
  [11, 'kesebelas'],
  [12, 'kedua belas'],
  [15, 'kelima belas'],
  [19, 'kesembilan belas'],

  // Tens
  [20, 'kedua puluh'],
  [21, 'kedua puluh satu'],
  [30, 'ketiga puluh'],
  [42, 'keempat puluh dua'],
  [99, 'kesembilan puluh sembilan'],

  // Hundreds
  [100, 'keseratus'],
  [101, 'keseratus satu'],
  [200, 'kedua ratus'],

  // Thousands
  [1000, 'keseribu'],
  [1001, 'keseribu satu'],

  // Millions
  [1000000, 'kesatu juta']
]

/**
 * Currency test cases (Indonesian Rupiah)
 * Format: [input, expected_output, options?]
 */
export const currency = [
  // Zero
  [0, 'nol rupiah'],

  // Whole amounts
  [1, 'satu rupiah'],
  [2, 'dua rupiah'],
  [5, 'lima rupiah'],
  [10, 'sepuluh rupiah'],
  [100, 'seratus rupiah'],
  [1000, 'seribu rupiah'],
  [10000, 'sepuluh ribu rupiah'],
  [100000, 'seratus ribu rupiah'],
  [1000000, 'satu juta rupiah'],

  // Negative amounts
  [-1, 'min satu rupiah'],
  [-1000, 'min seribu rupiah'],

  // Edge cases (decimals rounded)
  [5.00, 'lima rupiah'],
  ['5.00', 'lima rupiah']
]
