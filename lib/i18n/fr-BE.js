import N2WordsFR from './fr.js';

/**
 * @augments N2WordsFR
 */
class N2WordsFRBE extends N2WordsFR {
  constructor(options) {
    options = Object.assign({}, options, { _region: 'BE' });

    super(options);
  }
}

export default N2WordsFRBE;
