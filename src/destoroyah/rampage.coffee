MonsterEventEmitter = require('./event').MonsterEventEmitter
attack = require('./attack').attacks
testrun = require './testrun'
setup = require './setup'
util = require './util'

exports.Rampage = class Rampage extends MonsterEventEmitter
  @_lastId = 0
  constructor : (@reason, @hope, @f, @field) ->
    @id = Rampage._lastId++
    @only = false
    @skip = false
    super()
    @reset()
  inspect : (val) ->
    @inspectedVal = val
    @inspected = true
    val
  reset : ->
    @result = null
    @inspected = false
    @inspectedVal = undefined
    @explanation = null
    return
  _attackNames : ->
    return [] unless fnParams = @f.toString().match(/^function\s*?\((.+)\)/)
    attackNames = fnParams[1].split ','
    attackNames.map (name) ->
      [attackName] = name.split '_'
      attackName.trim()
  _attacks : (names) ->
    return [] if names.length == 0
    names.map (attackName) =>
      return attack[attackName]() if attackName of attack
      throw new Error('Attack "' + attackName + '" not found for rampage ' + @reason + ', not equipped?')
  start : (angryness) ->
    @reset()
    attacksUsed = @_attackNames()
    setup.bindTo 'rampage', @
    test = testrun.forAll(@f, @_attacks(attacksUsed), @hope, @field, angryness)
    .then (res) =>
      @result = res
      if res.failed
        @_fireEvent 'defeated', res
      else
        @_fireEvent 'defended', res
      res
    util.finally test, (res) ->
      setup.unbind 'rampage'
      res

setup.include 'rampage', 'inspect', (val) -> @inspect val
