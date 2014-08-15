exports.hopes = hopeRegistry = {not : (f) -> (v) -> not f v}
exports.registerHope = registerHope = (hopeName, f) ->
  hopeRegistry[hopeName] = -> f arguments...
  hopeRegistry.not[hopeName] = -> hopeRegistry.not(f arguments...)
exports.unregisterHope = unregisterHope = (hopeName) -> delete hopeRegistry[hopeName]

defaultHopes =
  isTruthy : -> (v) -> typeof v != 'undefined' && v != 0 && v != false && v != null && v == v
  isTrue : -> (v) -> v == true
  isFalse :  -> (v) -> v == false
  isEqual : (r) -> (v) -> r == v
  isDefined : -> (v) -> typeof v != 'undefined'
  isPositive : (zero) -> (v) -> v > 0 || (zero && v == 0)
  isNull : -> (v) -> v == null
  isInRange : (from, to, edge) -> (v) -> v > from && v < to || (edge && (v == from || v == to))
  isOneOf : (arr) -> (v) -> v in arr
  didHappened : (hope, prediction) ->
    allResults = []
    f = (v) ->
      allResults.push v
      return
    f.finally = ->
      for result in allResults
        return prediction if hope(result)
      !prediction
    f
  sometimes : (hope) -> defaultHopes.didHappened(hope, yes)
  never : (hope) -> defaultHopes.didHappened(hope, no)

registerHope hopeName, f for hopeName, f of defaultHopes
