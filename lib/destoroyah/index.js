var EXPOSE, destoroyah;

destoroyah = require('./main');

module.exports = destoroyah;

if (typeof window !== 'undefined') {
  EXPOSE = require('./const').EXPOSE;
  window.destoroyah = destoroyah;
  EXPOSE.foreEach(function(propName) {
    return window[propName] = destoroyah[propName];
  });
}
