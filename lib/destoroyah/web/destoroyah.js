(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";
var Promise = require("./promise/promise").Promise;
var polyfill = require("./promise/polyfill").polyfill;
exports.Promise = Promise;
exports.polyfill = polyfill;
},{"./promise/polyfill":5,"./promise/promise":6}],2:[function(require,module,exports){
"use strict";
/* global toString */

var isArray = require("./utils").isArray;
var isFunction = require("./utils").isFunction;

/**
  Returns a promise that is fulfilled when all the given promises have been
  fulfilled, or rejected if any of them become rejected. The return promise
  is fulfilled with an array that gives all the values in the order they were
  passed in the `promises` array argument.

  Example:

  ```javascript
  var promise1 = RSVP.resolve(1);
  var promise2 = RSVP.resolve(2);
  var promise3 = RSVP.resolve(3);
  var promises = [ promise1, promise2, promise3 ];

  RSVP.all(promises).then(function(array){
    // The array here would be [ 1, 2, 3 ];
  });
  ```

  If any of the `promises` given to `RSVP.all` are rejected, the first promise
  that is rejected will be given as an argument to the returned promises's
  rejection handler. For example:

  Example:

  ```javascript
  var promise1 = RSVP.resolve(1);
  var promise2 = RSVP.reject(new Error("2"));
  var promise3 = RSVP.reject(new Error("3"));
  var promises = [ promise1, promise2, promise3 ];

  RSVP.all(promises).then(function(array){
    // Code here never runs because there are rejected promises!
  }, function(error) {
    // error.message === "2"
  });
  ```

  @method all
  @for RSVP
  @param {Array} promises
  @param {String} label
  @return {Promise} promise that is fulfilled when all `promises` have been
  fulfilled, or rejected if any of them become rejected.
*/
function all(promises) {
  /*jshint validthis:true */
  var Promise = this;

  if (!isArray(promises)) {
    throw new TypeError('You must pass an array to all.');
  }

  return new Promise(function(resolve, reject) {
    var results = [], remaining = promises.length,
    promise;

    if (remaining === 0) {
      resolve([]);
    }

    function resolver(index) {
      return function(value) {
        resolveAll(index, value);
      };
    }

    function resolveAll(index, value) {
      results[index] = value;
      if (--remaining === 0) {
        resolve(results);
      }
    }

    for (var i = 0; i < promises.length; i++) {
      promise = promises[i];

      if (promise && isFunction(promise.then)) {
        promise.then(resolver(i), reject);
      } else {
        resolveAll(i, promise);
      }
    }
  });
}

exports.all = all;
},{"./utils":10}],3:[function(require,module,exports){
(function (process,global){
"use strict";
var browserGlobal = (typeof window !== 'undefined') ? window : {};
var BrowserMutationObserver = browserGlobal.MutationObserver || browserGlobal.WebKitMutationObserver;
var local = (typeof global !== 'undefined') ? global : (this === undefined? window:this);

// node
function useNextTick() {
  return function() {
    process.nextTick(flush);
  };
}

function useMutationObserver() {
  var iterations = 0;
  var observer = new BrowserMutationObserver(flush);
  var node = document.createTextNode('');
  observer.observe(node, { characterData: true });

  return function() {
    node.data = (iterations = ++iterations % 2);
  };
}

function useSetTimeout() {
  return function() {
    local.setTimeout(flush, 1);
  };
}

var queue = [];
function flush() {
  for (var i = 0; i < queue.length; i++) {
    var tuple = queue[i];
    var callback = tuple[0], arg = tuple[1];
    callback(arg);
  }
  queue = [];
}

var scheduleFlush;

// Decide what async method to use to triggering processing of queued callbacks:
if (typeof process !== 'undefined' && {}.toString.call(process) === '[object process]') {
  scheduleFlush = useNextTick();
} else if (BrowserMutationObserver) {
  scheduleFlush = useMutationObserver();
} else {
  scheduleFlush = useSetTimeout();
}

function asap(callback, arg) {
  var length = queue.push([callback, arg]);
  if (length === 1) {
    // If length is 1, that means that we need to schedule an async flush.
    // If additional callbacks are queued before the queue is flushed, they
    // will be processed by this flush that we are scheduling.
    scheduleFlush();
  }
}

exports.asap = asap;
}).call(this,require("oMfpAn"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"oMfpAn":11}],4:[function(require,module,exports){
"use strict";
var config = {
  instrument: false
};

function configure(name, value) {
  if (arguments.length === 2) {
    config[name] = value;
  } else {
    return config[name];
  }
}

exports.config = config;
exports.configure = configure;
},{}],5:[function(require,module,exports){
(function (global){
"use strict";
/*global self*/
var RSVPPromise = require("./promise").Promise;
var isFunction = require("./utils").isFunction;

function polyfill() {
  var local;

  if (typeof global !== 'undefined') {
    local = global;
  } else if (typeof window !== 'undefined' && window.document) {
    local = window;
  } else {
    local = self;
  }

  var es6PromiseSupport = 
    "Promise" in local &&
    // Some of these methods are missing from
    // Firefox/Chrome experimental implementations
    "resolve" in local.Promise &&
    "reject" in local.Promise &&
    "all" in local.Promise &&
    "race" in local.Promise &&
    // Older version of the spec had a resolver object
    // as the arg rather than a function
    (function() {
      var resolve;
      new local.Promise(function(r) { resolve = r; });
      return isFunction(resolve);
    }());

  if (!es6PromiseSupport) {
    local.Promise = RSVPPromise;
  }
}

exports.polyfill = polyfill;
}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./promise":6,"./utils":10}],6:[function(require,module,exports){
"use strict";
var config = require("./config").config;
var configure = require("./config").configure;
var objectOrFunction = require("./utils").objectOrFunction;
var isFunction = require("./utils").isFunction;
var now = require("./utils").now;
var all = require("./all").all;
var race = require("./race").race;
var staticResolve = require("./resolve").resolve;
var staticReject = require("./reject").reject;
var asap = require("./asap").asap;

var counter = 0;

config.async = asap; // default async is asap;

function Promise(resolver) {
  if (!isFunction(resolver)) {
    throw new TypeError('You must pass a resolver function as the first argument to the promise constructor');
  }

  if (!(this instanceof Promise)) {
    throw new TypeError("Failed to construct 'Promise': Please use the 'new' operator, this object constructor cannot be called as a function.");
  }

  this._subscribers = [];

  invokeResolver(resolver, this);
}

function invokeResolver(resolver, promise) {
  function resolvePromise(value) {
    resolve(promise, value);
  }

  function rejectPromise(reason) {
    reject(promise, reason);
  }

  try {
    resolver(resolvePromise, rejectPromise);
  } catch(e) {
    rejectPromise(e);
  }
}

function invokeCallback(settled, promise, callback, detail) {
  var hasCallback = isFunction(callback),
      value, error, succeeded, failed;

  if (hasCallback) {
    try {
      value = callback(detail);
      succeeded = true;
    } catch(e) {
      failed = true;
      error = e;
    }
  } else {
    value = detail;
    succeeded = true;
  }

  if (handleThenable(promise, value)) {
    return;
  } else if (hasCallback && succeeded) {
    resolve(promise, value);
  } else if (failed) {
    reject(promise, error);
  } else if (settled === FULFILLED) {
    resolve(promise, value);
  } else if (settled === REJECTED) {
    reject(promise, value);
  }
}

var PENDING   = void 0;
var SEALED    = 0;
var FULFILLED = 1;
var REJECTED  = 2;

function subscribe(parent, child, onFulfillment, onRejection) {
  var subscribers = parent._subscribers;
  var length = subscribers.length;

  subscribers[length] = child;
  subscribers[length + FULFILLED] = onFulfillment;
  subscribers[length + REJECTED]  = onRejection;
}

function publish(promise, settled) {
  var child, callback, subscribers = promise._subscribers, detail = promise._detail;

  for (var i = 0; i < subscribers.length; i += 3) {
    child = subscribers[i];
    callback = subscribers[i + settled];

    invokeCallback(settled, child, callback, detail);
  }

  promise._subscribers = null;
}

Promise.prototype = {
  constructor: Promise,

  _state: undefined,
  _detail: undefined,
  _subscribers: undefined,

  then: function(onFulfillment, onRejection) {
    var promise = this;

    var thenPromise = new this.constructor(function() {});

    if (this._state) {
      var callbacks = arguments;
      config.async(function invokePromiseCallback() {
        invokeCallback(promise._state, thenPromise, callbacks[promise._state - 1], promise._detail);
      });
    } else {
      subscribe(this, thenPromise, onFulfillment, onRejection);
    }

    return thenPromise;
  },

  'catch': function(onRejection) {
    return this.then(null, onRejection);
  }
};

Promise.all = all;
Promise.race = race;
Promise.resolve = staticResolve;
Promise.reject = staticReject;

function handleThenable(promise, value) {
  var then = null,
  resolved;

  try {
    if (promise === value) {
      throw new TypeError("A promises callback cannot return that same promise.");
    }

    if (objectOrFunction(value)) {
      then = value.then;

      if (isFunction(then)) {
        then.call(value, function(val) {
          if (resolved) { return true; }
          resolved = true;

          if (value !== val) {
            resolve(promise, val);
          } else {
            fulfill(promise, val);
          }
        }, function(val) {
          if (resolved) { return true; }
          resolved = true;

          reject(promise, val);
        });

        return true;
      }
    }
  } catch (error) {
    if (resolved) { return true; }
    reject(promise, error);
    return true;
  }

  return false;
}

function resolve(promise, value) {
  if (promise === value) {
    fulfill(promise, value);
  } else if (!handleThenable(promise, value)) {
    fulfill(promise, value);
  }
}

function fulfill(promise, value) {
  if (promise._state !== PENDING) { return; }
  promise._state = SEALED;
  promise._detail = value;

  config.async(publishFulfillment, promise);
}

function reject(promise, reason) {
  if (promise._state !== PENDING) { return; }
  promise._state = SEALED;
  promise._detail = reason;

  config.async(publishRejection, promise);
}

function publishFulfillment(promise) {
  publish(promise, promise._state = FULFILLED);
}

function publishRejection(promise) {
  publish(promise, promise._state = REJECTED);
}

exports.Promise = Promise;
},{"./all":2,"./asap":3,"./config":4,"./race":7,"./reject":8,"./resolve":9,"./utils":10}],7:[function(require,module,exports){
"use strict";
/* global toString */
var isArray = require("./utils").isArray;

/**
  `RSVP.race` allows you to watch a series of promises and act as soon as the
  first promise given to the `promises` argument fulfills or rejects.

  Example:

  ```javascript
  var promise1 = new RSVP.Promise(function(resolve, reject){
    setTimeout(function(){
      resolve("promise 1");
    }, 200);
  });

  var promise2 = new RSVP.Promise(function(resolve, reject){
    setTimeout(function(){
      resolve("promise 2");
    }, 100);
  });

  RSVP.race([promise1, promise2]).then(function(result){
    // result === "promise 2" because it was resolved before promise1
    // was resolved.
  });
  ```

  `RSVP.race` is deterministic in that only the state of the first completed
  promise matters. For example, even if other promises given to the `promises`
  array argument are resolved, but the first completed promise has become
  rejected before the other promises became fulfilled, the returned promise
  will become rejected:

  ```javascript
  var promise1 = new RSVP.Promise(function(resolve, reject){
    setTimeout(function(){
      resolve("promise 1");
    }, 200);
  });

  var promise2 = new RSVP.Promise(function(resolve, reject){
    setTimeout(function(){
      reject(new Error("promise 2"));
    }, 100);
  });

  RSVP.race([promise1, promise2]).then(function(result){
    // Code here never runs because there are rejected promises!
  }, function(reason){
    // reason.message === "promise2" because promise 2 became rejected before
    // promise 1 became fulfilled
  });
  ```

  @method race
  @for RSVP
  @param {Array} promises array of promises to observe
  @param {String} label optional string for describing the promise returned.
  Useful for tooling.
  @return {Promise} a promise that becomes fulfilled with the value the first
  completed promises is resolved with if the first completed promise was
  fulfilled, or rejected with the reason that the first completed promise
  was rejected with.
*/
function race(promises) {
  /*jshint validthis:true */
  var Promise = this;

  if (!isArray(promises)) {
    throw new TypeError('You must pass an array to race.');
  }
  return new Promise(function(resolve, reject) {
    var results = [], promise;

    for (var i = 0; i < promises.length; i++) {
      promise = promises[i];

      if (promise && typeof promise.then === 'function') {
        promise.then(resolve, reject);
      } else {
        resolve(promise);
      }
    }
  });
}

exports.race = race;
},{"./utils":10}],8:[function(require,module,exports){
"use strict";
/**
  `RSVP.reject` returns a promise that will become rejected with the passed
  `reason`. `RSVP.reject` is essentially shorthand for the following:

  ```javascript
  var promise = new RSVP.Promise(function(resolve, reject){
    reject(new Error('WHOOPS'));
  });

  promise.then(function(value){
    // Code here doesn't run because the promise is rejected!
  }, function(reason){
    // reason.message === 'WHOOPS'
  });
  ```

  Instead of writing the above, your code now simply becomes the following:

  ```javascript
  var promise = RSVP.reject(new Error('WHOOPS'));

  promise.then(function(value){
    // Code here doesn't run because the promise is rejected!
  }, function(reason){
    // reason.message === 'WHOOPS'
  });
  ```

  @method reject
  @for RSVP
  @param {Any} reason value that the returned promise will be rejected with.
  @param {String} label optional string for identifying the returned promise.
  Useful for tooling.
  @return {Promise} a promise that will become rejected with the given
  `reason`.
*/
function reject(reason) {
  /*jshint validthis:true */
  var Promise = this;

  return new Promise(function (resolve, reject) {
    reject(reason);
  });
}

exports.reject = reject;
},{}],9:[function(require,module,exports){
"use strict";
function resolve(value) {
  /*jshint validthis:true */
  if (value && typeof value === 'object' && value.constructor === this) {
    return value;
  }

  var Promise = this;

  return new Promise(function(resolve) {
    resolve(value);
  });
}

exports.resolve = resolve;
},{}],10:[function(require,module,exports){
"use strict";
function objectOrFunction(x) {
  return isFunction(x) || (typeof x === "object" && x !== null);
}

function isFunction(x) {
  return typeof x === "function";
}

function isArray(x) {
  return Object.prototype.toString.call(x) === "[object Array]";
}

// Date.now is not available in browsers < IE9
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/now#Compatibility
var now = Date.now || function() { return new Date().getTime(); };


exports.objectOrFunction = objectOrFunction;
exports.isFunction = isFunction;
exports.isArray = isArray;
exports.now = now;
},{}],11:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
    && window.setImmediate;
    var canPost = typeof window !== 'undefined'
    && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    if (canPost) {
        var queue = [];
        window.addEventListener('message', function (ev) {
            var source = ev.source;
            if ((source === window || source === null) && ev.data === 'process-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('process-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
}

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};

},{}],12:[function(require,module,exports){
(function (process){
(function (global, undefined) {
    "use strict";

    if (global.setImmediate) {
        return;
    }

    var nextHandle = 1; // Spec says greater than zero
    var tasksByHandle = {};
    var currentlyRunningATask = false;
    var doc = global.document;
    var setImmediate;

    function addFromSetImmediateArguments(args) {
        tasksByHandle[nextHandle] = partiallyApplied.apply(undefined, args);
        return nextHandle++;
    }

    // This function accepts the same arguments as setImmediate, but
    // returns a function that requires no arguments.
    function partiallyApplied(handler) {
        var args = [].slice.call(arguments, 1);
        return function() {
            if (typeof handler === "function") {
                handler.apply(undefined, args);
            } else {
                (new Function("" + handler))();
            }
        };
    }

    function runIfPresent(handle) {
        // From the spec: "Wait until any invocations of this algorithm started before this one have completed."
        // So if we're currently running a task, we'll need to delay this invocation.
        if (currentlyRunningATask) {
            // Delay by doing a setTimeout. setImmediate was tried instead, but in Firefox 7 it generated a
            // "too much recursion" error.
            setTimeout(partiallyApplied(runIfPresent, handle), 0);
        } else {
            var task = tasksByHandle[handle];
            if (task) {
                currentlyRunningATask = true;
                try {
                    task();
                } finally {
                    clearImmediate(handle);
                    currentlyRunningATask = false;
                }
            }
        }
    }

    function clearImmediate(handle) {
        delete tasksByHandle[handle];
    }

    function installNextTickImplementation() {
        setImmediate = function() {
            var handle = addFromSetImmediateArguments(arguments);
            process.nextTick(partiallyApplied(runIfPresent, handle));
            return handle;
        };
    }

    function canUsePostMessage() {
        // The test against `importScripts` prevents this implementation from being installed inside a web worker,
        // where `global.postMessage` means something completely different and can't be used for this purpose.
        if (global.postMessage && !global.importScripts) {
            var postMessageIsAsynchronous = true;
            var oldOnMessage = global.onmessage;
            global.onmessage = function() {
                postMessageIsAsynchronous = false;
            };
            global.postMessage("", "*");
            global.onmessage = oldOnMessage;
            return postMessageIsAsynchronous;
        }
    }

    function installPostMessageImplementation() {
        // Installs an event handler on `global` for the `message` event: see
        // * https://developer.mozilla.org/en/DOM/window.postMessage
        // * http://www.whatwg.org/specs/web-apps/current-work/multipage/comms.html#crossDocumentMessages

        var messagePrefix = "setImmediate$" + Math.random() + "$";
        var onGlobalMessage = function(event) {
            if (event.source === global &&
                typeof event.data === "string" &&
                event.data.indexOf(messagePrefix) === 0) {
                runIfPresent(+event.data.slice(messagePrefix.length));
            }
        };

        if (global.addEventListener) {
            global.addEventListener("message", onGlobalMessage, false);
        } else {
            global.attachEvent("onmessage", onGlobalMessage);
        }

        setImmediate = function() {
            var handle = addFromSetImmediateArguments(arguments);
            global.postMessage(messagePrefix + handle, "*");
            return handle;
        };
    }

    function installMessageChannelImplementation() {
        var channel = new MessageChannel();
        channel.port1.onmessage = function(event) {
            var handle = event.data;
            runIfPresent(handle);
        };

        setImmediate = function() {
            var handle = addFromSetImmediateArguments(arguments);
            channel.port2.postMessage(handle);
            return handle;
        };
    }

    function installReadyStateChangeImplementation() {
        var html = doc.documentElement;
        setImmediate = function() {
            var handle = addFromSetImmediateArguments(arguments);
            // Create a <script> element; its readystatechange event will be fired asynchronously once it is inserted
            // into the document. Do so, thus queuing up the task. Remember to clean up once it's been called.
            var script = doc.createElement("script");
            script.onreadystatechange = function () {
                runIfPresent(handle);
                script.onreadystatechange = null;
                html.removeChild(script);
                script = null;
            };
            html.appendChild(script);
            return handle;
        };
    }

    function installSetTimeoutImplementation() {
        setImmediate = function() {
            var handle = addFromSetImmediateArguments(arguments);
            setTimeout(partiallyApplied(runIfPresent, handle), 0);
            return handle;
        };
    }

    // If supported, we should attach to the prototype of global, since that is where setTimeout et al. live.
    var attachTo = Object.getPrototypeOf && Object.getPrototypeOf(global);
    attachTo = attachTo && attachTo.setTimeout ? attachTo : global;

    // Don't get fooled by e.g. browserify environments.
    if ({}.toString.call(global.process) === "[object process]") {
        // For Node.js before 0.9
        installNextTickImplementation();

    } else if (canUsePostMessage()) {
        // For non-IE10 modern browsers
        installPostMessageImplementation();

    } else if (global.MessageChannel) {
        // For web workers, where supported
        installMessageChannelImplementation();

    } else if (doc && "onreadystatechange" in doc.createElement("script")) {
        // For IE 6–8
        installReadyStateChangeImplementation();

    } else {
        // For older browsers
        installSetTimeoutImplementation();
    }

    attachTo.setImmediate = setImmediate;
    attachTo.clearImmediate = clearImmediate;
}(new Function("return this")()));

}).call(this,require("oMfpAn"))
},{"oMfpAn":11}],13:[function(require,module,exports){
var AnyOfAttack, Attack, BoolAttack, CallbackAttack, CharAttack, ConstantAttack, DecimalAttack, FunctionAttack, InstanceAttack, IntAttack, NDecimalAttack, NIntAttack, ObjectAttack, PDecimalAttack, PIntAttack, PileOfAttack, RandomAttack, SignAttack, StringAttack, attackRegistry, constants, field, registerAttack, resolveAttack, unregisterAttack,
  __slice = [].slice,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

field = require('./field');

constants = require('./const');

exports.attacks = attackRegistry = {
  pileOf: {}
};

exports.registerAttack = registerAttack = function(attackName, pile, constr) {
  attackRegistry[attackName] = function() {
    return constr.apply(null, arguments);
  };
  if (pile) {
    return attackRegistry.pileOf[attackName] = function() {
      return new PileOfAttack(attackRegistry[attackName].apply(attackRegistry, arguments));
    };
  }
};

exports.unregisterAttack = unregisterAttack = function(attackName) {
  delete attackRegistry[attackName];
  return delete attackRegistry.pileOf[attackName];
};

exports.resolveAttack = resolveAttack = function(attackName) {
  var attack;
  if ('function' === typeof attackName) {
    attack = attackName();
  } else if (attackName instanceof Attack) {
    attack = attackName;
  } else {
    if (!(attackName in attackRegistry)) {
      throw new Error('Couldn\'t find attack "' + attackName + '"');
    }
    attack = attackRegistry[attackName]();
  }
  if (!(attack instanceof Attack)) {
    throw new Error(attack + ' is not an attack');
  }
  return attack;
};

exports.Attack = Attack = (function() {
  function Attack() {
    var args;
    args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    this.args = args;
    this._init.apply(this, args);
  }

  Attack.prototype.execute = function(dist) {
    var arg, args;
    this._prepare();
    args = (function() {
      var _i, _len, _ref, _results;
      _ref = this.args;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        arg = _ref[_i];
        _results.push(arg);
      }
      return _results;
    }).call(this);
    args.unshift(dist || null);
    return this._perform.apply(this, args);
  };

  Attack.prototype._prepare = function() {};

  Attack.prototype._init = function() {};

  Attack.prototype.cases = function() {
    return void 0;
  };

  Attack.prototype.edgeCases = function() {
    throw new Error(this + ' doesn\'t provide any edge cases.');
  };

  Attack.prototype._perform = function(dist) {
    throw new Error('Perform not implemented for attack ' + this);
  };

  return Attack;

})();

exports.ConstantAttack = ConstantAttack = (function(_super) {
  __extends(ConstantAttack, _super);

  function ConstantAttack() {
    return ConstantAttack.__super__.constructor.apply(this, arguments);
  }

  ConstantAttack.prototype._init = function(value) {
    this.value = value;
  };

  ConstantAttack.prototype.edgeCases = function() {
    return [];
  };

  ConstantAttack.prototype.cases = function() {
    return [this.value];
  };

  ConstantAttack.prototype._perform = function() {
    return this.value;
  };

  return ConstantAttack;

})(Attack);

registerAttack('constant', true, function(value) {
  return new ConstantAttack(value);
});

exports.BoolAttack = BoolAttack = (function(_super) {
  __extends(BoolAttack, _super);

  function BoolAttack() {
    return BoolAttack.__super__.constructor.apply(this, arguments);
  }

  BoolAttack.prototype.edgeCases = function() {
    return [true, false];
  };

  BoolAttack.prototype.cases = function() {
    return this.edgeCases();
  };

  BoolAttack.prototype._perform = function(dist) {
    return dist() > 0.5;
  };

  return BoolAttack;

})(Attack);

registerAttack('bool', true, function() {
  return new BoolAttack();
});

exports.SignAttack = SignAttack = (function(_super) {
  __extends(SignAttack, _super);

  function SignAttack() {
    return SignAttack.__super__.constructor.apply(this, arguments);
  }

  SignAttack.prototype.edgeCases = function() {
    return [-1, 1];
  };

  SignAttack.prototype.cases = function() {
    return this.edgeCases();
  };

  SignAttack.prototype._perform = function(dist) {
    if (SignAttack.__super__._perform.call(this, dist)) {
      return -1;
    } else {
      return 1;
    }
  };

  return SignAttack;

})(BoolAttack);

registerAttack('sign', true, function() {
  return new SignAttack();
});

exports.PDecimalAttack = PDecimalAttack = (function(_super) {
  __extends(PDecimalAttack, _super);

  function PDecimalAttack() {
    return PDecimalAttack.__super__.constructor.apply(this, arguments);
  }

  PDecimalAttack.prototype.edgeCases = function() {
    return [0, Math.sqrt(2)];
  };

  PDecimalAttack.prototype._init = function(max) {
    this.max = max != null ? max : constants.MAX_NUMBER;
  };

  PDecimalAttack.prototype._perform = function(dist) {
    return dist() * this.max;
  };

  return PDecimalAttack;

})(Attack);

registerAttack('pDecimal', true, function(max) {
  return new PDecimalAttack(max);
});

exports.NDecimalAttack = NDecimalAttack = (function(_super) {
  __extends(NDecimalAttack, _super);

  function NDecimalAttack() {
    return NDecimalAttack.__super__.constructor.apply(this, arguments);
  }

  NDecimalAttack.prototype.edgeCases = function() {
    return [0, -Math.sqrt(2)];
  };

  NDecimalAttack.prototype._perform = function(dist) {
    return -NDecimalAttack.__super__._perform.call(this, dist);
  };

  return NDecimalAttack;

})(PDecimalAttack);

registerAttack('nDecimal', true, function(max) {
  return new NDecimalAttack(max);
});

exports.DecimalAttack = DecimalAttack = (function(_super) {
  __extends(DecimalAttack, _super);

  function DecimalAttack() {
    return DecimalAttack.__super__.constructor.apply(this, arguments);
  }

  DecimalAttack.prototype.edgeCases = function() {
    return [-Math.sqrt(2), 0, Math.sqrt(2)];
  };

  DecimalAttack.prototype._init = function() {
    DecimalAttack.__super__._init.apply(this, arguments);
    return this.sign = new SignAttack();
  };

  DecimalAttack.prototype._perform = function(dist) {
    return this.sign.execute(field.even) * DecimalAttack.__super__._perform.call(this, dist);
  };

  return DecimalAttack;

})(PDecimalAttack);

registerAttack('decimal', true, function(max) {
  return new DecimalAttack(max);
});

exports.PIntAttack = PIntAttack = (function(_super) {
  __extends(PIntAttack, _super);

  function PIntAttack() {
    return PIntAttack.__super__.constructor.apply(this, arguments);
  }

  PIntAttack.prototype.edgeCases = function() {
    return [0];
  };

  PIntAttack.prototype.cases = function() {
    var i;
    if (this.max <= constants.MAX_PILE_LEN) {
      return (function() {
        var _i, _ref, _results;
        _results = [];
        for (i = _i = 0, _ref = this.max; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
          _results.push(i);
        }
        return _results;
      }).call(this);
    }
  };

  PIntAttack.prototype._perform = function(dist) {
    return PIntAttack.__super__._perform.call(this, dist) | 0;
  };

  return PIntAttack;

})(PDecimalAttack);

registerAttack('pInt', true, function(max) {
  return new PIntAttack(max);
});

exports.NIntAttack = NIntAttack = (function(_super) {
  __extends(NIntAttack, _super);

  function NIntAttack() {
    return NIntAttack.__super__.constructor.apply(this, arguments);
  }

  NIntAttack.prototype.edgeCases = function() {
    return [0];
  };

  NIntAttack.prototype.cases = function() {
    var i;
    if (this.max <= constants.MAX_PILE_LEN) {
      return (function() {
        var _i, _ref, _results;
        _results = [];
        for (i = _i = 0, _ref = this.max; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
          _results.push(-i);
        }
        return _results;
      }).call(this);
    }
  };

  NIntAttack.prototype._perform = function(dist) {
    return NIntAttack.__super__._perform.call(this, dist) | 0;
  };

  return NIntAttack;

})(NDecimalAttack);

registerAttack('nInt', true, function(max) {
  return new NIntAttack(max);
});

exports.IntAttack = IntAttack = (function(_super) {
  __extends(IntAttack, _super);

  function IntAttack() {
    return IntAttack.__super__.constructor.apply(this, arguments);
  }

  IntAttack.prototype.edgeCases = function() {
    return [0];
  };

  IntAttack.prototype.cases = function() {
    var i;
    if (2 * this.max <= constants.MAX_PILE_LEN) {
      return (function() {
        var _i, _ref, _ref1, _results;
        _results = [];
        for (i = _i = _ref = -this.max, _ref1 = this.max; _ref <= _ref1 ? _i <= _ref1 : _i >= _ref1; i = _ref <= _ref1 ? ++_i : --_i) {
          _results.push(i);
        }
        return _results;
      }).call(this);
    }
  };

  IntAttack.prototype._perform = function(dist) {
    return IntAttack.__super__._perform.call(this, dist) | 0;
  };

  return IntAttack;

})(DecimalAttack);

registerAttack('int', true, function(max) {
  return new IntAttack(max);
});

exports.RandomAttack = RandomAttack = (function(_super) {
  __extends(RandomAttack, _super);

  function RandomAttack() {
    return RandomAttack.__super__.constructor.apply(this, arguments);
  }

  RandomAttack.prototype.edgeCases = function() {
    return [0, 1];
  };

  RandomAttack.prototype._perform = function(dist) {
    return dist();
  };

  return RandomAttack;

})(Attack);

registerAttack('random', true, function() {
  return new RandomAttack();
});

exports.CharAttack = CharAttack = (function(_super) {
  __extends(CharAttack, _super);

  function CharAttack() {
    return CharAttack.__super__.constructor.apply(this, arguments);
  }

  CharAttack.prototype.edgeCases = function() {
    return ['', null];
  };

  CharAttack.prototype.cases = function() {
    return constants.CHARSET.split('');
  };

  CharAttack.prototype._perform = function(dist) {
    return constants.CHARSET.charAt((dist() * constants.CHARSET.length) | 0);
  };

  return CharAttack;

})(Attack);

registerAttack('char', true, function() {
  return new CharAttack();
});

exports.StringAttack = StringAttack = (function(_super) {
  __extends(StringAttack, _super);

  function StringAttack() {
    return StringAttack.__super__.constructor.apply(this, arguments);
  }

  StringAttack.prototype.cases = function() {
    return void 0;
  };

  StringAttack.prototype._perform = function(dist) {
    var len;
    len = (dist() * constants.MAX_STR_LEN) | 0;
    if (len > 0) {
      return ((function() {
        var _i, _results;
        _results = [];
        for (_i = 1; 1 <= len ? _i <= len : _i >= len; 1 <= len ? _i++ : _i--) {
          _results.push(StringAttack.__super__._perform.call(this, dist));
        }
        return _results;
      }).call(this)).join('');
    } else {
      return '';
    }
  };

  return StringAttack;

})(CharAttack);

registerAttack('string', true, function() {
  return new StringAttack();
});

exports.ObjectAttack = ObjectAttack = (function(_super) {
  __extends(ObjectAttack, _super);

  function ObjectAttack() {
    return ObjectAttack.__super__.constructor.apply(this, arguments);
  }

  ObjectAttack.prototype.edgeCases = function() {
    return [null];
  };

  ObjectAttack.prototype._perform = function(dist, example) {
    var k, obj, v;
    obj = {};
    for (k in example) {
      v = example[k];
      obj[k] = resolveAttack(v).execute(dist);
    }
    return obj;
  };

  return ObjectAttack;

})(Attack);

registerAttack('object', true, function(example) {
  return new ObjectAttack(example);
});

exports.AnyOfAttack = AnyOfAttack = (function(_super) {
  __extends(AnyOfAttack, _super);

  function AnyOfAttack() {
    return AnyOfAttack.__super__.constructor.apply(this, arguments);
  }

  AnyOfAttack.prototype._init = function(arr, edges) {
    this.arr = arr != null ? arr : [];
    this.edges = edges != null ? edges : [];
  };

  AnyOfAttack.prototype.edgeCases = function() {
    return this.edges;
  };

  AnyOfAttack.prototype.cases = function() {
    return this.arr;
  };

  AnyOfAttack.prototype._perform = function(dist, arr) {
    return this.arr[(dist() * this.arr.length) | 0];
  };

  return AnyOfAttack;

})(Attack);

registerAttack('anyOf', true, function(arr, edges) {
  return new AnyOfAttack(arr, edges);
});

exports.PileOfAttack = PileOfAttack = (function(_super) {
  __extends(PileOfAttack, _super);

  function PileOfAttack() {
    return PileOfAttack.__super__.constructor.apply(this, arguments);
  }

  PileOfAttack.prototype.edgeCases = function() {
    return [[], null];
  };

  PileOfAttack.prototype._perform = function(dist, innerAttack) {
    var len, _i, _results;
    len = (dist() * constants.MAX_PILE_LEN) | 0;
    _results = [];
    for (_i = 1; 1 <= len ? _i <= len : _i >= len; 1 <= len ? _i++ : _i--) {
      _results.push(innerAttack.execute(dist));
    }
    return _results;
  };

  return PileOfAttack;

})(Attack);

registerAttack('pile', true, function(innerAttack) {
  return new PileOfAttack(innerAttack);
});

exports.CallbackAttack = CallbackAttack = (function(_super) {
  __extends(CallbackAttack, _super);

  function CallbackAttack() {
    return CallbackAttack.__super__.constructor.apply(this, arguments);
  }

  CallbackAttack.prototype._init = function(fn, edges) {
    this.fn = fn;
    this.edges = edges != null ? edges : [];
  };

  CallbackAttack.prototype.edgeCases = function() {
    return this.edges;
  };

  CallbackAttack.prototype._perform = function(dist) {
    return this.fn(dist);
  };

  return CallbackAttack;

})(Attack);

registerAttack('cb', true, function(fn, edges) {
  return new CallbackAttack(fn, edges);
});

exports.FunctionAttack = FunctionAttack = (function(_super) {
  __extends(FunctionAttack, _super);

  function FunctionAttack() {
    return FunctionAttack.__super__.constructor.apply(this, arguments);
  }

  FunctionAttack.prototype._init = function(returningAttack) {
    return this.attack = resolveAttack(returningAttack);
  };

  FunctionAttack.prototype._createFn = function(returnVal) {
    return function() {
      return returnVal;
    };
  };

  FunctionAttack.prototype.edgeCases = function() {
    var edgeCases;
    edgeCases = this.attack.edgeCases();
    if (edgeCases) {
      return edgeCases.map((function(_this) {
        return function(c) {
          return _this._createFn(c);
        };
      })(this));
    }
  };

  FunctionAttack.prototype.cases = function() {
    var cases;
    cases = this.attack.cases();
    if (cases) {
      return cases.map((function(_this) {
        return function(c) {
          return _this._createFn(c);
        };
      })(this));
    }
  };

  FunctionAttack.prototype._perform = function(dist) {
    return this._createFn(this.attack.execute(dist));
  };

  return FunctionAttack;

})(Attack);

registerAttack('fn', true, function(returningAttack) {
  return new FunctionAttack(returningAttack);
});

exports.InstanceAttack = InstanceAttack = (function(_super) {
  __extends(InstanceAttack, _super);

  function InstanceAttack() {
    return InstanceAttack.__super__.constructor.apply(this, arguments);
  }

  InstanceAttack.prototype.edgeCases = function() {
    return [null];
  };

  InstanceAttack.prototype._perform = function(dist, constr, args) {
    var constrArgs;
    constrArgs = args ? args.map(function(e) {
      return resolveAttack(e).execute(dist);
    }) : [];
    return (function(func, args, ctor) {
      ctor.prototype = func.prototype;
      var child = new ctor, result = func.apply(child, args);
      return Object(result) === result ? result : child;
    })(constr, constrArgs, function(){});
  };

  return InstanceAttack;

})(Attack);

registerAttack('instance', true, function() {
  var args, constr;
  constr = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
  return new InstanceAttack(constr, args);
});



},{"./const":14,"./field":16}],14:[function(require,module,exports){
module.exports = {
  CHARSET: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890' + '+-*/\\()[]{}!§$%?#"\'.,;:_ ^°<>=@' + 'ÄÖÜäöüÁÚÓÉáúóéÀÙÒÈàùòèâûêôîÂÛÊÔÎñÑ' + 'çÇ∑øπ€¥',
  MAX_NUMBER: 1000000 | 0,
  MAX_STR_LEN: 100 | 0,
  MAX_PILE_LEN: 50 | 0,
  DEFAULT_ANGRYNESS: 100 |  0,
  EXPOSE: ['field', 'attack', 'hoping']
};



},{}],15:[function(require,module,exports){
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



},{"./promise":21}],16:[function(require,module,exports){
var field;

module.exports = field = {
  even: function() {
    return Math.random();
  },
  gauss: function() {
    return (Math.random() + Math.random() + Math.random() + Math.random()) / 4.0;
  },
  iGauss: function() {
    var r;
    r = Math.random() - Math.random() + Math.random() - Math.random();
    if (r < 0) {
      r += 4.0;
    }
    return r / 4.0;
  },
  edges: function() {
    var r;
    r = Math.random();
    return r * r * (3 - 2 * r);
  },
  lowerEdge: function() {
    return Math.min(Math.random(), Math.random(), Math.random(), Math.random(), Math.random(), Math.random());
  },
  upperEdge: function() {
    return Math.max(Math.random(), Math.random(), Math.random(), Math.random(), Math.random(), Math.random());
  },
  softEdges: function() {
    if (field.even() > 0.5) {
      return field.lowerEdge();
    } else {
      return field.upperEdge();
    }
  }
};



},{}],17:[function(require,module,exports){
var Promise, defaultHopes, f, hopeName, hopeRegistry, registerHope, that, unregisterHope,
  __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
  __slice = [].slice;

Promise = require('./promise');

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

exports.fulfillsHope = function(func, args, hope) {
  return new Promise(function(resolve, reject) {
    var error, funcRes;
    try {
      funcRes = func.apply(null, args);
      if (funcRes instanceof Promise) {
        funcRes.then((function(res) {
          return resolve(hope(res) !== false);
        }), function() {
          return reject.apply(null, arguments);
        });
      } else {
        resolve(hope(funcRes) !== false);
      }
    } catch (_error) {
      error = _error;
      error.__destoroyah = args;
      reject(error);
    }
  });
};



},{"./promise":21}],18:[function(require,module,exports){
var EXPOSE, destoroyah, setup;

destoroyah = require('./main');

setup = require('./setup');

EXPOSE = require('../destoroyah/const').EXPOSE;

module.exports = destoroyah;

if (typeof window !== 'undefined') {
  window.destoroyah = destoroyah;
  setup.extend('rampage', window);
  setup.extend('monster', window);
  setup.extend('struggle', window);
  EXPOSE.forEach(function(propName) {
    return window[propName] = destoroyah[propName];
  });
}



},{"../destoroyah/const":14,"./main":19,"./setup":23}],19:[function(require,module,exports){
var Promise, attack, attackModule, bitterStruggle, constants, destoroyah, field, fieldModule, hoping, hopingModule, setup, util;

fieldModule = require('./field');

attackModule = require('./attack');

hopingModule = require('./hopes');

constants = require('./const');

util = require('./util');

bitterStruggle = require('./struggle').bitterStruggle;

Promise = require('./promise');

setup = require('./setup');

field = fieldModule;

attack = attackModule.attacks;

hoping = hopingModule.hopes;

module.exports = destoroyah = {
  field: field,
  attack: attack,
  hoping: hoping,
  constants: constants,
  Promise: Promise,
  thenable: util.thenable,
  bitterStruggle: bitterStruggle,
  modules: {
    field: fieldModule,
    attack: attackModule,
    hoping: hopingModule,
    util: util
  }
};

setup.extend('monster', destoroyah);

setup.extend('struggle', destoroyah);



},{"./attack":13,"./const":14,"./field":16,"./hopes":17,"./promise":21,"./setup":23,"./struggle":24,"./util":26}],20:[function(require,module,exports){
var Destoroyah, MonsterEventEmitter, Promise, Rampage, attackModule, field, hoping, setup, setupRampage, util,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

MonsterEventEmitter = require('./event').MonsterEventEmitter;

util = require('./util');

Promise = require('./promise');

setup = require('./setup');

hoping = require('./hopes').hopes;

Rampage = require('./rampage').Rampage;

attackModule = require('./attack');

field = require('./field');

exports.Destoroyah = Destoroyah = (function(_super) {
  __extends(Destoroyah, _super);

  Destoroyah.prototype.reset = function() {
    var f, _i, _len, _ref;
    this.rampages = [];
    if (this.detach != null) {
      _ref = this.detach;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        f = _ref[_i];
        f();
      }
    }
    return this.detach = [];
  };

  function Destoroyah(reason, angryness, setupFn) {
    this.reason = reason;
    this.angryness = angryness;
    this.setupFn = setupFn;
    this.only = false;
    this.skip = false;
    this.reset();
    Destoroyah.__super__.constructor.call(this);
  }

  Destoroyah.prototype.setup = function() {
    this.reset();
    setup.execute('monster', this, this.setupFn);
  };

  Destoroyah.prototype.addRampage = function(rampage) {
    if (__indexOf.call(this.rampages, rampage) < 0) {
      this.detach.push(rampage.through('defended', this));
      this.detach.push(rampage.through('defeated', this));
      this.rampages.push(rampage);
    }
  };

  Destoroyah.prototype._runEachRampage = function() {
    return new Promise((function(_this) {
      return function(resolve, reject) {
        var hasBrokenThrough, onlyRampages, runOn;
        hasBrokenThrough = false;
        runOn = _this.rampages;
        onlyRampages = runOn.filter(function(r) {
          return r.only;
        });
        if (onlyRampages.length > 0) {
          runOn = onlyRampages;
        }
        runOn = runOn.filter(function(r) {
          return !r.skip;
        });
        if (runOn.length === 0) {
          resolve(false);
        }
        util.cbForEach(runOn, function(rampage, next) {
          return _this._fireEvent('start rampage', rampage).then(function() {
            return rampage.start(_this.angryness);
          }).then(function(res) {
            hasBrokenThrough || (hasBrokenThrough = res.failed);
            return _this._fireEvent('end rampage', rampage, res).then(function() {
              if (!next()) {
                return resolve(hasBrokenThrough);
              }
            });
          })["catch"](function(e) {
            hasBrokenThrough = true;
            return _this._fireEvent('error rampage', rampage, e).then(function() {
              return reject(e);
            })["catch"](reject);
          });
        });
      };
    })(this));
  };

  Destoroyah.prototype.awake = function() {
    var end;
    end = (function(_this) {
      return function() {
        return function(res) {
          return new Promise(function(resolveEnd, rejectEnd) {
            return _this._fireEvent('end').then((function() {
              return resolveEnd(res);
            }), rejectEnd);
          });
        };
      };
    })(this);
    return this._fireEvent('start').then((function(_this) {
      return function() {
        return _this._runEachRampage();
      };
    })(this)).then(end());
  };

  return Destoroyah;

})(MonsterEventEmitter);

setup.include('monster', 'equipWith', function(forceName, f) {
  this.once('start', function() {
    return attackModule.registerAttack(forceName, true, f);
  });
  this.once('end', function() {
    return attackModule.unregisterAttack(forceName);
  });
});

setup.include('monster', 'beforeRampage', function(f) {
  var detach;
  detach = this.on('start rampage', f);
  this.once('end', function() {
    return detach();
  });
});

setup.include('monster', 'afterRampage', function(f) {
  var detach;
  detach = [];
  detach.push(this.on('end rampage', f));
  detach.push(this.on('error rampage', f));
  this.once('monster', 'end', function() {
    var d, _i, _len, _results;
    _results = [];
    for (_i = 0, _len = detach.length; _i < _len; _i++) {
      d = detach[_i];
      _results.push(d());
    }
    return _results;
  });
});

setup.include('monster', 'whenAwake', function(f) {
  this.once('start', f);
});

setup.include('monster', 'whenCalm', function(f) {
  this.once('end', f);
});

setupRampage = setup.include('monster', 'rampage', function(reason, hope, f) {
  var r;
  if (!f) {
    f = hope;
    hope = hoping.isTrue();
  }
  r = new Rampage(reason, hope, f, field.even);
  this.addRampage(r);
  return r;
});

setup.include('monster', 'rrampage', function(reason, hope, f) {
  var rampage;
  rampage = setupRampage.apply(null, arguments);
  rampage.only = true;
  return rampage;
});

setup.include('monster', 'xrampage', function(reason, hope, f) {
  var rampage;
  rampage = setupRampage.apply(null, arguments);
  rampage.skip = true;
  return rampage;
});



},{"./attack":13,"./event":15,"./field":16,"./hopes":17,"./promise":21,"./rampage":22,"./setup":23,"./util":26}],21:[function(require,module,exports){
(function (global){
var Promise;

if ((typeof global !== "undefined" && global !== null) && 'Promise' in global) {
  Promise = global.Promise;
} else if ((typeof window !== "undefined" && window !== null) && 'Promise' in window) {
  Promise = window.Promise;
} else {
  Promise = require('es6-promise').Promise;
}

module.exports = Promise;



}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"es6-promise":1}],22:[function(require,module,exports){
var MonsterEventEmitter, Promise, Rampage, attack, setup, testrun, util,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

MonsterEventEmitter = require('./event').MonsterEventEmitter;

attack = require('./attack').attacks;

testrun = require('./testrun');

setup = require('./setup');

util = require('./util');

Promise = require('./promise');

exports.Rampage = Rampage = (function(_super) {
  __extends(Rampage, _super);

  Rampage._lastId = 0;

  function Rampage(reason, hope, f, field) {
    this.reason = reason;
    this.hope = hope;
    this.f = f;
    this.field = field;
    this.id = Rampage._lastId++;
    this.only = false;
    this.skip = false;
    Rampage.__super__.constructor.call(this);
    this.reset();
  }

  Rampage.prototype.inspect = function(val) {
    this.inspectedVal = val;
    this.inspected = true;
    return val;
  };

  Rampage.prototype.reset = function() {
    this.result = null;
    this.inspected = false;
    this.inspectedVal = void 0;
    this.explanation = null;
  };

  Rampage.prototype._attackNames = function() {
    var attackNames;
    attackNames = this.f._destoroyahArgNames ||  util.fnArgNames(this.f);
    return attackNames.map(function(name) {
      var attackName;
      attackName = name.split('_')[0];
      return attackName.trim();
    });
  };

  Rampage.prototype._attacks = function(names) {
    if (names.length === 0) {
      return [];
    }
    return names.map((function(_this) {
      return function(attackName) {
        if (attackName in attack) {
          return attack[attackName]();
        }
        throw new Error('Attack "' + attackName + '" not found for rampage ' + _this.reason + ', not equipped?');
      };
    })(this));
  };

  Rampage.prototype.start = function(angryness) {
    var attacksUsed, test;
    this.reset();
    attacksUsed = this._attackNames();
    setup.bindTo('rampage', this);
    test = testrun.forAll(this.f, this._attacks(attacksUsed), this.hope, this.field, angryness).then((function(_this) {
      return function(res) {
        return new Promise(function(resolve, reject) {
          _this.result = res;
          (res.failed ? _this._fireEvent('defeated', res) : _this._fireEvent('defended', res)).then(function() {
            return resolve(res);
          })["catch"](reject);
        });
      };
    })(this));
    return util["finally"](test, function(res) {
      setup.unbind('rampage');
      return res;
    });
  };

  return Rampage;

})(MonsterEventEmitter);

setup.include('rampage', 'inspect', function(val) {
  return this.inspect(val);
});



},{"./attack":13,"./event":15,"./promise":21,"./setup":23,"./testrun":25,"./util":26}],23:[function(require,module,exports){
var bindFn, bindLater, bindTo, boundIncludeFn, extending, include, unbind, unboundFn, unboundIncludedFn;

unboundIncludedFn = {};

boundIncludeFn = {};

extending = [];

unboundFn = function(context, name) {
  return function() {
    throw new Error('Called "' + name + '" out of context "' + context + '"');
  };
};

bindLater = function(context, name) {
  return function() {
    var f;
    f = boundIncludeFn[context][name];
    return f.apply(null, arguments);
  };
};

exports.include = include = function(context, name, fn) {
  var bindLaterFn, obj, _i, _len, _ref;
  if (!(context in unboundIncludedFn)) {
    unboundIncludedFn[context] = {};
  }
  unboundIncludedFn[context][name] = fn;
  if (!(context in boundIncludeFn)) {
    boundIncludeFn[context] = {};
  }
  boundIncludeFn[context][name] = unboundFn(context, name);
  bindLaterFn = bindLater(context, name);
  if (context in extending) {
    _ref = extending[context];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      obj = _ref[_i];
      obj[name] = bindLaterFn;
    }
  }
  return bindLaterFn;
};

exports.unbind = unbind = function(context) {
  var fn, name, _ref;
  if (context in boundIncludeFn) {
    _ref = boundIncludeFn[context];
    for (name in _ref) {
      fn = _ref[name];
      boundIncludeFn[context][name] = unboundFn(context, name);
    }
  }
};

bindFn = function(fn, obj) {
  return function() {
    return fn.apply(obj, arguments);
  };
};

exports.bindTo = bindTo = function(context, obj) {
  var fn, name, _ref;
  if (context in unboundIncludedFn) {
    _ref = unboundIncludedFn[context];
    for (name in _ref) {
      fn = _ref[name];
      boundIncludeFn[context][name] = bindFn(fn, obj);
    }
  }
};

exports.extend = function(context, obj) {
  var boundFn, name, _ref;
  if (context in boundIncludeFn) {
    _ref = boundIncludeFn[context];
    for (name in _ref) {
      boundFn = _ref[name];
      obj[name] = bindLater(context, name);
    }
  }
  if (!(context in extending)) {
    extending[context] = [];
  }
  extending[context].push(obj);
};

exports.dispose = function(context, obj) {
  var boundFn, index, name, _ref;
  if (context in boundIncludeFn && context in extending) {
    index = extending[context].indexOf(obj);
    if (index >= 0) {
      _ref = boundIncludeFn[context];
      for (name in _ref) {
        boundFn = _ref[name];
        delete obj[name];
      }
      extending[context].splice(index, 1);
    }
  }
};

exports.execute = function(context, obj, fn, args) {
  var res;
  bindTo(context, obj);
  res = fn.apply(null, args);
  unbind(context);
  return res;
};



},{}],24:[function(require,module,exports){
var BitterStruggle, DEFAULT_ANGRYNESS, Destoroyah, MonsterEventEmitter, Promise, setup, setupAwake, util,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

MonsterEventEmitter = require('./event').MonsterEventEmitter;

Destoroyah = require('./monster').Destoroyah;

setup = require('./setup');

Promise = require('./promise');

DEFAULT_ANGRYNESS = require('./const').DEFAULT_ANGRYNESS;

util = require('./util');

BitterStruggle = (function(_super) {
  __extends(BitterStruggle, _super);

  function BitterStruggle() {
    this.monsters = [];
    this.detach = [];
    BitterStruggle.__super__.constructor.call(this);
  }

  BitterStruggle.prototype.addMonster = function(monster) {
    this.detach.push(monster.through('start', this, 'awake monster'));
    this.detach.push(monster.through('end', this, 'calm monster'));
    this.detach.push(monster.through('start rampage', this));
    this.detach.push(monster.through('end rampage', this));
    this.detach.push(monster.through('error rampage', this));
    this.detach.push(monster.through('defended', this));
    this.detach.push(monster.through('defeated', this));
    this.monsters.push(monster);
    return monster;
  };

  BitterStruggle.prototype._setup = function() {
    var monster, _i, _len, _ref;
    _ref = this.monsters;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      monster = _ref[_i];
      monster.setup();
    }
  };

  BitterStruggle.prototype._runEachMonster = function() {
    return new Promise((function(_this) {
      return function(resolve, reject) {
        var hasBrokenThrough, onlyMonsters, runOn;
        hasBrokenThrough = false;
        runOn = _this.monsters;
        onlyMonsters = runOn.filter(function(m) {
          return m.only;
        });
        if (onlyMonsters.length > 0) {
          runOn = onlyMonsters;
        }
        runOn = runOn.filter(function(m) {
          return !m.skip;
        });
        if (runOn.length === 0) {
          resolve(false);
        }
        util.cbForEach(runOn, function(monster, next) {
          return monster.awake().then(function(broken) {
            hasBrokenThrough || (hasBrokenThrough = broken);
            if (!next()) {
              return resolve(hasBrokenThrough);
            }
          }, reject);
        });
      };
    })(this));
  };

  BitterStruggle.prototype.fight = function() {
    var end;
    end = (function(_this) {
      return function() {
        return function(res) {
          return new Promise(function(resolveEnd, rejectEnd) {
            return _this._fireEvent('end').then((function() {
              return resolveEnd(res);
            }), rejectEnd);
          });
        };
      };
    })(this);
    this._setup();
    return this._fireEvent('start').then((function(_this) {
      return function() {
        return _this._runEachMonster();
      };
    })(this)).then(end());
  };

  BitterStruggle.prototype.surrender = function() {
    var f, _i, _len, _ref;
    _ref = this.detach;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      f = _ref[_i];
      f();
    }
    this.detach = [];
    return this.monsters = [];
  };

  return BitterStruggle;

})(MonsterEventEmitter);

setupAwake = setup.include('struggle', 'awake', function(reason, angryness, setup) {
  if (setup == null) {
    setup = angryness;
    angryness = DEFAULT_ANGRYNESS;
  }
  return this.addMonster(new Destoroyah(reason, angryness, setup));
});

setup.include('struggle', 'aawake', function(reason, angryness, setup) {
  var monster;
  monster = setupAwake.apply(null, arguments);
  monster.only = true;
  return monster;
});

setup.include('struggle', 'xawake', function(reason, angryness, setup) {
  var monster;
  monster = setupAwake.apply(null, arguments);
  monster.skip = true;
  return monster;
});

exports.bitterStruggle = new BitterStruggle();

setup.bindTo('struggle', exports.bitterStruggle);



},{"./const":14,"./event":15,"./monster":20,"./promise":21,"./setup":23,"./util":26}],25:[function(require,module,exports){
var DestoroyahResult, Promise, TestRun, hopes, util;

Promise = require('./promise');

util = require('./util');

hopes = require('./hopes');

exports.DestoroyahResult = DestoroyahResult = (function() {
  function DestoroyahResult(failed, angryness, combos, lastArguments, startTime) {
    this.failed = failed;
    this.angryness = angryness;
    this.combos = combos;
    this.lastArguments = lastArguments;
    this.time = new Date().getTime() - startTime;
  }

  return DestoroyahResult;

})();

exports.TestRun = TestRun = (function() {
  function TestRun(func, thisAttacks, hope, field, angryness) {
    this.func = func;
    this.thisAttacks = thisAttacks;
    this.hope = hope;
    this.field = field;
    this.angryness = angryness;
    this.lastArguments = [];
    if (thisAttacks.length > 0) {
      this.edgeCases = thisAttacks.map(function(att) {
        return att.edgeCases().concat([att.execute(field)]);
      });
      this.combos = util.combo(this.edgeCases);
      this.allCases = thisAttacks.map(function(e) {
        return e.cases();
      });
      this.complexity = this.allCases.length > 0 ? this.allCases.reduce((function(acc, e) {
        if (!e) {
          return Infinity;
        } else {
          return acc * e.length;
        }
      }), 1) : 0;
    } else {
      this.edgeCases = [];
      this.angryness = 1;
      this.combos = [];
      this.complexity = 0;
      this.allCases = [];
    }
  }

  TestRun.prototype.runEdgeCases = function() {
    return new Promise((function(_this) {
      return function(resolve, reject) {
        if (_this.edgeCases.length > 0) {
          util.cbForEach(_this.combos, function(comboArgs, next) {
            _this.lastArguments = comboArgs;
            return hopes.fulfillsHope(_this.func, comboArgs, _this.hope).then(util.either((function() {
              if (!next()) {
                return resolve();
              }
            }), reject), reject);
          });
        } else {
          resolve();
        }
      };
    })(this));
  };

  TestRun.prototype.runNoneDeterministicCases = function() {
    return new Promise((function(_this) {
      return function(resolve, reject) {
        var caseCombos;
        if (_this.complexity === 0 || _this.angryness === 0) {
          _this.lastArguments = [];
          hopes.fulfillsHope(_this.func, [], _this.hope).then(util.either(resolve, reject), reject);
        } else if (_this.complexity <= _this.angryness) {
          _this.angryness = _this.complexity;
          caseCombos = util.combo(_this.allCases);
          util.cbForEach(caseCombos, function(caseCombo, next) {
            _this.lastArguments = caseCombo;
            return hopes.fulfillsHope(_this.func, caseCombo, _this.hope).then(util.either((function() {
              if (!next()) {
                return resolve();
              }
            }), reject), reject);
          });
        } else {
          util.cbFor(1, _this.angryness, function(index, next) {
            var args;
            args = _this.thisAttacks.map(function(a) {
              return a.execute(_this.field);
            });
            _this.lastArguments = args;
            return hopes.fulfillsHope(_this.func, args, _this.hope).then(util.either((function() {
              if (!next()) {
                return resolve();
              }
            }), reject), reject);
          });
        }
      };
    })(this));
  };

  TestRun.prototype.runAll = function() {
    var startTime;
    startTime = new Date().getTime();
    return new Promise((function(_this) {
      return function(resolve, reject) {
        var resolveCurrentState;
        resolveCurrentState = function(failed) {
          return resolve(new DestoroyahResult(failed, _this.angryness, _this.combos.length, _this.lastArguments, startTime));
        };
        _this.runEdgeCases().then(function() {
          return _this.runNoneDeterministicCases();
        }).then(function() {
          var failed;
          failed = 'finally' in _this.hope ? _this.hope["finally"]() === false : false;
          return resolveCurrentState(failed);
        })["catch"](function(e) {
          if (e != null) {
            return reject(e);
          } else {
            return resolveCurrentState(true);
          }
        });
      };
    })(this));
  };

  return TestRun;

})();

exports.forAll = function(func, thisAttacks, hope, field, angryness) {
  return new TestRun(func, thisAttacks, hope, field, angryness).runAll();
};



},{"./hopes":17,"./promise":21,"./util":26}],26:[function(require,module,exports){
var Promise, cbFor, cbForEach, fnArgNames,
  __slice = [].slice;

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
    args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    return new Promise(function(resolve, reject) {
      return f.apply(null, args).then(resolve, reject);
    });
  };
  p._destoroyahArgNames = fnArgNames(f);
  return p;
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



},{"./promise":21,"setimmediate":12}]},{},[18])