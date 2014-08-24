#use native promise if available
if window? && 'Promise' of window
  Promise = window.Promise
else
  Promise = require('es6-promise').Promise

module.exports = Promise
