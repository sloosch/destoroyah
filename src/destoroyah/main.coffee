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
destoroyah =
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
    @listeners[eventName] = [] if eventName not of @listeners
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

argFormat = (args) ->
  str = []
  for arg in args
    str.push if arg == null then '<NULL>'
    else
      switch typeof arg
        when 'undefined' then '<undefined>'
        when 'string' then (if arg.length == 0 then '<empty string>' else arg)
        when 'number' then arg
        when 'boolean' then (if arg == true then '<TRUE>' else '<FALSE>')
        when 'object' then JSON.stringify(arg)
  str.join ', '

destoroyah.argFormat = argFormat

logReporter = -> (bitterStruggle) ->
  detach = []
  results = []
  detach.push bitterStruggle.on 'start', ->
    console.log 'Fight started'
  detach.push  bitterStruggle.on 'awake monster', (monster) ->
    console.log 'The monster awakes: ' + monster.reason
  detach.push bitterStruggle.on 'calm monster', (monster) ->
    console.log 'The monster calms down and may walks away'
  detach.push bitterStruggle.on 'start rampage', (monster, rampage) ->
    console.log 'Preparing for rampage ' + monster.reason + ' ' + rampage.reason
  detach.push bitterStruggle.on 'end rampage', (monster, rampage) ->
    console.log 'Rampage ended ' + monster.reason + ' ' + rampage.reason
  detach.push bitterStruggle.on 'defended', (monster, rampage, result) ->
    console.log 'Defended ' + result.angryness + ' attacks and ' + result.combos + ' specials from ' + monster.reason + ' ' + rampage.reason
    results.push result
  detach.push bitterStruggle.on 'defeated', (monster, rampage, result) ->
    console.error 'Defeated by the monster ' + monster.reason + ' ' + rampage.reason + ' : ' + argFormat(result.lastArguments)
    results.push result
  detach.push bitterStruggle.on 'error rampage', (monster, rampage, error) ->
    msg = 'Found a weak spot, fight ended unfair with error ' + error
    msg += '\nfought with arguments ' + argFormat(error.__destoroyah) if error.__destoroyah?
    console.error msg
  detach.push bitterStruggle.on 'end', ->
    console.log 'Fight ended'
    f() for f in detach
    fails = results.reduce ((acc, r) -> if r.failed then acc + 1 else acc), 0
    attacks = results.reduce ((acc, r) -> acc + r.combos + r.angryness), 0
    console.log 'Failed to defeat ' + fails + ' rampages, monsters have attacked ' + attacks + ' times'

destoroyah.logReporter = logReporter


###
  Awakening
###
class Destoroyah extends MonsterEventEmitter
  reset : ->
    @additionalAttack = {}
    @rampages = []
    @befores = []
    @afters = []
  constructor : (@reason, @angryness, @setup) ->
    @detach = []
    @reset()
    super()
  addRampage : (rampage) ->
    if rampage not in @rampages
      @detach.push rampage.through 'defended', @
      @detach.push rampage.through 'defeated', @
      @rampages.push rampage
      rampage.setMonster @
  surrender : ->
    f() for f in @detach
    @detach = []
    @reset()
  awake : ->
    @reset()
    @setup()
    @_fireEvent 'start'
    res = null
    try
      for rampage in @rampages
        @_fireEvent 'start rampage', rampage
        try
          before() for before in @befores
          res = rampage.punch()
          after() for after in @afters
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
    @monster = null
    super()
  setMonster : (monster) ->
    @monster = monster
    monster.addRampage @ if @ not in monster.rampages
  _attackWith: (att) -> destoroyah.forAll @f, att, @hope, @field, @monster.angryness
  attacks : ->
    return [] unless fnParams = @f.toString().match(/function\s*?\((.+)\)/)
    attackNames =fnParams[1].split ','
    attackNames.map (genName) =>
      [attackName] = genName.split '_'
      attackName = attackName.trim()
      return destoroyah.attack[attackName]() if attackName of destoroyah.attack
      return @monster.additionalAttack[attackName]() if attackName of @monster?.additionalAttack
      throw new Error('Attack "' + attackName + '" not found for rampage ' + @reason + ', not equipped?')
  punch : ->
    res = @_attackWith @attacks()
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
  r.setMonster destoroyah.bitterStruggle.activeMonster
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


destoroyah.combo = (t...) ->
  q = []
  return q if t.length == 0
  q = ([w] for w in t[0])

  return q if t.length == 1
  for d in [1..t.length - 1]
    i = []
    for r in t[d]
      for z in q
        i.push z.concat r
    q = i
  q

class DestoroyahResult
  constructor : (@failed, @angryness, @combos, @lastArguments, startTime) ->
    @time = new Date().getTime() - startTime

destoroyah.forAll = (func, thisAttacks, hope, field, angryness) ->
  startTime = new Date().getTime()
  combos = []
  edgeCases = thisAttacks.reduce (acc, a) ->
    aCase = a.edgeCases().concat a.execute field
    acc.push if aCase.length != 0 then aCase else [a.execute field]
    acc
  , []
  combos = destoroyah.combo.apply null, edgeCases

  for comboArgs in combos
    return new DestoroyahResult(true, angryness, combos.length, comboArgs, startTime) unless destoroyah.fulfillsHope func, comboArgs, hope

  for [1..angryness]
    args = thisAttacks.map (a) -> a.execute field
    return new DestoroyahResult(true, angryness, combos.length, args, startTime) unless destoroyah.fulfillsHope func, args, hope

  new DestoroyahResult(false, angryness, combos.length, [], startTime)

if typeof window == 'undefined'
  module.exports = destoroyah
else
  window.destoroyah = destoroyah
  window.awake = destoroyah.awake
  window.rampage = destoroyah.rampage
  window.equipWith = destoroyah.equipWith
  window.beforeAttack = destoroyah.beforeAttack
  window.afterAttack = destoroyah.afterAttack
  window.hoping = destoroyah.hoping
  window.attack = destoroyah.attack
  window.field = destoroyah.field
