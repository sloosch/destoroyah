var BitterStruggle, Destoroyah, DestoroyahResult, MonsterEventEmitter, Promise, Rampage, TestRun, attack, attackModule, constants, destoroyah, field, fieldModule, hoping, hopingModule, util,
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

Promise = require('./promise');


/*
  Globals
 */

module.exports = destoroyah = {
  field: field,
  attack: attack,
  hoping: hoping,
  constants: constants,
  Promise: Promise,
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
    this.monsters.push(monster);
    return monster;
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
        util.cbForEach(runOn, function(monster, next) {
          _this.activeMonster = monster;
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
    this._fireEvent('start');
    return util["finally"](this._runEachMonster(), (function(_this) {
      return function() {
        return _this._fireEvent('end');
      };
    })(this));
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
    this.only = false;
    this.skip = false;
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
        util.cbForEach(runOn, function(rampage, next) {
          _this._fireEvent('start rampage', rampage);
          return rampage.start(_this.angryness).then(function(res) {
            hasBrokenThrough || (hasBrokenThrough = res.failed);
            _this._fireEvent('end rampage', rampage, res);
            if (!next()) {
              return resolve(hasBrokenThrough);
            }
          })["catch"](function(e) {
            hasBrokenThrough = true;
            _this._fireEvent('error rampage', rampage, e);
            return reject(e);
          });
        });
      };
    })(this));
  };

  Destoroyah.prototype.awake = function() {
    this.reset();
    this.setup();
    this._fireEvent('start');
    return util["finally"](this._runEachRampage(), (function(_this) {
      return function() {
        return _this._fireEvent('end');
      };
    })(this));
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

destoroyah.aawake = function(reason, angryness, setup) {
  var monster;
  monster = destoroyah.awake.apply(destoroyah, arguments);
  monster.only = true;
  return monster;
};

destoroyah.xawake = function(reason, angryness, setup) {
  var monster;
  monster = destoroyah.awake.apply(destoroyah, arguments);
  monster.skip = true;
  return monster;
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
    this.result = null;
    this.only = false;
    this.skip = false;
    Rampage.__super__.constructor.call(this);
  }

  Rampage.prototype._attackNames = function() {
    var attackNames, fnParams;
    if (!(fnParams = this.f.toString().match(/^function\s*?\((.+)\)/))) {
      return [];
    }
    attackNames = fnParams[1].split(',');
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
    var attacksUsed;
    this.result = null;
    attacksUsed = this._attackNames();
    return destoroyah.forAll(this.f, this._attacks(attacksUsed), this.hope, this.field, angryness).then((function(_this) {
      return function(res) {
        _this.result = res;
        if (res.failed) {
          _this._fireEvent('defeated', res);
        } else {
          _this._fireEvent('defended', res);
        }
        return res;
      };
    })(this));
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

destoroyah.rrampage = function(reason, hope, f) {
  var rampage;
  rampage = destoroyah.rampage.apply(destoroyah, arguments);
  rampage.only = true;
  return rampage;
};

destoroyah.xrampage = function(reasion, hope, f) {
  var rampage;
  rampage = destoroyah.rampage.apply(destoroyah, arguments);
  rampage.skip = true;
  return rampage;
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

TestRun = (function() {
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
      this.combos = destoroyah.combo(this.edgeCases);
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
            return destoroyah.fulfillsHope(_this.func, comboArgs, _this.hope).then(util.either((function() {
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
          destoroyah.fulfillsHope(_this.func, [], _this.hope).then(util.either(resolve, reject), reject);
        } else if (_this.complexity <= _this.angryness) {
          _this.angryness = _this.complexity;
          caseCombos = destoroyah.combo(_this.allCases);
          util.cbForEach(caseCombos, function(caseCombo, next) {
            _this.lastArguments = caseCombo;
            return destoroyah.fulfillsHope(_this.func, caseCombo, _this.hope).then(util.either((function() {
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
            return destoroyah.fulfillsHope(_this.func, args, _this.hope).then(util.either((function() {
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

destoroyah.forAll = function(func, thisAttacks, hope, field, angryness) {
  return new TestRun(func, thisAttacks, hope, field, angryness).runAll();
};
