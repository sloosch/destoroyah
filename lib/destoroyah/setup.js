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
  var bindLaterFn, i, len, obj, ref;
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
    ref = extending[context];
    for (i = 0, len = ref.length; i < len; i++) {
      obj = ref[i];
      obj[name] = bindLaterFn;
    }
  }
  return bindLaterFn;
};

exports.unbind = unbind = function(context) {
  var fn, name, ref;
  if (context in boundIncludeFn) {
    ref = boundIncludeFn[context];
    for (name in ref) {
      fn = ref[name];
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
  var fn, name, ref;
  if (context in unboundIncludedFn) {
    ref = unboundIncludedFn[context];
    for (name in ref) {
      fn = ref[name];
      boundIncludeFn[context][name] = bindFn(fn, obj);
    }
  }
};

exports.extend = function(context, obj) {
  var boundFn, name, ref;
  if (context in boundIncludeFn) {
    ref = boundIncludeFn[context];
    for (name in ref) {
      boundFn = ref[name];
      obj[name] = bindLater(context, name);
    }
  }
  if (!(context in extending)) {
    extending[context] = [];
  }
  extending[context].push(obj);
};

exports.dispose = function(context, obj) {
  var boundFn, index, name, ref;
  if (context in boundIncludeFn && context in extending) {
    index = extending[context].indexOf(obj);
    if (index >= 0) {
      ref = boundIncludeFn[context];
      for (name in ref) {
        boundFn = ref[name];
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
