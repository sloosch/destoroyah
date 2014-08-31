MonsterEventEmitter = require('./event').MonsterEventEmitter
Destoroyah = require('./monster').Destoroyah
setup = require './setup'
Promise = require './promise'
DEFAULT_ANGRYNESS = require('./const').DEFAULT_ANGRYNESS
util = require './util'

#main context holder
class BitterStruggle extends MonsterEventEmitter
  constructor : ->
    @monsters = []
    @detach = []
    super()
  #add a monster to the context
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
  #run the setup of each monster
  _setup : ->
    for monster in @monsters
      monster.setup()
    return
  #run the rampage of each monster
  _runEachMonster : -> new Promise (resolve, reject) =>
    hasBrokenThrough = false
    runOn = @monsters
    onlyMonsters = runOn.filter (m) -> m.only
    runOn = onlyMonsters if onlyMonsters.length > 0
    runOn = runOn.filter (m) -> !m.skip
    resolve(false) if runOn.length == 0
    util.cbForEach runOn, (monster, next) ->
      monster.awake().then (broken) ->
        hasBrokenThrough ||= broken
        resolve(hasBrokenThrough) unless next()
      , reject
    return
  #starts the fight by running each monster
  #will return a Promise which is resolved with a boolean
  #indicating whether the run was successful
  fight : ->
    @_setup()
    @_fireEvent 'start'
    util.finally @_runEachMonster(), => @_fireEvent 'end'
  surrender : ->
    f() for f in @detach
    @detach = []
    @monsters = []

setupAwake = setup.include 'struggle', 'awake', (reason, angryness, setup) ->
  if not setup?
    setup = angryness
    angryness = DEFAULT_ANGRYNESS
  @addMonster new Destoroyah(reason, angryness, setup)

setup.include 'struggle', 'aawake', (reason, angryness, setup) ->
  monster = setupAwake arguments...
  monster.only = true
  monster

setup.include 'struggle', 'xawake', (reason, angryness, setup) ->
  monster = setupAwake arguments...
  monster.skip = true
  monster

exports.bitterStruggle = new BitterStruggle()
setup.bindTo 'struggle', exports.bitterStruggle
