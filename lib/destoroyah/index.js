var EXPOSE, destoroyah, setup;

destoroyah = require('./main');

setup = require('./setup');

EXPOSE = require('../destoroyah/const').EXPOSE;

module.exports = destoroyah;

if (typeof window !== 'undefined') {
  window.destoroyah = destoroyah;
  setup.extend('rampage', window);
  setup.extend('monster', window);
  setup.extend('struggle', window);
  EXPOSE.forEach(function(propName) {
    return window[propName] = destoroyah[propName];
  });
}
