var MonsterEventEmitter, Promise,
  slice = [].slice;

Promise = require('./promise');

exports.MonsterEventEmitter = MonsterEventEmitter = (function() {
  function MonsterEventEmitter() {
    this.listeners = {};
    this._eventId = 0;
  }

  MonsterEventEmitter.prototype._fireEvent = function() {
    var args, eventName, f, id, res;
    eventName = arguments[0], args = 2 <= arguments.length ? slice.call(arguments, 1) : [];
    if (!(eventName in this.listeners)) {
      return Promise.resolve();
    }
    return Promise.all((function() {
      var ref, results;
      ref = this.listeners[eventName];
      results = [];
      for (id in ref) {
        f = ref[id];
        res = f.apply(this, args);
        if (res instanceof Promise) {
          results.push(res);
        } else {
          results.push(Promise.resolve(res));
        }
      }
      return results;
    }).call(this));
  };

  MonsterEventEmitter.prototype.on = function(eventName, f) {
    var eventId;
    this._eventId++;
    if (!(eventName in this.listeners)) {
      this.listeners[eventName] = {};
    }
    eventId = eventName + '_' + this._eventId;
    this.listeners[eventName][eventId] = f;
    return (function(_this) {
      return function() {
        return delete _this.listeners[eventName][eventId];
      };
    })(this);
  };

  MonsterEventEmitter.prototype.once = function(eventName, f) {
    var detach;
    detach = this.on(eventName, function() {
      var res;
      res = f.apply(this, arguments);
      detach();
      return res;
    });
  };

  MonsterEventEmitter.prototype.through = function() {
    var addition, eventName, renamedTo, that;
    eventName = arguments[0], that = arguments[1], renamedTo = arguments[2], addition = 4 <= arguments.length ? slice.call(arguments, 3) : [];
    return this.on(eventName, function() {
      var arg, args;
      args = [this];
      args = args.concat(arguments.length > 0 ? (function() {
        var i, len, results;
        results = [];
        for (i = 0, len = arguments.length; i < len; i++) {
          arg = arguments[i];
          results.push(arg);
        }
        return results;
      }).apply(this, arguments) : []);
      args.unshift(renamedTo || eventName);
      if (addition != null) {
        args = args.concat(addition);
      }
      that._fireEvent.apply(that, args);
    });
  };

  return MonsterEventEmitter;

})();
