var Destoroyah, MonsterEventEmitter, Promise, Rampage, attackModule, field, hoping, setup, setupRampage, util,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty,
  indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

MonsterEventEmitter = require('./event').MonsterEventEmitter;

util = require('./util');

Promise = require('./promise');

setup = require('./setup');

hoping = require('./hopes').hopes;

Rampage = require('./rampage').Rampage;

attackModule = require('./attack');

field = require('./field');

exports.Destoroyah = Destoroyah = (function(superClass) {
  extend(Destoroyah, superClass);

  Destoroyah.prototype.reset = function() {
    var f, i, len, ref;
    this.rampages = [];
    if (this.detach != null) {
      ref = this.detach;
      for (i = 0, len = ref.length; i < len; i++) {
        f = ref[i];
        f();
      }
    }
    return this.detach = [];
  };

  function Destoroyah(reason1, angryness, setupFn) {
    this.reason = reason1;
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
    if (indexOf.call(this.rampages, rampage) < 0) {
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
    var d, i, len, results;
    results = [];
    for (i = 0, len = detach.length; i < len; i++) {
      d = detach[i];
      results.push(d());
    }
    return results;
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
