var Promise, cbFor, cbForEach, fnArgNames,
  slice = [].slice;

require('setimmediate');

Promise = require('./promise');

exports.argFormat = function(args) {
  var arg, j, len, str;
  str = [];
  for (j = 0, len = args.length; j < len; j++) {
    arg = args[j];
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

exports.fnArgNames = fnArgNames = function(f) {
  var fnParams;
  if (!(fnParams = f.toString().match(/^function\s*?\((.+)\)/))) {
    return [];
  }
  return fnParams[1].split(',').map(function(e) {
    return e.trim();
  });
};

exports.thenable = function(f) {
  var p;
  p = function() {
    var args;
    args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    return new Promise(function(resolve, reject) {
      return f.apply(null, args).then(resolve, reject);
    });
  };
  p._destoroyahArgNames = fnArgNames(f);
  return p;
};

exports.combo = function(possibilities) {
  var aCase, acc, choices, i, j, k, l, len, len1, ref, ref1, w, z;
  acc = [];
  if (possibilities.length === 0) {
    return acc;
  }
  acc = (function() {
    var j, len, ref, results;
    ref = possibilities[0];
    results = [];
    for (j = 0, len = ref.length; j < len; j++) {
      w = ref[j];
      results.push([w]);
    }
    return results;
  })();
  if (possibilities.length === 1) {
    return acc;
  }
  for (choices = j = 1, ref = possibilities.length - 1; 1 <= ref ? j <= ref : j >= ref; choices = 1 <= ref ? ++j : --j) {
    i = [];
    ref1 = possibilities[choices];
    for (k = 0, len = ref1.length; k < len; k++) {
      aCase = ref1[k];
      for (l = 0, len1 = acc.length; l < len1; l++) {
        z = acc[l];
        i.push(z.concat([aCase]));
      }
    }
    acc = i;
  }
  return acc;
};
