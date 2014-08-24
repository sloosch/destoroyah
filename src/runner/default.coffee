destoroyah = require './../destoroyah/main'
survivor = require './../reporter/survivor'
chalk = require 'chalk'
EXPOSE = require('./../destoroyah/const').EXPOSE

module.exports = class DestoroyahRunner
  constructor : (@files) ->
  _exposeGlobals : ->
    global.destoroyah = destoroyah
    EXPOSE.forEach (propName) -> global[propName] = destoroyah[propName]
  _hideGlobals : ->
    delete global.destoroyah
    EXPOSE.forEach (propName) -> delete global[propName]
  _loadFiles : ->
    @files.forEach (file) -> require file
  _unloadFiles : ->
    @files.forEach (file) ->  delete require.cache[file]
  run : ->
    @_exposeGlobals()
    detach = []
    detach.push destoroyah.bitterStruggle.on 'defeated', -> failed = true
    detach.push destoroyah.bitterStruggle.on 'error rampage', -> failed = true
    tearDown = =>
      @_hideGlobals()
      destoroyah.bitterStruggle.surrender()
      @_unloadFiles()
      detach.forEach (f) -> f()
    @_loadFiles()
    survivor()(destoroyah.bitterStruggle)
    destoroyah.bitterStruggle.fight().then(tearDown, tearDown)
