MonsterEventEmitter = require('./event').MonsterEventEmitter
attack = require('./attack').attacks
testrun = require './testrun'

exports.Rampage = class Rampage extends MonsterEventEmitter
  @_lastId = 0
  constructor : (@reason, @hope, @f, @field) ->
    @id = Rampage._lastId++
    @result = null
    @only = false
    @skip = false
    super()
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
    @result = null
    attacksUsed = @_attackNames()
    testrun.forAll(@f, @_attacks(attacksUsed), @hope, @field, angryness)
    .then (res) =>
      @result = res
      if res.failed
        @_fireEvent 'defeated', res
      else
        @_fireEvent 'defended', res
      res
