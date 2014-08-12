var AnyOfAttack, Attack, BoolAttack, CharAttack, DecimalAttack, IntAttack, NDecimalAttack, NIntAttack, ObjectAttack, PDecimalAttack, PIntAttack, PileOfAttack, SignAttack, StringAttack, attackRegistry, constants, field, registerAttack, unregisterAttack,
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
      return new PileOfAttack(attackRegistry[attackName].apply(null, arguments));
    };
  }
};

exports.unregisterAttack = unregisterAttack = function(attackName) {
  delete attackRegistry[attackName];
  return delete attackRegistry.pileOf[attackName];
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

PDecimalAttack = (function(_super) {
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

registerAttack('pDecimal', true, function() {
  return new PDecimalAttack();
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

registerAttack('nDecimal', true, function() {
  return new NDecimalAttack();
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
    return this.sign = new SignAttack();
  };

  DecimalAttack.prototype._perform = function(dist) {
    return this.sign.execute(field.even) * DecimalAttack.__super__._perform.call(this, dist);
  };

  return DecimalAttack;

})(PDecimalAttack);

registerAttack('decimal', true, function() {
  return new DecimalAttack();
});

exports.PIntAttack = PIntAttack = (function(_super) {
  __extends(PIntAttack, _super);

  function PIntAttack() {
    return PIntAttack.__super__.constructor.apply(this, arguments);
  }

  PIntAttack.prototype.edgeCases = function() {
    return [0];
  };

  PIntAttack.prototype._perform = function(dist) {
    return PIntAttack.__super__._perform.call(this, dist) | 0;
  };

  return PIntAttack;

})(PDecimalAttack);

registerAttack('pInt', true, function() {
  return new PIntAttack();
});

exports.NIntAttack = NIntAttack = (function(_super) {
  __extends(NIntAttack, _super);

  function NIntAttack() {
    return NIntAttack.__super__.constructor.apply(this, arguments);
  }

  NIntAttack.prototype.edgeCases = function() {
    return [0];
  };

  NIntAttack.prototype._perform = function(dist) {
    return NIntAttack.__super__._perform.call(this, dist) | 0;
  };

  return NIntAttack;

})(NDecimalAttack);

registerAttack('nInt', true, function() {
  return new NIntAttack();
});

exports.IntAttack = IntAttack = (function(_super) {
  __extends(IntAttack, _super);

  function IntAttack() {
    return IntAttack.__super__.constructor.apply(this, arguments);
  }

  IntAttack.prototype.edgeCases = function() {
    return [0];
  };

  IntAttack.prototype._perform = function(dist) {
    return IntAttack.__super__._perform.call(this, dist) | 0;
  };

  return IntAttack;

})(DecimalAttack);

registerAttack('int', true, function() {
  return new IntAttack();
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
    var attack, k, obj, v;
    obj = {};
    for (k in example) {
      v = example[k];
      attack = null;
      if (typeof v === 'function') {
        attack = v();
      } else {
        if (!(v in attackRegistry)) {
          throw new Error('Couldn\'t find ' + v + ' attack for key ' + k);
        }
        attack = attackRegistry[v]();
      }
      if (!(attack instanceof Attack)) {
        throw new Error(v + ' for key ' + k(' is not an attack'));
      }
      obj[k] = attack.execute(dist);
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
