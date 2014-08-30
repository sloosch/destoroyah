var Promise;

if ((typeof global !== "undefined" && global !== null) && 'Promise' in global) {
  Promise = global.Promise;
} else if ((typeof window !== "undefined" && window !== null) && 'Promise' in window) {
  Promise = window.Promise;
} else {
  Promise = require('es6-promise').Promise;
}

module.exports = Promise;
