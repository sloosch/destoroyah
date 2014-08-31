var MonsterEventEmitter, Rampage, attack, setup, testrun, util,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

MonsterEventEmitter = require('./event').MonsterEventEmitter;

attack = require('./attack').attacks;

testrun = require('./testrun');

setup = require('./setup');

util = require('./util');

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
    var attacksUsed, test;
    this.reset();
    attacksUsed = this._attackNames();
    setup.bindTo('rampage', this);
    test = testrun.forAll(this.f, this._attacks(attacksUsed), this.hope, this.field, angryness).then((function(_this) {
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
