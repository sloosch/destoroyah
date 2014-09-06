destoroyah = require './../destoroyah/main'
survivor = require './../reporter/survivor'
chalk = require 'chalk'
setup = require '../destoroyah/setup'
EXPOSE = require('../destoroyah/const').EXPOSE
util = require '../destoroyah/util'
module.exports = class DestoroyahRunner
  constructor : (@files) ->
  _exposeGlobals : ->
    global.destoroyah = destoroyah
    setup.extend 'rampage', global
    setup.extend 'monster', global
    setup.extend 'struggle', global
    EXPOSE.forEach (propName) -> global[propName] = destoroyah[propName]
  _hideGlobals : ->
    delete global.destoroyah
    setup.dispose 'rampage', global
    setup.dispose 'monster', global
    setup.dispose 'struggle', global
    EXPOSE.forEach (propName) -> delete global[propName]
  _loadFiles : ->
    @files.forEach (file) -> require file
  _unloadFiles : ->
    @files.forEach (file) ->  delete require.cache[file]
  run : ->
    @_exposeGlobals()
    tearDown = =>
      @_hideGlobals()
      destoroyah.bitterStruggle.surrender()
      @_unloadFiles()
      return
    @_loadFiles()
    survivor()(destoroyah.bitterStruggle)
    util.finally destoroyah.bitterStruggle.fight(), tearDown
