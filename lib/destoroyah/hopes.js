var defaultHopes, f, hopeName, hopeRegistry, registerHope, unregisterHope,
  __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

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
  didHappened: function(hope, prediction) {
    var allResults, f;
    allResults = [];
    f = function(v) {
      allResults.push(v);
    };
    f["finally"] = function() {
      var result, _i, _len;
      for (_i = 0, _len = allResults.length; _i < _len; _i++) {
        result = allResults[_i];
        if (hope(result)) {
          return prediction;
        }
      }
      return !prediction;
    };
    return f;
  },
  sometimes: function(hope) {
    return defaultHopes.didHappened(hope, true);
  },
  never: function(hope) {
    return defaultHopes.didHappened(hope, false);
  }
};

for (hopeName in defaultHopes) {
  f = defaultHopes[hopeName];
  registerHope(hopeName, f);
}
