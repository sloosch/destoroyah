var DestoroyahRunner, EXPOSE, chalk, destoroyah, setup, survivor;

destoroyah = require('./../destoroyah/main');

survivor = require('./../reporter/survivor');

chalk = require('chalk');

setup = require('../destoroyah/setup');

EXPOSE = require('../destoroyah/const').EXPOSE;

module.exports = DestoroyahRunner = (function() {
  function DestoroyahRunner(files) {
    this.files = files;
  }

  DestoroyahRunner.prototype._exposeGlobals = function() {
    global.destoroyah = destoroyah;
    setup.extend('monster', global);
    setup.extend('struggle', global);
    return EXPOSE.forEach(function(propName) {
      return global[propName] = destoroyah[propName];
    });
  };

  DestoroyahRunner.prototype._hideGlobals = function() {
    delete global.destoroyah;
    setup.dispose('monster', global);
    setup.dispose('struggle', global);
    return EXPOSE.forEach(function(propName) {
      return delete global[propName];
    });
  };

  DestoroyahRunner.prototype._loadFiles = function() {
    return this.files.forEach(function(file) {
      return require(file);
    });
  };

  DestoroyahRunner.prototype._unloadFiles = function() {
    return this.files.forEach(function(file) {
      return delete require.cache[file];
    });
  };

  DestoroyahRunner.prototype.run = function() {
    var detach, tearDown;
    this._exposeGlobals();
    detach = [];
    detach.push(destoroyah.bitterStruggle.on('defeated', function() {
      var failed;
      return failed = true;
    }));
    detach.push(destoroyah.bitterStruggle.on('error rampage', function() {
      var failed;
      return failed = true;
    }));
    tearDown = (function(_this) {
      return function() {
        _this._hideGlobals();
        destoroyah.bitterStruggle.surrender();
        _this._unloadFiles();
        return detach.forEach(function(f) {
          return f();
        });
      };
    })(this);
    this._loadFiles();
    survivor()(destoroyah.bitterStruggle);
    return destoroyah.bitterStruggle.fight().then(tearDown, tearDown);
  };

  return DestoroyahRunner;

})();
