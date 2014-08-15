var defaultHopes, f, hopeName, hopeRegistry, registerHope, that, unregisterHope,
  __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
  __slice = [].slice;

exports.hopes = hopeRegistry = {
  not: function(f) {
    return function(v) {
      return !f(v);
    };
  }
};

exports.registerHope = registerHope = function(hopeName, notable, f) {
  if (notable == null) {
    notable = true;
  }
  hopeRegistry[hopeName] = function() {
    return f.apply(null, arguments);
  };
  if (notable) {
    return hopeRegistry.not[hopeName] = function() {
      return hopeRegistry.not(f.apply(null, arguments));
    };
  }
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
  }
};

for (hopeName in defaultHopes) {
  f = defaultHopes[hopeName];
  registerHope(hopeName, true, f);
}

that = function(guard) {
  var collected, maybeNot, _finally;
  if (guard == null) {
    guard = function() {
      return true;
    };
  }
  collected = [];
  f = function(v) {
    if (guard(v, collected)) {
      collected.push(v);
    }
  };
  maybeNot = function() {
    var args, f, inv;
    inv = arguments[0], f = arguments[1], args = 3 <= arguments.length ? __slice.call(arguments, 2) : [];
    if (!inv) {
      return f.apply(null, args);
    } else {
      return !f.apply(null, args);
    }
  };
  _finally = function(fn, some, inv) {
    return collected.reduce(function(ff, v) {
      return fn.reduce(function(hopeAcc, hope) {
        return (!some && hopeAcc &&  maybeNot(inv, hope, v)) || (some && (hopeAcc || maybeNot(inv, hope, v)));
      }, ff);
    }, !some);
  };
  return {
    all: function() {
      var fn;
      fn = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      f["finally"] = function() {
        return _finally(fn, false, false);
      };
      return f;
    },
    none: function() {
      var fn;
      fn = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      f["finally"] = function() {
        return _finally(fn, false, true);
      };
      return f;
    },
    some: function() {
      var fn;
      fn = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      f["finally"] = function() {
        return _finally(fn, true, false);
      };
      return f;
    },
    notAll: function() {
      var fn;
      fn = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      f["finally"] = function() {
        return _finally(fn, true, true);
      };
      return f;
    },
    fulfills: function(fn) {
      f["finally"] = function() {
        return fn(collected);
      };
      return f;
    }
  };
};

registerHope('that', false, that);
