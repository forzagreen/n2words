/**
 * Cardinal number test cases
 * Format: [input, expected_output, options?]
 */
export const cardinal = [
  [0.01, 'nul komma nul et'],
  [1.007, 'et komma nul nul syv'],
  [1.7, 'et komma syv'],
  [17.42, 'sytten komma toogfyrre'],
  [27.312, 'syvogtyve komma trehundrede og tolv'],
  [53.486, 'treoghalvtreds komma firehundrede og seksogfirs'],
  [300.42, 'trehundrede komma toogfyrre'],
  [4196.42, 'firetusinde og ethundrede og seksoghalvfems komma toogfyrre'],

  [-17.42, 'minus sytten komma toogfyrre'],
  [-1, 'minus et'],
  [-20, 'minus tyve'],

  [0, 'nul'],
  [1, 'et'],
  [2, 'to'],
  [3, 'tre'],
  [11, 'elleve'],
  [12, 'tolv'],
  [16, 'seksten'],
  [19, 'nitten'],
  [20, 'tyve'],
  [21, 'enogtyve'],
  [26, 'seksogtyve'],
  [28, 'otteogtyve'],
  [30, 'tredive'],
  [31, 'enogtredive'],
  [40, 'fyrre'],
  [44, 'fireogfyrre'],
  [50, 'halvtreds'],
  [55, 'femoghalvtreds'],
  [60, 'treds'],
  [67, 'syvogtreds'],
  [70, 'halvfjerds'],
  [79, 'nioghalvfjerds'],
  [89, 'niogfirs'],
  [95, 'femoghalvfems'],
  [100, 'ethundrede'],
  [101, 'ethundrede og et'],
  [199, 'ethundrede og nioghalvfems'],
  [203, 'tohundrede og tre'],
  [287, 'tohundrede og syvogfirs'],
  [356, 'trehundrede og seksoghalvtreds'],
  [400, 'firehundrede'],
  [434, 'firehundrede og fireogtredive'],
  [578, 'femhundrede og otteoghalvfjerds'],
  [689, 'sekshundrede og niogfirs'],
  [729, 'syvhundrede og niogtyve'],
  [894, 'ottehundrede og fireoghalvfems'],
  [999, 'nihundrede og nioghalvfems'],
  [1000, 'ettusind'],
  [1001, 'ettusinde og et'],
  [1097, 'ettusinde og syvoghalvfems'],
  [1104, 'ettusinde og ethundrede og fire'],
  [1243, 'ettusinde og tohundrede og treogfyrre'],
  [2385, 'totusinde og trehundrede og femogfirs'],
  [3766, 'tretusinde og syvhundrede og seksogtreds'],
  [4196, 'firetusinde og ethundrede og seksoghalvfems'],
  [5846, 'femtusinde og ottehundrede og seksogfyrre'],
  [6459, 'sekstusinde og firehundrede og nioghalvtreds'],
  [7232, 'syvtusinde og tohundrede og toogtredive'],
  [8569, 'ottetusinde og femhundrede og niogtreds'],
  [9539, 'nitusinde og femhundrede og niogtredive'],
  [1_000_000, 'en millioner'],
  [1_000_001, 'en millioner et'],
  [4_000_000, 'fire millioner'],
  [10_000_000_000_000, 'ti billioner'],
  [100_000_000_000_000, 'ethundrede billioner'],
  [1_000_000_000_000_000_000n, 'en trillioner']
]

/**
 * Ordinal number test cases
 * Format: [input, expected_output, options?]
 */
export const ordinal = [
  // Special forms 1-12
  [1, 'første'],
  [2, 'anden'],
  [3, 'tredje'],
  [4, 'fjerde'],
  [5, 'femte'],
  [6, 'sjette'],
  [7, 'syvende'],
  [8, 'ottende'],
  [9, 'niende'],
  [10, 'tiende'],
  [11, 'ellevte'],
  [12, 'tolvte'],

  // Regular forms (cardinal + de)
  [13, 'trettende'],
  [14, 'fjortende'],
  [19, 'nittende'],
  [20, 'tyvede'],
  [21, 'enogtyvede'],
  [30, 'tredivede'],
  [42, 'toogfyrrede'],
  [99, 'nioghalvfemsde'],

  // Hundreds
  [100, 'ethundredede'],
  [101, 'ethundrede og etde'],
  [200, 'tohundredede'],

  // Thousands
  [1000, 'ettusindde'],
  [1001, 'ettusinde og etde']
]

/**
 * Currency test cases (Danish Krone)
 * Format: [input, expected_output, options?]
 */
export const currency = [
  // Zero
  [0, 'nul kroner'],

  // Whole kroner
  [1, 'en krone'],
  [2, 'to kroner'],
  [5, 'fem kroner'],
  [10, 'ti kroner'],
  [21, 'enogtyve kroner'],
  [42, 'toogfyrre kroner'],
  [100, 'ethundrede kroner'],
  [1000, 'ettusind kroner'],

  // Øre only
  [0.01, 'et øre'],
  [0.25, 'femogtyve øre'],
  [0.50, 'halvtreds øre'],
  [0.99, 'nioghalvfems øre'],

  // Kroner and øre
  [1.01, 'en krone og et øre'],
  [1.50, 'en krone og halvtreds øre'],
  [42.50, 'toogfyrre kroner og halvtreds øre'],
  [100.99, 'ethundrede kroner og nioghalvfems øre'],

  // Negative amounts
  [-1, 'minus en krone'],
  [-42.50, 'minus toogfyrre kroner og halvtreds øre'],

  // Edge cases
  [5.00, 'fem kroner'],
  ['5.00', 'fem kroner']
]
