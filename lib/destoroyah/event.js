var MonsterEventEmitter, Promise,
  __slice = [].slice;

Promise = require('./promise');

exports.MonsterEventEmitter = MonsterEventEmitter = (function() {
  function MonsterEventEmitter() {
    this.listeners = {};
    this._eventId = 0;
  }

  MonsterEventEmitter.prototype._fireEvent = function() {
    var args, eventName, f, id, res;
    eventName = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
    if (!(eventName in this.listeners)) {
      return Promise.resolve();
    }
    return Promise.all((function() {
      var _ref, _results;
      _ref = this.listeners[eventName];
      _results = [];
      for (id in _ref) {
        f = _ref[id];
        res = f.apply(this, args);
        if (res instanceof Promise) {
          _results.push(res);
        } else {
          _results.push(Promise.resolve(res));
        }
      }
      return _results;
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
    eventName = arguments[0], that = arguments[1], renamedTo = arguments[2], addition = 4 <= arguments.length ? __slice.call(arguments, 3) : [];
    return this.on(eventName, function() {
      var arg, args;
      args = [this];
      args = args.concat(arguments.length > 0 ? (function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = arguments.length; _i < _len; _i++) {
          arg = arguments[_i];
          _results.push(arg);
        }
        return _results;
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
