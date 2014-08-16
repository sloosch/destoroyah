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
