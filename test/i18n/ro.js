export default [
    // Decimal numbers
    [0.01, 'zero virgulă zero unu'],
    [0.007, 'zero virgulă zero zero șapte'],
    [1.007, 'unu virgulă zero zero șapte'],
    [5.5, 'cinci virgulă cinci'],
    [17.42, 'șaptesprezece virgulă patruzeci și doi'],
    [27.312, 'douăzeci și șapte virgulă trei sute doisprezece'],
    [53.486, 'cincizeci și trei virgulă patru sute optzeci și șase'],
    [300.42, 'trei sute virgulă patruzeci și doi'],
    [4196.42, 'patru mii o sută nouăzeci și șase virgulă patruzeci și doi'],

    // Negative numbers
    [-17.42, 'minus șaptesprezece virgulă patruzeci și doi'],
    [-1, 'minus unu'],
    [-20, 'minus douăzeci'],

    // Basic numbers 0-20
    [0, 'zero'],
    [1, 'unu'],
    [2, 'doi'],
    [3, 'trei'],
    [4, 'patru'],
    [5, 'cinci'],
    [6, 'șase'],
    [7, 'șapte'],
    [8, 'opt'],
    [9, 'nouă'],
    [10, 'zece'],
    [11, 'unsprezece'],
    [12, 'douăsprezece'],
    [13, 'treisprezece'],
    [14, 'paisprezece'],
    [15, 'cincisprezece'],
    [16, 'șaisprezece'],
    [17, 'șaptesprezece'],
    [18, 'optsprezece'],
    [19, 'nouăsprezece'],
    [20, 'douăzeci'],

    // Numbers 21-99
    [21, 'douăzeci și unu'],
    [26, 'douăzeci și șase'],
    [28, 'douăzeci și opt'],
    [30, 'treizeci'],
    [31, 'treizeci și unu'],
    [40, 'patruzeci'],
    [44, 'patruzeci și patru'],
    [50, 'cincizeci'],
    [55, 'cincizeci și cinci'],
    [60, 'șaizeci'],
    [67, 'șaizeci și șapte'],
    [70, 'șaptezeci'],
    [79, 'șaptezeci și nouă'],
    [89, 'optzeci și nouă'],
    [95, 'nouăzeci și cinci'],
    [99, 'nouăzeci și nouă'],

    // Hundreds
    [100, 'o sută'],
    [101, 'o sută unu'],
    [199, 'o sută nouăzeci și nouă'],
    [200, 'două sute'],
    [203, 'două sute trei'],
    [287, 'două sute optzeci și șapte'],
    [356, 'trei sute cincizeci și șase'],
    [400, 'patru sute'],
    [434, 'patru sute treizeci și patru'],
    [578, 'cinci sute șaptezeci și opt'],
    [689, 'șase sute optzeci și nouă'],
    [729, 'șapte sute douăzeci și nouă'],
    [894, 'opt sute nouăzeci și patru'],
    [999, 'nouă sute nouăzeci și nouă'],

    // Thousands
    [1000, 'o mie'],
    [1001, 'o mie unu'],
    [1097, 'o mie nouăzeci și șapte'],
    [1104, 'o mie o sută patru'],
    [1243, 'o mie două sute patruzeci și trei'],
    [2000, 'două mii'],
    [2385, 'două mii trei sute optzeci și cinci'],
    [3766, 'trei mii șapte sute șaizeci și șase'],
    [4196, 'patru mii o sută nouăzeci și șase'],
    [5846, 'cinci mii opt sute patruzeci și șase'],
    [6459, 'șase mii patru sute cincizeci și nouă'],
    [7232, 'șapte mii două sute treizeci și doi'],
    [8569, 'opt mii cinci sute șaizeci și nouă'],
    [9539, 'nouă mii cinci sute treizeci și nouă'],

    // Larger thousands with "de" preposition
    [20000, 'douăzeci de mii'],
    [21000, 'douăzeci și una de mii'],
    [25000, 'douăzeci și cinci de mii'],
    [100000, 'o sută de mii'],
    [101000, 'o sută una de mii'],
    [150000, 'o sută cincizeci de mii'],
    [200000, 'două sute de mii'],
    [999000, 'nouă sute nouăzeci și nouă de mii'],

    // Millions
    [1_000_000, 'un milion'],
    [1_000_001, 'un milion unu'],
    [2_000_000, 'două milioane'],
    [4_000_000, 'patru milioane'],
    [20_000_000, 'douăzeci de milioane'],
    [21_000_000, 'douăzeci și una de milioane'],
    [100_000_000, 'o sută de milioane'],
    [150_000_000, 'o sută cincizeci de milioane'],

    // Billions
    [1_000_000_000, 'un miliard'],
    [2_000_000_000, 'două miliarde'],
    [20_000_000_000, 'douăzeci de miliarde'],
    [100_000_000_000, 'o sută de miliarde'],

    // Trillions
    [1_000_000_000_000, 'un trilion'],
    [2_000_000_000_000, 'două trilioane'],
    [20_000_000_000_000, 'douăzeci de trilioane'],

    // Very large numbers
    [1_000_000_000_000_000_000n, 'un cvintilion'],
    [1_000_000_000_000_000_000_000n, 'un sextilion'],
    [1_000_000_000_000_000_000_000_000n, 'un septilion'],

    // Feminine form tests (when feminine option is true)
    // These would be tested separately with feminine: true option
    // [1, 'una', { feminine: true }],
    // [2, 'două', { feminine: true }],
    // [21, 'douăzeci și una', { feminine: true }],
    // [1001, 'o mie una', { feminine: true }],
];
