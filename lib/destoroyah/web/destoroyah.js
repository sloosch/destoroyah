(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var AnyOfAttack, Attack, BoolAttack, CharAttack, ConstantAttack, DecimalAttack, FunctionAttack, InstanceAttack, IntAttack, NDecimalAttack, NIntAttack, ObjectAttack, PDecimalAttack, PIntAttack, PileOfAttack, RandomAttack, SignAttack, StringAttack, attackRegistry, constants, field, registerAttack, resolveAttack, unregisterAttack,
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

exports.FunctionAttack = FunctionAttack = (function(_super) {
  __extends(FunctionAttack, _super);

  function FunctionAttack() {
    return FunctionAttack.__super__.constructor.apply(this, arguments);
  }

  FunctionAttack.prototype._init = function(fn, edges) {
    this.fn = fn;
    this.edges = edges != null ? edges : [];
  };

  FunctionAttack.prototype.edgeCases = function() {
    return this.edges;
  };

  FunctionAttack.prototype._perform = function(dist) {
    return this.fn(dist);
  };

  return FunctionAttack;

})(Attack);

registerAttack('fn', true, function(fn, edges) {
  return new FunctionAttack(fn, edges);
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



},{"./const":2,"./field":3}],2:[function(require,module,exports){
module.exports = {
  CHARSET: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890' + '+-*/\\()[]{}!§$%?#"\'.,;:_ ^°<>=@' + 'ÄÖÜäöüÁÚÓÉáúóéÀÙÒÈàùòèâûêôîÂÛÊÔÎñÑ' + 'çÇ∑øπ€¥',
  MAX_NUMBER: 1000000 | 0,
  MAX_STR_LEN: 100 | 0,
  MAX_PILE_LEN: 50 | 0
};



},{}],3:[function(require,module,exports){
var field;

field = {
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

module.exports = field;



},{}],4:[function(require,module,exports){
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



},{}],5:[function(require,module,exports){
var destoroyah;

destoroyah = require('./main');

module.exports = destoroyah;

if (typeof window !== 'undefined') {
  window.destoroyah = destoroyah;
  window.awake = destoroyah.awake;
  window.rampage = destoroyah.rampage;
  window.equipWith = destoroyah.equipWith;
  window.beforeRampage = destoroyah.beforeRampage;
  window.afterRampage = destoroyah.afterRampage;
  window.whenAwake = destoroyah.whenAwake;
  window.whenCalm = destoroyah.whenCalm;
  window.hoping = destoroyah.hoping;
  window.attack = destoroyah.attack;
  window.field = destoroyah.field;
}



},{"./main":6}],6:[function(require,module,exports){
var BitterStruggle, Destoroyah, DestoroyahResult, MonsterEventEmitter, Rampage, attack, attackModule, constants, destoroyah, field, fieldModule, hoping, hopingModule, util,
  __slice = [].slice,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

fieldModule = require('./field');

attackModule = require('./attack');

hopingModule = require('./hopes');

constants = require('./const');

util = require('./util');

field = fieldModule;

attack = attackModule.attacks;

hoping = hopingModule.hopes;


/*
  Globals
 */

module.exports = destoroyah = {
  field: field,
  attack: attack,
  hoping: hoping,
  constants: constants,
  modules: {
    field: fieldModule,
    attack: attackModule,
    hoping: hopingModule,
    util: util
  }
};

MonsterEventEmitter = (function() {
  function MonsterEventEmitter() {
    this.listeners = {};
    this._eventId = 0;
  }

  MonsterEventEmitter.prototype._fireEvent = function() {
    var args, eventName, f, id, _ref, _results;
    eventName = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
    if (!(eventName in this.listeners)) {
      return;
    }
    _ref = this.listeners[eventName];
    _results = [];
    for (id in _ref) {
      f = _ref[id];
      _results.push(f.apply(this, args));
    }
    return _results;
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
    return detach = this.on(eventName, function() {
      f.apply(this, arguments);
      return detach();
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
      return that._fireEvent.apply(that, args);
    });
  };

  return MonsterEventEmitter;

})();

BitterStruggle = (function(_super) {
  __extends(BitterStruggle, _super);

  function BitterStruggle() {
    this.monsters = [];
    this.activeMonster = null;
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
    return this.monsters.push(monster);
  };

  BitterStruggle.prototype.fight = function() {
    var monster, _i, _len, _ref, _results;
    this._fireEvent('start');
    try {
      _ref = this.monsters;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        monster = _ref[_i];
        this.activeMonster = monster;
        _results.push(monster.awake());
      }
      return _results;
    } finally {
      this._fireEvent('end');
    }
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

destoroyah.bitterStruggle = new BitterStruggle();


/*
  Awakening
 */

Destoroyah = (function(_super) {
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

  function Destoroyah(reason, angryness, setup) {
    this.reason = reason;
    this.angryness = angryness;
    this.setup = setup;
    this.reset();
    Destoroyah.__super__.constructor.call(this);
  }

  Destoroyah.prototype.addRampage = function(rampage) {
    if (__indexOf.call(this.rampages, rampage) < 0) {
      this.detach.push(rampage.through('defended', this));
      this.detach.push(rampage.through('defeated', this));
      this.rampages.push(rampage);
    }
  };

  Destoroyah.prototype.awake = function() {
    var error, rampage, res, _i, _len, _ref;
    this.reset();
    this.setup();
    this._fireEvent('start');
    res = null;
    try {
      _ref = this.rampages;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        rampage = _ref[_i];
        this._fireEvent('start rampage', rampage);
        try {
          res = rampage.punch(this.angryness);
          this._fireEvent('end rampage', rampage, res);
        } catch (_error) {
          error = _error;
          this._fireEvent('error rampage', rampage, error);
        }
      }
    } finally {
      this._fireEvent('end');
    }
  };

  return Destoroyah;

})(MonsterEventEmitter);

destoroyah.awake = function(reason, angryness, setup) {
  if (setup == null) {
    setup = angryness;
    angryness = 100;
  }
  return destoroyah.bitterStruggle.addMonster(new Destoroyah(reason, angryness, setup));
};


/*
  Rampage
 */

Rampage = (function(_super) {
  __extends(Rampage, _super);

  Rampage._lastId = 0;

  function Rampage(reason, hope, f, field) {
    this.reason = reason;
    this.hope = hope;
    this.f = f;
    this.field = field;
    this.id = Rampage._lastId++;
    Rampage.__super__.constructor.call(this);
  }

  Rampage.prototype._attackWith = function(att, angryness) {
    return destoroyah.forAll(this.f, att, this.hope, this.field, angryness);
  };

  Rampage.prototype.attacks = function() {
    var attackNames, fnParams;
    if (!(fnParams = this.f.toString().match(/function\s*?\((.+)\)/))) {
      return [];
    }
    attackNames = fnParams[1].split(',');
    return attackNames.map((function(_this) {
      return function(genName) {
        var attackName;
        attackName = genName.split('_')[0];
        attackName = attackName.trim();
        if (attackName in attack) {
          return attack[attackName]();
        }
        throw new Error('Attack "' + attackName + '" not found for rampage ' + _this.reason + ', not equipped?');
      };
    })(this));
  };

  Rampage.prototype.punch = function(angryness) {
    var res;
    res = this._attackWith(this.attacks(), angryness);
    if (res.failed) {
      this._fireEvent('defeated', res);
    } else {
      this._fireEvent('defended', res);
    }
    return res;
  };

  return Rampage;

})(MonsterEventEmitter);

destoroyah.rampage = function(reason, hope, f) {
  var r;
  if (!f) {
    f = hope;
    hope = hoping.isTrue();
  }
  r = new Rampage(reason, hope, f, destoroyah.field.even);
  destoroyah.bitterStruggle.activeMonster.addRampage(r);
  return r;
};


/*
  Setup
 */

destoroyah.equipWith = function(forceName, f) {
  destoroyah.bitterStruggle.activeMonster.once('start', function() {
    return attackModule.registerAttack(forceName, true, f);
  });
  return destoroyah.bitterStruggle.activeMonster.once('end', function() {
    return attackModule.unregisterAttack(forceName);
  });
};

destoroyah.beforeRampage = function(f) {
  var detach;
  detach = destoroyah.bitterStruggle.activeMonster.on('start rampage', f);
  return destoroyah.bitterStruggle.activeMonster.once('end', function() {
    return detach();
  });
};

destoroyah.afterRampage = function(f) {
  var detach;
  detach = [];
  detach.push(destoroyah.bitterStruggle.activeMonster.on('end rampage', f));
  detach.push(destoroyah.bitterStruggle.activeMonster.on('error rampage', f));
  return destoroyah.bitterStruggle.activeMonster.once('end', function() {
    var d, _i, _len, _results;
    _results = [];
    for (_i = 0, _len = detach.length; _i < _len; _i++) {
      d = detach[_i];
      _results.push(d());
    }
    return _results;
  });
};

destoroyah.whenAwake = function(f) {
  return destoroyah.bitterStruggle.activeMonster.once('start', f);
};

destoroyah.whenCalm = function(f) {
  return destoroyah.bitterStruggle.activeMonster.once('end', f);
};


/*
  main test runner
 */

destoroyah.fulfillsHope = function(func, args, hope) {
  var error;
  try {
    return hope(func.apply(null, args)) !== false;
  } catch (_error) {
    error = _error;
    error.__destoroyah = args;
    throw error;
  }
};

destoroyah.combo = function(possibilities) {
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

DestoroyahResult = (function() {
  function DestoroyahResult(failed, angryness, combos, lastArguments, startTime) {
    this.failed = failed;
    this.angryness = angryness;
    this.combos = combos;
    this.lastArguments = lastArguments;
    this.time = new Date().getTime() - startTime;
  }

  return DestoroyahResult;

})();

destoroyah.forAll = function(func, thisAttacks, hope, field, angryness) {
  var allCases, args, caseCombo, caseCombos, comboArgs, combos, complexity, edgeCases, failed, startTime, _i, _j, _k, _len, _len1;
  startTime = new Date().getTime();
  if (thisAttacks.length > 0) {
    edgeCases = thisAttacks.map(function(att) {
      return att.edgeCases().concat([att.execute(field)]);
    });
    combos = destoroyah.combo(edgeCases);
    for (_i = 0, _len = combos.length; _i < _len; _i++) {
      comboArgs = combos[_i];
      if (!destoroyah.fulfillsHope(func, comboArgs, hope)) {
        return new DestoroyahResult(true, angryness, combos.length, comboArgs, startTime);
      }
    }
    allCases = thisAttacks.map(function(e) {
      return e.cases();
    });
    complexity = allCases.length > 0 ? allCases.reduce((function(acc, e) {
      if (!e) {
        return Infinity;
      } else {
        return acc * e.length;
      }
    }), 1) : 0;
    if (complexity <= angryness) {
      angryness = complexity;
      caseCombos = destoroyah.combo(allCases);
      for (_j = 0, _len1 = caseCombos.length; _j < _len1; _j++) {
        caseCombo = caseCombos[_j];
        if (!destoroyah.fulfillsHope(func, caseCombo, hope)) {
          return new DestoroyahResult(true, angryness, combos.length, caseCombo, startTime);
        }
      }
    } else {
      for (_k = 1; 1 <= angryness ? _k <= angryness : _k >= angryness; 1 <= angryness ? _k++ : _k--) {
        args = thisAttacks.map(function(a) {
          return a.execute(field);
        });
        if (!destoroyah.fulfillsHope(func, args, hope)) {
          return new DestoroyahResult(true, angryness, combos.length, args, startTime);
        }
      }
    }
  } else {
    angryness = 1;
    combos = [];
    if (!destoroyah.fulfillsHope(func, [], hope)) {
      return new DestoroyahResult(true, angryness, 0, [], startTime);
    }
  }
  failed = 'finally' in hope ? hope["finally"]() === false : false;
  return new DestoroyahResult(failed, angryness, combos.length, [], startTime);
};



},{"./attack":1,"./const":2,"./field":3,"./hopes":4,"./util":7}],7:[function(require,module,exports){
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



},{}]},{},[5])