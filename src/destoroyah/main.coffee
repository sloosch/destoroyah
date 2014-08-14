fieldModule = require './field'
attackModule = require './attack'
hopingModule = require './hopes'
constants = require './const'
util = require './util'
field = fieldModule
attack = attackModule.attacks
hoping = hopingModule.hopes

###
  Globals
###
module.exports = destoroyah =
  field : field
  attack : attack
  hoping : hoping
  constants : constants
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
  fight : ->
    @_fireEvent 'start'
    try
      for monster in @monsters
        @activeMonster = monster
        monster.awake()
    finally
      @_fireEvent 'end'
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
    @reset()
    super()
  addRampage : (rampage) ->
    unless rampage in @rampages
      @detach.push rampage.through 'defended', @
      @detach.push rampage.through 'defeated', @
      @rampages.push rampage
    return
  awake : ->
    @reset()
    @setup()
    @_fireEvent 'start'
    res = null
    try
      for rampage in @rampages
        @_fireEvent 'start rampage', rampage
        try
          res = rampage.punch @angryness
          @_fireEvent 'end rampage', rampage, res
        catch error
          @_fireEvent 'error rampage', rampage, error
    finally
      @_fireEvent 'end'
    return

destoroyah.awake = (reason, angryness, setup) ->
  if not setup?
    setup = angryness
    angryness = 100
  destoroyah.bitterStruggle.addMonster new Destoroyah(reason, angryness, setup)

###
  Rampage
###
class Rampage extends MonsterEventEmitter
  @_lastId = 0
  constructor : (@reason, @hope, @f, @field) ->
    @id = Rampage._lastId++
    super()
  _attackWith: (att, angryness) -> destoroyah.forAll @f, att, @hope, @field, angryness
  attacks : ->
    return [] unless fnParams = @f.toString().match(/function\s*?\((.+)\)/)
    attackNames =fnParams[1].split ','
    attackNames.map (genName) =>
      [attackName] = genName.split '_'
      attackName = attackName.trim()
      return attack[attackName]() if attackName of attack
      throw new Error('Attack "' + attackName + '" not found for rampage ' + @reason + ', not equipped?')
  punch : (angryness) ->
    res = @_attackWith @attacks(), angryness
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
  try
    hope(func.apply(null, args)) != false #returning none booleans is OK
  catch error
    error.__destoroyah = args
    throw error


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

destoroyah.forAll = (func, thisAttacks, hope, field, angryness) ->
  startTime = new Date().getTime()
  if thisAttacks.length > 0
    #consider the edge cases first
    edgeCases = thisAttacks.map (att) -> att.edgeCases().concat [att.execute field]
    combos = destoroyah.combo edgeCases
    for comboArgs in combos
      unless destoroyah.fulfillsHope func, comboArgs, hope
        return new DestoroyahResult(true, angryness, combos.length, comboArgs, startTime)

    #reduce the amount of test runs when we are able to run all possible cases with the given angryness
    allCases = thisAttacks.map (e) -> e.cases()
    complexity = if allCases.length > 0 then allCases.reduce ((acc, e) -> if !e then Infinity else acc * e.length), 1 else 0
    if complexity <= angryness
      angryness = complexity
      caseCombos = destoroyah.combo allCases
      for caseCombo in caseCombos
        unless destoroyah.fulfillsHope func, caseCombo, hope
          return new DestoroyahResult(true, angryness, combos.length, caseCombo, startTime)
    else
      #randomly attack the function
      for [1..angryness]
        args = thisAttacks.map (a) -> a.execute field
        unless destoroyah.fulfillsHope func, args, hope
          return new DestoroyahResult(true, angryness, combos.length, args, startTime)
  else
    angryness = 1
    combos = []
    unless destoroyah.fulfillsHope func, [], hope
      return new DestoroyahResult(true, angryness, 0, [], startTime)

  failed = if 'finally' of hope then hope.finally() == false else false
  new DestoroyahResult(failed, angryness, combos.length, [], startTime)
