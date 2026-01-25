/**
 * Cardinal number test cases
 * Format: [input, expected_output, options?]
 */
export const cardinal = [
  [0.01, 'nulla egész nulla egy'],
  [0.007, 'nulla egész nulla nulla hét'],
  [17.42, 'tizenhét egész negyvenkettő'],
  [27.312, 'huszonhét egész háromszáztizenkettő'],
  [53.486, 'ötvenhárom egész négyszáznyolcvanhat'],
  [300.42, 'háromszáz egész negyvenkettő'],
  [4196.42, 'négyezer-százkilencvenhat egész negyvenkettő'],

  [-17.42, 'mínusz tizenhét egész negyvenkettő'],
  [-1, 'mínusz egy'],
  [-20, 'mínusz húsz'],

  [0, 'nulla'],
  [1, 'egy'],
  [2, 'kettő'],
  [3, 'három'],
  [11, 'tizenegy'],
  [12, 'tizenkettő'],
  [16, 'tizenhat'],
  [19, 'tizenkilenc'],
  [20, 'húsz'],
  [21, 'huszonegy'],
  [26, 'huszonhat'],
  [28, 'huszonnyolc'],
  [30, 'harminc'],
  [31, 'harmincegy'],
  [40, 'negyven'],
  [44, 'negyvennégy'],
  [50, 'ötven'],
  [55, 'ötvenöt'],
  [60, 'hatvan'],
  [67, 'hatvanhét'],
  [70, 'hetven'],
  [79, 'hetvenkilenc'],
  [89, 'nyolcvankilenc'],
  [95, 'kilencvenöt'],
  [100, 'száz'],
  [101, 'százegy'],
  [199, 'százkilencvenkilenc'],
  [203, 'kétszázhárom'],
  [287, 'kétszáznyolcvanhét'],
  [356, 'háromszázötvenhat'],
  [400, 'négyszáz'],
  [434, 'négyszázharmincnégy'],
  [578, 'ötszázhetvennyolc'],
  [689, 'hatszáznyolcvankilenc'],
  [729, 'hétszázhuszonkilenc'],
  [894, 'nyolcszázkilencvennégy'],
  [999, 'kilencszázkilencvenkilenc'],
  [1000, 'ezer'],
  [1001, 'ezeregy'],
  [1097, 'ezerkilencvenhét'],
  [1104, 'ezerszáznégy'],
  [1243, 'ezerkétszáznegyvenhárom'],
  [2000, 'kétezer'],
  [2385, 'kétezer-háromszáznyolcvanöt'],
  [3766, 'háromezer-hétszázhatvanhat'],
  [4196, 'négyezer-százkilencvenhat'],
  [5846, 'ötezer-nyolcszáznegyvenhat'],
  [6459, 'hatezer-négyszázötvenkilenc'],
  [7232, 'hétezer-kétszázharminckettő'],
  [8569, 'nyolcezer-ötszázhatvankilenc'],
  [9539, 'kilencezer-ötszázharminckilenc'],

  [1_000_000, 'egymillió'],
  [1_000_001, 'egymillió-egy'],
  [4_000_000, 'négymillió'],
  [10_000_000_000_000, 'tízbillió'],
  [100_000_000_000_000, 'százbillió'],
  [1_000_000_000_000_000_000n, 'egytrillió']
]

/**
 * Ordinal number test cases
 * Format: [input, expected_output, options?]
 */
export const ordinal = [
  // Special forms 1-10
  [1, 'első'],
  [2, 'második'],
  [3, 'harmadik'],
  [4, 'negyedik'],
  [5, 'ötödik'],
  [6, 'hatodik'],
  [7, 'hetedik'],
  [8, 'nyolcadik'],
  [9, 'kilencedik'],
  [10, 'tizedik'],

  // Regular forms (cardinal + suffix)
  [11, 'tizenegyedik'],
  [12, 'tizenkettődik'],
  [19, 'tizenkilencedik'],
  [20, 'huszadik'],
  [21, 'huszonegyedik'],
  [30, 'harmincadik'],
  [42, 'negyvenkettődik'],
  [99, 'kilencvenkilencedik'],

  // Hundreds
  [100, 'századik'],
  [101, 'százegyedik'],
  [200, 'kétszázadik'],

  // Thousands
  [1000, 'ezredik'],
  [1001, 'ezeregyedik']
]

/**
 * Currency test cases (Hungarian Forint)
 * Format: [input, expected_output, options?]
 */
export const currency = [
  // Zero
  [0, 'nulla forint'],

  // Whole forint
  [1, 'egy forint'],
  [2, 'kettő forint'],
  [5, 'öt forint'],
  [10, 'tíz forint'],
  [21, 'huszonegy forint'],
  [42, 'negyvenkettő forint'],
  [100, 'száz forint'],
  [1000, 'ezer forint'],

  // Fillér only
  [0.01, 'egy fillér'],
  [0.25, 'huszonöt fillér'],
  [0.50, 'ötven fillér'],
  [0.99, 'kilencvenkilenc fillér'],

  // Forint and fillér
  [1.01, 'egy forint egy fillér'],
  [1.50, 'egy forint ötven fillér'],
  [42.50, 'negyvenkettő forint ötven fillér'],
  [100.99, 'száz forint kilencvenkilenc fillér'],

  // Negative amounts
  [-1, 'mínusz egy forint'],
  [-42.50, 'mínusz negyvenkettő forint ötven fillér'],

  // Edge cases
  [5.00, 'öt forint'],
  ['5.00', 'öt forint']
]
