fieldModule = require './field'
attackModule = require './attack'
hopingModule = require './hopes'
constants = require './const'
util = require './util'
field = fieldModule
attack = attackModule.attacks
hoping = hopingModule.hopes
Promise = require './promise'

###
  Globals
###
module.exports = destoroyah =
  field : field
  attack : attack
  hoping : hoping
  constants : constants
  Promise : Promise
  modules :
    field : fieldModule
    attack : attackModule
    hoping : hopingModule
    util : util

class MonsterEventEmitter
  constructor : ->
    @listeners = {}
    @_eventId = 0
  _fireEvent : (eventName, args...) ->
    return unless eventName of @listeners
    f.apply @, args for id, f of @listeners[eventName]
  on : (eventName, f) ->
    @_eventId++
    @listeners[eventName] = {} unless eventName of @listeners
    eventId = eventName + '_' + @_eventId
    @listeners[eventName][eventId] = f
    => delete @listeners[eventName][eventId]
  once : (eventName, f) ->
    detach = @.on eventName, ->
      f.apply @, arguments
      detach()
  through : (eventName, that, renamedTo, addition...) ->
    @on eventName, ->
      args = [@]
      args = args.concat if arguments.length > 0 then (arg for arg in arguments) else []
      args.unshift renamedTo || eventName
      args = args.concat addition if addition?
      that._fireEvent.apply that, args

class BitterStruggle extends MonsterEventEmitter
  constructor : ->
    @monsters = []
    @activeMonster = null
    @detach = []
    super()
  addMonster : (monster) ->
    @detach.push monster.through 'start', @, 'awake monster'
    @detach.push monster.through 'end', @, 'calm monster'
    @detach.push monster.through 'start rampage', @
    @detach.push monster.through 'end rampage', @
    @detach.push monster.through 'error rampage', @
    @detach.push monster.through 'defended', @
    @detach.push monster.through 'defeated', @
    @monsters.push monster
    monster
  _runEachMonster : ->
    new Promise (resolve, reject) =>
      hasBrokenThrough = false
      runOn = @monsters
      onlyMonsters = runOn.filter (m) -> m.only
      if onlyMonsters.length > 0
        runOn = onlyMonsters
      runOn = runOn.filter (m) -> !m.skip
      util.cbForEach runOn, (monster, next) =>
        @activeMonster = monster
        monster.awake().then (broken) ->
          hasBrokenThrough ||= broken
          resolve(hasBrokenThrough) unless next()
        , reject
      return
  fight : ->
    @_fireEvent 'start'
    util.finally @_runEachMonster(), => @_fireEvent 'end'
  surrender : ->
    f() for f in @detach
    @detach = []
    @monsters = []

destoroyah.bitterStruggle = new BitterStruggle()

###
  Awakening
###
class Destoroyah extends MonsterEventEmitter
  reset : ->
    @rampages = []
    f() for f in @detach if @detach?
    @detach = []
  constructor : (@reason, @angryness, @setup) ->
    @only = false
    @skip = false
    @reset()
    super()
  addRampage : (rampage) ->
    unless rampage in @rampages
      @detach.push rampage.through 'defended', @
      @detach.push rampage.through 'defeated', @
      @rampages.push rampage
    return
  _runEachRampage : ->
    new Promise (resolve, reject) =>
      hasBrokenThrough = false
      runOn = @rampages
      onlyRampages = runOn.filter (r) -> r.only
      if onlyRampages.length > 0
        runOn = onlyRampages
      runOn = runOn.filter (r) -> !r.skip
      util.cbForEach runOn, (rampage, next) =>
        @_fireEvent 'start rampage', rampage
        rampage.start(@angryness)
        .then (res) =>
          hasBrokenThrough ||= res.failed
          @_fireEvent 'end rampage', rampage, res
          resolve(hasBrokenThrough) unless next()
        .catch (e) =>
          hasBrokenThrough = true
          @_fireEvent 'error rampage', rampage, e
          reject(e)
      return
  awake : ->
    @reset()
    @setup()
    @_fireEvent 'start'
    util.finally @_runEachRampage(), => @_fireEvent 'end'

destoroyah.awake = (reason, angryness, setup) ->
  if not setup?
    setup = angryness
    angryness = 100
  destoroyah.bitterStruggle.addMonster new Destoroyah(reason, angryness, setup)

destoroyah.aawake = (reason, angryness, setup) ->
  monster = destoroyah.awake arguments...
  monster.only = true
  monster

destoroyah.xawake = (reason, angryness, setup) ->
  monster = destoroyah.awake arguments...
  monster.skip = true
  monster

###
  Rampage
###
class Rampage extends MonsterEventEmitter
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
    destoroyah.forAll(@f, @_attacks(attacksUsed), @hope, @field, angryness)
    .then (res) =>
      @result = res
      if res.failed
        @_fireEvent 'defeated', res
      else
        @_fireEvent 'defended', res
      res

destoroyah.rampage = (reason, hope, f) ->
  if !f
    f = hope
    hope = hoping.isTrue()
  r = new Rampage(reason, hope, f, destoroyah.field.even)
  destoroyah.bitterStruggle.activeMonster.addRampage r
  r
