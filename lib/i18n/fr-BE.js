import { N2WordsFR } from './fr.js'

export class N2WordsFRBE extends N2WordsFR {
  constructor (options) {
    options = Object.assign({}, options, { _region: 'BE' })

    super(options)
  }
}

/**
 * Converts a value to cardinal (written) form.
 * @param {number|string|bigint} value Number to be convert.
 * @param {object} [options] Options for class.
 * @returns {string} Value in cardinal (written) format.
 * @throws {Error} Value cannot be invalid.
 */
export default function floatToCardinal (value, options = {}) {
  return new N2WordsFRBE(options).floatToCardinal(value)
}
