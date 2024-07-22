import French from './fr.js';

/**
 * @augments French
 */
class Belgium extends French {
  constructor(options) {
    options = Object.assign({}, options, { _region: 'BE' });

    super(options);
  }
}

export default Belgium;