destoroyah.rrampage = (reason, hope, f) ->
  rampage = destoroyah.rampage arguments...
  rampage.only = true
  rampage

destoroyah.xrampage = (reasion, hope, f) ->
  rampage = destoroyah.rampage arguments...
  rampage.skip = true
  rampage

###
  Setup
###
destoroyah.equipWith = (forceName, f) ->
  destoroyah.bitterStruggle.activeMonster.once 'start', -> attackModule.registerAttack forceName, true, f
  destoroyah.bitterStruggle.activeMonster.once 'end', -> attackModule.unregisterAttack forceName
destoroyah.beforeRampage = (f) ->
  detach = destoroyah.bitterStruggle.activeMonster.on 'start rampage', f
  destoroyah.bitterStruggle.activeMonster.once 'end', -> detach()
destoroyah.afterRampage = (f) ->
  detach = []
  detach.push destoroyah.bitterStruggle.activeMonster.on 'end rampage', f
  detach.push destoroyah.bitterStruggle.activeMonster.on 'error rampage', f
  destoroyah.bitterStruggle.activeMonster.once 'end', -> d() for d in detach
destoroyah.whenAwake = (f) ->
  destoroyah.bitterStruggle.activeMonster.once 'start', f
destoroyah.whenCalm = (f) ->
  destoroyah.bitterStruggle.activeMonster.once 'end', f

###
  main test runner
###

destoroyah.fulfillsHope = (func, args, hope) ->
  new Promise (resolve, reject) ->
    try
      funcRes = func args...
      if funcRes instanceof Promise
        funcRes.then ((res) -> resolve(hope(res) != false)), -> reject arguments...
      else
        resolve(hope(funcRes) != false)
    catch error
      error.__destoroyah = args
      reject(error)
    return

destoroyah.combo = (possibilities) ->
  acc = []
  return acc if possibilities.length == 0
  acc = ([w] for w in possibilities[0])

  return acc if possibilities.length == 1
  for choices in [1..possibilities.length - 1]
    i = []
    for aCase in possibilities[choices]
      for z in acc
        i.push z.concat [aCase]
    acc = i
  acc

class DestoroyahResult
  constructor : (@failed, @angryness, @combos, @lastArguments, startTime) ->
    @time = new Date().getTime() - startTime

class TestRun
  constructor : (@func, @thisAttacks, @hope, @field, @angryness) ->
    @lastArguments = []
    if thisAttacks.length > 0
      @edgeCases = thisAttacks.map (att) -> att.edgeCases().concat [att.execute field]
      @combos = destoroyah.combo @edgeCases
      @allCases = thisAttacks.map (e) -> e.cases()
      @complexity = if @allCases.length > 0 then @allCases.reduce ((acc, e) -> if !e then Infinity else acc * e.length), 1 else 0
    else
      @edgeCases = []
      @angryness = 1
      @combos = []
      @complexity = 0
      @allCases = []
  runEdgeCases : ->
    new Promise (resolve, reject) =>
      if @edgeCases.length > 0
        #consider the edge cases first
        util.cbForEach @combos, (comboArgs, next) =>
          @lastArguments = comboArgs
          destoroyah.fulfillsHope(@func, comboArgs, @hope)
          .then util.either((-> resolve() unless next()), reject), reject
      else
        resolve()
      return
  runNoneDeterministicCases : ->
    new Promise (resolve, reject) =>
      if @complexity == 0 || @angryness == 0
        @lastArguments = []
        destoroyah.fulfillsHope(@func, [], @hope)
        .then util.either(resolve, reject), reject
      else if @complexity <= @angryness
        #reduce the amount of test runs when we are able to run all possible cases with the given angryness
        @angryness = @complexity
        caseCombos = destoroyah.combo @allCases
        util.cbForEach caseCombos, (caseCombo, next) =>
          @lastArguments = caseCombo
          destoroyah.fulfillsHope(@func, caseCombo, @hope)
          .then util.either((-> resolve() unless next()), reject), reject
      else
        #randomly attack the function
        util.cbFor 1, @angryness, (index, next) =>
          args = @thisAttacks.map (a) => a.execute @field
          @lastArguments = args
          destoroyah.fulfillsHope(@func, args, @hope)
          .then util.either((-> resolve() unless next()), reject), reject
      return
  runAll : ->
    startTime = new Date().getTime()
    new Promise (resolve, reject) =>
      resolveCurrentState = (failed) =>
        resolve new DestoroyahResult(failed, @angryness, @combos.length, @lastArguments, startTime)

      @runEdgeCases()
      .then => @runNoneDeterministicCases()
      .then =>
        failed = if 'finally' of @hope then @hope.finally() == false else false
        resolveCurrentState failed
      .catch (e) ->
        if e?
          reject e
        else
          resolveCurrentState true
      return

destoroyah.forAll = (func, thisAttacks, hope, field, angryness) ->
  new TestRun(func, thisAttacks, hope, field, angryness).runAll()
