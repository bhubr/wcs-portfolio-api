const assert = require('assert');
const formatPromo = require('../helpers/formatPromo');

assert.deepStrictEqual(
  formatPromo('1218-js'),
  {
    key: '1218-js',
    value: 'Décembre 2018'
  }
);
assert.deepStrictEqual(
  formatPromo('0219-js'),
  {
    key: '0219-js',
    value: 'Février 2019'
  }
);
