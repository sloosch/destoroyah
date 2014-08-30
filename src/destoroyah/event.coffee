exports.MonsterEventEmitter = class MonsterEventEmitter
  constructor : ->
    @listeners = {}
    @_eventId = 0
  _fireEvent : (eventName, args...) ->
    return unless eventName of @listeners
    f.apply @, args for id, f of @listeners[eventName]
  on : (eventName, f) ->
    @_eventId++
    @listeners[eventName] = {} unless eventName of @listeners
    eventId = eventName + '_' + @_eventId
    @listeners[eventName][eventId] = f
    => delete @listeners[eventName][eventId]
  once : (eventName, f) ->
    detach = @.on eventName, ->
      f.apply @, arguments
      detach()
  through : (eventName, that, renamedTo, addition...) ->
    @on eventName, ->
      args = [@]
      args = args.concat if arguments.length > 0 then (arg for arg in arguments) else []
      args.unshift renamedTo || eventName
      args = args.concat addition if addition?
      that._fireEvent.apply that, args
