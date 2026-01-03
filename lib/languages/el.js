import { GreedyScaleLanguage } from '../classes/greedy-scale-language.js'

/**
 * Greek language converter.
 *
 * Supports:
 * - Space-separated number composition
 * - Implicit "one" (ένα) omission before scale words
 * - Digit-by-digit decimal reading
 */
export class Greek extends GreedyScaleLanguage {
  negativeWord = 'μείον'
  decimalSeparatorWord = 'κόμμα'
  zeroWord = 'μηδέν'
  usePerDigitDecimals = true

  scaleWords = [
    // Large numbers (limited set for now)
    [1_000_000_000n, 'δισεκατομμύριο'],
    [1_000_000n, 'εκατομμύριο'],
    [1000n, 'χίλια'],

    // Hundreds
    [900n, 'εννιακόσια'],
    [800n, 'οκτακόσια'],
    [700n, 'επτακόσια'],
    [600n, 'εξακόσια'],
    [500n, 'πεντακόσια'],
    [400n, 'τετρακόσια'],
    [300n, 'τριακόσια'],
    [200n, 'διακόσια'],
    [100n, 'εκατό'],

    // Tens
    [90n, 'ενενήντα'],
    [80n, 'ογδόντα'],
    [70n, 'εβδομήντα'],
    [60n, 'εξήντα'],
    [50n, 'πενήντα'],
    [40n, 'σαράντα'],
    [30n, 'τριάντα'],
    [20n, 'είκοσι'],
    [19n, 'δεκαεννέα'],
    [18n, 'δεκαοκτώ'],
    [17n, 'δεκαεπτά'],
    [16n, 'δεκαέξι'],
    [15n, 'δεκαπέντε'],
    [14n, 'δεκατέσσερα'],
    [13n, 'δεκατρία'],
    [12n, 'δώδεκα'],
    [11n, 'έντεκα'],
    [10n, 'δέκα'],

    // Singles
    [9n, 'εννέα'],
    [8n, 'οκτώ'],
    [7n, 'επτά'],
    [6n, 'έξι'],
    [5n, 'πέντε'],
    [4n, 'τέσσερα'],
    [3n, 'τρία'],
    [2n, 'δύο'],
    [1n, 'ένα'],
    [0n, 'μηδέν']
  ]

  /** Combines two word-sets with Greek space-separation rules. */
  combineWordSets (preceding, following) {
    const [[precedingWord, precedingValue]] = Object.entries(preceding)
    const [[followingWord, followingValue]] = Object.entries(following)

    // Implicit one: omit "ένα" before any following value (> 0)
    if (precedingValue === 1n) {
      return following
    }

    // No special handling needed for trailing 'ένα';
    // nested merge will first collapse {1, 'ένα'} -> 'ένα'.

    // Multiplication: larger following scale multiplied by preceding number
    if (followingValue > precedingValue) {
      return { [`${precedingWord} ${followingWord}`]: precedingValue * followingValue }
    }

    // Addition: smaller numbers added together
    return { [`${precedingWord} ${followingWord}`]: precedingValue + followingValue }
  }
}
