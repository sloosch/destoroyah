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
  }

  MonsterEventEmitter.prototype._fireEvent = function() {
    var args, eventName, f, _i, _len, _ref, _results;
    eventName = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
    if (eventName in this.listeners) {
      _ref = this.listeners[eventName];
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        f = _ref[_i];
        _results.push(f.apply(this, args));
      }
      return _results;
    }
  };

  MonsterEventEmitter.prototype.on = function(eventName, f) {
    if (!(eventName in this.listeners)) {
      this.listeners[eventName] = [];
    }
    this.listeners[eventName].push(f);
    return (function(_this) {
      return function() {
        var index;
        index = _this.listeners[eventName].indexOf(f);
        if (!(index < 0)) {
          return _this.listeners[eventName].splice(index, 1);
        }
      };
    })(this);
  };

  MonsterEventEmitter.prototype.through = function() {
    var addition, eventName, renamedTo, that;
    eventName = arguments[0], that = arguments[1], renamedTo = arguments[2], addition = 4 <= arguments.length ? __slice.call(arguments, 3) : [];
    return this.on(eventName, (function(_this) {
      return function() {
        var arg, args;
        args = [_this];
        args = args.concat(arguments.length > 0 ? (function() {
          var _i, _len, _results;
          _results = [];
          for (_i = 0, _len = arguments.length; _i < _len; _i++) {
            arg = arguments[_i];
            _results.push(arg);
          }
          return _results;
        }).apply(_this, arguments) : []);
        args.unshift(renamedTo || eventName);
        if (addition != null) {
          args = args.concat(addition);
        }
        return that._fireEvent.apply(that, args);
      };
    })(this));
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
    this.additionalAttack = {};
    this.rampages = [];
    this.befores = [];
    this.afters = [];
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

  Destoroyah.prototype._registerAdditionalAttacks = function() {
    var attackConstr, attackName, _ref;
    _ref = this.additionalAttack;
    for (attackName in _ref) {
      attackConstr = _ref[attackName];
      attackModule.registerAttack(attackName, true, attackConstr);
    }
  };

  Destoroyah.prototype._unregisterAdditionalAttacks = function() {
    var attackConstr, attackName, _ref;
    _ref = this.additionalAttack;
    for (attackName in _ref) {
      attackConstr = _ref[attackName];
      attackModule.unregisterAttack(attackName);
    }
  };

  Destoroyah.prototype.awake = function() {
    var after, before, error, rampage, res, _i, _j, _k, _len, _len1, _len2, _ref, _ref1, _ref2;
    this.reset();
    this.setup();
    this._fireEvent('start');
    res = null;
    try {
      _ref = this.rampages;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        rampage = _ref[_i];
        this._fireEvent('start rampage', rampage);
        this._registerAdditionalAttacks();
        try {
          _ref1 = this.befores;
          for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
            before = _ref1[_j];
            before();
          }
          res = rampage.punch(this.angryness);
          _ref2 = this.afters;
          for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
            after = _ref2[_k];
            after();
          }
          this._fireEvent('end rampage', rampage, res);
        } catch (_error) {
          error = _error;
          this._fireEvent('error rampage', rampage, error);
        }
      }
    } finally {
      this._unregisterAdditionalAttacks();
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
  return destoroyah.bitterStruggle.activeMonster.additionalAttack[forceName] = function() {
    return f();
  };
};

destoroyah.beforeAttack = function(f) {
  return destoroyah.bitterStruggle.activeMonster.befores.push(f);
};

destoroyah.afterAttack = function(f) {
  return destoroyah.bitterStruggle.activeMonster.afters.push(f);
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
