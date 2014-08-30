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
    this._setup();
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
