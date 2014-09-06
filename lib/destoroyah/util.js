var Promise, cbFor, cbForEach;

require('setimmediate');

Promise = require('./promise');

exports.argFormat = function(args) {
  var arg, str, _i, _len;
  str = [];
  for (_i = 0, _len = args.length; _i < _len; _i++) {
    arg = args[_i];
    str.push((function() {
      if (arg === null) {
        return '<NULL>';
      } else {
        switch (typeof arg) {
          case 'undefined':
            return '<undefined>';
          case 'string':
            if (arg.length === 0) {
              return '<empty string>';
            } else {
              return '“' + arg + '”';
            }
          case 'number':
            return arg;
          case 'boolean':
            if (arg === true) {
              return '<TRUE>';
            } else {
              return '<FALSE>';
            }
          case 'object':
            return JSON.stringify(arg);
        }
      }
    })());
  }
  if (str.length > 0) {
    return str.join(', ');
  } else {
    return '<no arguments>';
  }
};

exports.cbForEach = cbForEach = function(items, cb, startIndex) {
  if (startIndex == null) {
    startIndex = 0;
  }
  if (startIndex > (items.length - 1)) {
    return false;
  } else {
    setImmediate(cb, items[startIndex], (function() {
      return cbForEach(items, cb, startIndex + 1);
    }));
    return true;
  }
};

exports.cbFor = cbFor = function(start, end, cb) {
  if (start > end) {
    return false;
  } else {
    setImmediate(cb, start, (function() {
      return cbFor(start + 1, end, cb);
    }));
    return true;
  }
};

exports.either = function(left, right) {
  return function(useLeft) {
    if (useLeft) {
      return left();
    } else {
      return right();
    }
  };
};

exports["finally"] = function(promise, final) {
  return promise.then(function(r) {
    return final() || r;
  })["catch"](function(e) {
    final();
    return Promise.reject(e);
  });
};

exports.combo = function(possibilities) {
  var aCase, acc, choices, i, w, z, _i, _j, _k, _len, _len1, _ref, _ref1;
  acc = [];
  if (possibilities.length === 0) {
    return acc;
  }
  acc = (function() {
    var _i, _len, _ref, _results;
    _ref = possibilities[0];
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      w = _ref[_i];
      _results.push([w]);
    }
    return _results;
  })();
  if (possibilities.length === 1) {
    return acc;
  }
  for (choices = _i = 1, _ref = possibilities.length - 1; 1 <= _ref ? _i <= _ref : _i >= _ref; choices = 1 <= _ref ? ++_i : --_i) {
    i = [];
    _ref1 = possibilities[choices];
    for (_j = 0, _len = _ref1.length; _j < _len; _j++) {
      aCase = _ref1[_j];
      for (_k = 0, _len1 = acc.length; _k < _len1; _k++) {
        z = acc[_k];
        i.push(z.concat([aCase]));
      }
    }
    acc = i;
  }
  return acc;
};
