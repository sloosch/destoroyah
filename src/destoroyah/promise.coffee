#use native promise if available
if global? && 'Promise' of global
  Promise = global.Promise
else if window? && 'Promise' of window
  Promise = window.Promise
else
  Promise = require('es6-promise').Promise

module.exports = Promise
