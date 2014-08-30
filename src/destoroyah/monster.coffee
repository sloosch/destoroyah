MonsterEventEmitter = require('./event').MonsterEventEmitter
util = require './util'
Promise = require './promise'
setup = require './setup'
hoping = require('./hopes').hopes
Rampage = require('./rampage').Rampage
attackModule = require './attack'
field = require './field'

#context holder for rampages
exports.Destoroyah = class Destoroyah extends MonsterEventEmitter
  reset : ->
    @rampages = []
    f() for f in @detach if @detach?
    @detach = []
  constructor : (@reason, @angryness, @setupFn) ->
    @only = false
    @skip = false
    @reset()
    super()
  setup : ->
    @reset()
    setup.execute 'monster', @, @setupFn
    return
  #add a rampage to the monster
  addRampage : (rampage) ->
    unless rampage in @rampages
      @detach.push rampage.through 'defended', @
      @detach.push rampage.through 'defeated', @
      @rampages.push rampage
    return
  #runs each rampage
  _runEachRampage : -> new Promise (resolve, reject) =>
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
  #runs each rampage
  #returns a promise
  awake : ->
    @_fireEvent 'start'
    util.finally @_runEachRampage(), => @_fireEvent 'end'

setup.include 'monster', 'equipWith', (forceName, f) ->
  @.once 'start', -> attackModule.registerAttack forceName, true, f
  @.once 'end', -> attackModule.unregisterAttack forceName
  return
setup.include 'monster', 'beforeRampage', (f) ->
  detach = @.on 'start rampage', f
  @.once 'end', -> detach()
  return
setup.include 'monster', 'afterRampage', (f) ->
  detach = []
  detach.push @.on 'end rampage', f
  detach.push @.on 'error rampage', f
  @.once 'monster', 'end', -> d() for d in detach
  return
setup.include 'monster', 'whenAwake', (f) ->
  @.once 'start', f
  return
setup.include 'monster', 'whenCalm', (f) ->
  @.once 'end', f
  return

setupRampage = setup.include 'monster', 'rampage', (reason, hope, f) ->
  if !f
    f = hope
    hope = hoping.isTrue()
  r = new Rampage(reason, hope, f, field.even)
  @.addRampage r
  r

setup.include 'monster', 'rrampage', (reason, hope, f) ->
  rampage = setupRampage arguments...
  rampage.only = true
  rampage

setup.include 'monster', 'xrampage', (reason, hope, f) ->
  rampage = setupRampage arguments...
  rampage.skip = true
  rampage
