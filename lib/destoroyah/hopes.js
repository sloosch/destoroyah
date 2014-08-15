var defaultHopes, f, hopeName, hopeRegistry, registerHope, unregisterHope,
  __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
  __slice = [].slice;

exports.hopes = hopeRegistry = {
  not: function(f) {
    return function(v) {
      return !f(v);
    };
  }
};

exports.registerHope = registerHope = function(hopeName, f) {
  hopeRegistry[hopeName] = function() {
    return f.apply(null, arguments);
  };
  return hopeRegistry.not[hopeName] = function() {
    return hopeRegistry.not(f.apply(null, arguments));
  };
};

exports.unregisterHope = unregisterHope = function(hopeName) {
  return delete hopeRegistry[hopeName];
};

defaultHopes = {
  isTruthy: function() {
    return function(v) {
      return typeof v !== 'undefined' && v !== 0 && v !== false && v !== null && v === v;
    };
  },
  isTrue: function() {
    return function(v) {
      return v === true;
    };
  },
  isFalse: function() {
    return function(v) {
      return v === false;
    };
  },
  isEqual: function(r) {
    return function(v) {
      return r === v;
    };
  },
  isDefined: function() {
    return function(v) {
      return typeof v !== 'undefined';
    };
  },
  isPositive: function(zero) {
    return function(v) {
      return v > 0 || (zero && v === 0);
    };
  },
  isNull: function() {
    return function(v) {
      return v === null;
    };
  },
  isInRange: function(from, to, edge) {
    return function(v) {
      return v > from && v < to || (edge && (v === from || v === to));
    };
  },
  isOneOf: function(arr) {
    return function(v) {
      return __indexOf.call(arr, v) >= 0;
    };
  },
  didHappened: function() {
    var allResults, f, hopes, prediction, _i;
    hopes = 2 <= arguments.length ? __slice.call(arguments, 0, _i = arguments.length - 1) : (_i = 0, []), prediction = arguments[_i++];
    allResults = [];
    f = function(v) {
      allResults.push(v);
    };
    f["finally"] = function() {
      var result, _j, _len;
      for (_j = 0, _len = allResults.length; _j < _len; _j++) {
        result = allResults[_j];
        if (hopes.reduce((function(acc, f) {
          return acc || f(result);
        }), false)) {
          return prediction;
        }
      }
      return !prediction;
    };
    return f;
  },
  sometimes: function() {
    var hopes;
    hopes = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    return defaultHopes.didHappened.apply(defaultHopes, __slice.call(hopes).concat([true]));
  },
  never: function() {
    var hopes;
    hopes = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    return defaultHopes.didHappened.apply(defaultHopes, __slice.call(hopes).concat([false]));
  }
};

for (hopeName in defaultHopes) {
  f = defaultHopes[hopeName];
  registerHope(hopeName, f);
}
