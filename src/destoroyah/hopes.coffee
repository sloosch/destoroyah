exports.hopes = hopeRegistry = {not : (f) -> (v) -> not f v}
exports.registerHope = registerHope = (hopeName, notable = true, f) ->
  hopeRegistry[hopeName] = -> f arguments...
  if notable
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

registerHope hopeName, true, f for hopeName, f of defaultHopes

that = (guard = -> true) ->
  collected = []
  f = (v) ->
    collected.push v if guard v, collected
    return
  maybeNot = (inv, f, args...) -> if not inv then f args... else not f args...
  _finally = (fn, some, inv) ->
    collected.reduce (ff, v) ->
      fn.reduce (hopeAcc, hope) ->
        (!some && hopeAcc && maybeNot inv, hope, v) || (some && (hopeAcc || maybeNot inv, hope, v))
      ,ff
    ,!some
  all : (fn...) ->
    f.finally = ->
      _finally fn, false, false
    f
  none : (fn...) ->
    f.finally = -> _finally fn, false, true
    f
  some : (fn...) ->
    f.finally = -> _finally fn, true, false
    f
  notAll : (fn...) ->
    f.finally = -> _finally fn, true, true
    f
  fulfills : (fn) ->
    f.finally = -> fn collected
    f

registerHope 'that', false, that
