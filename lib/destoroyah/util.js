var cbFor, cbForEach;

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
  return promise.then(final, final);
};
