destoroyah = require './main'
module.exports = destoroyah
if typeof window != 'undefined'
  EXPOSE = require('./const').EXPOSE
  window.destoroyah = destoroyah
  EXPOSE.forEach (propName) ->
    window[propName] = destoroyah[propName]
