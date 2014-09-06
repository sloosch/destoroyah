Promise = require './promise'

exports.MonsterEventEmitter = class MonsterEventEmitter
  constructor : ->
    @listeners = {}
    @_eventId = 0
  _fireEvent : (eventName, args...) ->
    return Promise.resolve() unless eventName of @listeners
    Promise.all(
      for id, f of @listeners[eventName]
        res = f.apply @, args
        if res instanceof Promise then res else Promise.resolve res
    )
  on : (eventName, f) ->
    @_eventId++
    @listeners[eventName] = {} unless eventName of @listeners
    eventId = eventName + '_' + @_eventId
    @listeners[eventName][eventId] = f
    => delete @listeners[eventName][eventId]
  once : (eventName, f) ->
    detach = @.on eventName, ->
      res = f.apply @, arguments
      detach()
      res
    return
  through : (eventName, that, renamedTo, addition...) ->
    @on eventName, ->
      args = [@]
      args = args.concat if arguments.length > 0 then (arg for arg in arguments) else []
      args.unshift renamedTo || eventName
      args = args.concat addition if addition?
      that._fireEvent.apply that, args
      return
