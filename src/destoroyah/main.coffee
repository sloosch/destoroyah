fieldModule = require './field'
attackModule = require './attack'
hopingModule = require './hopes'
constants = require './const'

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

class MonsterEventEmitter
  constructor : -> @listeners = {}
  _fireEvent : (eventName, args...) -> (f.apply(@, args) for f in @listeners[eventName]) if eventName of @listeners
  on : (eventName, f) ->
    @listeners[eventName] = [] unless eventName of @listeners
    @listeners[eventName].push f
    =>
      index = @listeners[eventName].indexOf f
      @listeners[eventName].splice index, 1 unless index < 0
  through : (eventName, that, renamedTo, addition...) ->
    @on eventName, =>
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
    @additionalAttack = {}
    @rampages = []
    @befores = []
    @afters = []
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
  _registerAdditionalAttacks : ->
    attackModule.registerAttack attackName, true, attackConstr for attackName, attackConstr of @additionalAttack
    return
  _unregisterAdditionalAttacks : ->
    attackModule.unregisterAttack attackName for attackName, attackConstr of @additionalAttack
    return
  awake : ->
    @reset()
    @setup()
    @_fireEvent 'start'
    res = null
    try
      for rampage in @rampages
        @_fireEvent 'start rampage', rampage
        @_registerAdditionalAttacks()
        try
          before() for before in @befores
          res = rampage.punch @angryness
          after() for after in @afters
          @_fireEvent 'end rampage', rampage, res
        catch error
          @_fireEvent 'error rampage', rampage, error
    finally
      @_unregisterAdditionalAttacks()
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
destoroyah.equipWith = (forceName, f) -> destoroyah.bitterStruggle.activeMonster.additionalAttack[forceName] = -> f()
destoroyah.beforeAttack = (f) -> destoroyah.bitterStruggle.activeMonster.befores.push f
destoroyah.afterAttack = (f) -> destoroyah.bitterStruggle.activeMonster.afters.push f

###
  main test runner
###

destoroyah.fulfillsHope = (func, args, hope) ->
  try
    hope func.apply(null, args)
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
  edgeCases = thisAttacks.map (att) -> att.edgeCases().concat [att.execute field]
  combos = destoroyah.combo edgeCases

  for comboArgs in combos
    unless destoroyah.fulfillsHope func, comboArgs, hope
      return new DestoroyahResult(true, angryness, combos.length, comboArgs, startTime)

  for [1..angryness]
    args = thisAttacks.map (a) -> a.execute field
    unless destoroyah.fulfillsHope func, args, hope
      return new DestoroyahResult(true, angryness, combos.length, args, startTime)

  new DestoroyahResult(false, angryness, combos.length, [], startTime)
