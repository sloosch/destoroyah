var Promise;

if ((typeof window !== "undefined" && window !== null) && 'Promise' in window) {
  Promise = window.Promise;
} else {
  Promise = require('es6-promise').Promise;
}

module.exports = Promise;
