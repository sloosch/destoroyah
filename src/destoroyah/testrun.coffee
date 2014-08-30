Promise = require './promise'
util = require './util'
hopes = require './hopes'

exports.DestoroyahResult = class DestoroyahResult
  constructor : (@failed, @angryness, @combos, @lastArguments, startTime) ->
    @time = new Date().getTime() - startTime

exports.TestRun = class TestRun
  constructor : (@func, @thisAttacks, @hope, @field, @angryness) ->
    @lastArguments = []
    if thisAttacks.length > 0
      @edgeCases = thisAttacks.map (att) -> att.edgeCases().concat [att.execute field]
      @combos = util.combo @edgeCases
      @allCases = thisAttacks.map (e) -> e.cases()
      @complexity = if @allCases.length > 0 then @allCases.reduce ((acc, e) -> if !e then Infinity else acc * e.length), 1 else 0
    else
      @edgeCases = []
      @angryness = 1
      @combos = []
      @complexity = 0
      @allCases = []
  runEdgeCases : -> new Promise (resolve, reject) =>
    if @edgeCases.length > 0
      #consider the edge cases first
      util.cbForEach @combos, (comboArgs, next) =>
        @lastArguments = comboArgs
        hopes.fulfillsHope(@func, comboArgs, @hope)
        .then util.either((-> resolve() unless next()), reject), reject
    else
      resolve()
    return
  runNoneDeterministicCases : -> new Promise (resolve, reject) =>
    if @complexity == 0 || @angryness == 0
      @lastArguments = []
      hopes.fulfillsHope(@func, [], @hope)
      .then util.either(resolve, reject), reject
    else if @complexity <= @angryness
      #reduce the amount of test runs when we are able to run all possible cases with the given angryness
      @angryness = @complexity
      caseCombos = util.combo @allCases
      util.cbForEach caseCombos, (caseCombo, next) =>
        @lastArguments = caseCombo
        hopes.fulfillsHope(@func, caseCombo, @hope)
        .then util.either((-> resolve() unless next()), reject), reject
    else
      #randomly attack the function
      util.cbFor 1, @angryness, (index, next) =>
        args = @thisAttacks.map (a) => a.execute @field
        @lastArguments = args
        hopes.fulfillsHope(@func, args, @hope)
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

exports.forAll = (func, thisAttacks, hope, field, angryness) ->
  new TestRun(func, thisAttacks, hope, field, angryness).runAll()
