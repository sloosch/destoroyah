destoroyah = require './../destoroyah/main'
survivor = require './../reporter/survivor'
chalk = require 'chalk'

module.exports = class DestoroyahRunner
  constructor : (@files) ->
  _exposable : -> [
    'awake',
    'rampage',
    'field',
    'attack'
    'equipWith',
    'hoping',
    'beforeRampage',
    'afterRampage',
    'whenAwake',
    'whenCalm']
  _exposeGlobals : ->
    @_exposable().forEach (propName) -> global[propName] = destoroyah[propName]
  _hideGlobals : ->
    @_exposable().forEach (propName) -> delete global[propName]
  _loadFiles : ->
    @files.forEach (file) -> require file
  _unloadFiles : ->
    @files.forEach (file) ->  delete require.cache[file]
  run : ->
    failed = false
    @_exposeGlobals()
    detach = []
    detach.push destoroyah.bitterStruggle.on 'defeated', -> failed = true
    detach.push destoroyah.bitterStruggle.on 'error rampage', -> failed = true
    try
      @_loadFiles()
      survivor()(destoroyah.bitterStruggle)
      destoroyah.bitterStruggle.fight()
      failed
    finally
      @_hideGlobals()
      destoroyah.bitterStruggle.surrender()
      @_unloadFiles()
      detach.forEach (f) -> f()
