var DestoroyahResult, Promise, TestRun, hopes, util;

Promise = require('./promise');

util = require('./util');

hopes = require('./hopes');

exports.DestoroyahResult = DestoroyahResult = (function() {
  function DestoroyahResult(failed1, angryness1, combos, lastArguments, startTime) {
    this.failed = failed1;
    this.angryness = angryness1;
    this.combos = combos;
    this.lastArguments = lastArguments;
    this.time = new Date().getTime() - startTime;
  }

  return DestoroyahResult;

})();

exports.TestRun = TestRun = (function() {
  function TestRun(func1, thisAttacks1, hope1, field1, angryness1) {
    this.func = func1;
    this.thisAttacks = thisAttacks1;
    this.hope = hope1;
    this.field = field1;
    this.angryness = angryness1;
    this.lastArguments = [];
    if (this.thisAttacks.length > 0) {
      this.edgeCases = this.thisAttacks.map((function(_this) {
        return function(att) {
          return att.edgeCases().concat([att.execute(_this.field)]);
        };
      })(this));
      this.combos = util.combo(this.edgeCases);
      this.allCases = this.thisAttacks.map(function(e) {
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
