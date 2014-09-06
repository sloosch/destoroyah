require 'setimmediate'
Promise = require './promise'

exports.argFormat = (args) ->
  str = []
  for arg in args
    str.push if arg == null then '<NULL>'
    else
      switch typeof arg
        when 'undefined' then '<undefined>'
        when 'string' then (if arg.length == 0 then '<empty string>' else '“' + arg + '”')
        when 'number' then arg
        when 'boolean' then (if arg == true then '<TRUE>' else '<FALSE>')
        when 'object' then JSON.stringify(arg)
  if str.length > 0 then str.join ', ' else '<no arguments>'

exports.cbForEach = cbForEach = (items, cb, startIndex = 0) ->
  if startIndex > (items.length - 1)
    false
  else
    setImmediate cb, items[startIndex], (-> cbForEach items, cb, startIndex + 1)
    true

exports.cbFor = cbFor = (start, end, cb) ->
  if start > end
    false
  else
    setImmediate cb, start, (-> cbFor start + 1, end, cb)
    true

exports.either = (left, right) -> (useLeft) ->
  if useLeft then left() else right()


exports.finally = (promise, final) ->
  promise
  .then (r) -> final() || r
  .catch (e) ->
    final()
    Promise.reject e

exports.combo = (possibilities) ->
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
