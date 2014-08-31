#late context binding of setup functions

unboundIncludedFn = {}
boundIncludeFn = {}
extending = []

unboundFn = (context, name) -> -> throw new Error 'Called "' + name + '" out of context "' + context + '"'

bindLater = (context, name) -> ->
  f = boundIncludeFn[context][name]
  f arguments...

#include the function `fn` into the context and register it with the given `name`
exports.include = include = (context, name, fn) ->
  unboundIncludedFn[context] = {} unless context of unboundIncludedFn
  unboundIncludedFn[context][name] = fn
  boundIncludeFn[context] = {} unless context of boundIncludeFn
  boundIncludeFn[context][name] = unboundFn context, name
  bindLaterFn = bindLater context, name
  if context of extending
    for obj in extending[context]
      obj[name] = bindLaterFn
  bindLaterFn

exports.unbind = unbind = (context) -> if context of boundIncludeFn
  for name, fn of boundIncludeFn[context]
    boundIncludeFn[context][name] = unboundFn context, name
  return

bindFn = (fn, obj) -> -> fn.apply obj, arguments

#bind each functions of the given context to `obj`
exports.bindTo = bindTo = (context, obj) -> if context of unboundIncludedFn
  for name, fn of unboundIncludedFn[context]
    boundIncludeFn[context][name] = bindFn fn, obj
  return

#extend `obj` with the functions of the context
exports.extend = (context, obj) ->
  if context of boundIncludeFn
    for name, boundFn of boundIncludeFn[context]
      obj[name] = bindLater context, name
  extending[context] = [] unless context of extending
  extending[context].push obj
  return

#remove the context functions from `obj`
exports.dispose = (context, obj) ->
  if context of boundIncludeFn && context of extending
    index = extending[context].indexOf obj
    if index >= 0
      for name, boundFn of boundIncludeFn[context]
        delete obj[name]
      extending[context].splice index, 1
  return

#run `fn` in the given context where the setup functions are bound to `obj`
exports.execute = (context, obj, fn, args) ->
  bindTo context, obj
  res = fn args...
  unbind context
  res
