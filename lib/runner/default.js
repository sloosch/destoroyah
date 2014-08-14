var DestoroyahRunner, chalk, destoroyah, survivor;

destoroyah = require('./../destoroyah/main');

survivor = require('./../reporter/survivor');

chalk = require('chalk');

module.exports = DestoroyahRunner = (function() {
  function DestoroyahRunner(files) {
    this.files = files;
  }

  DestoroyahRunner.prototype._exposable = function() {
    return ['awake', 'rampage', 'field', 'attack', 'equipWith', 'hoping', 'beforeRampage', 'afterRampage', 'whenAwake', 'whenCalm'];
  };

  DestoroyahRunner.prototype._exposeGlobals = function() {
    return this._exposable().forEach(function(propName) {
      return global[propName] = destoroyah[propName];
    });
  };

  DestoroyahRunner.prototype._hideGlobals = function() {
    return this._exposable().forEach(function(propName) {
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
    var detach, failed;
    failed = false;
    this._exposeGlobals();
    detach = [];
    detach.push(destoroyah.bitterStruggle.on('defeated', function() {
      return failed = true;
    }));
    detach.push(destoroyah.bitterStruggle.on('error rampage', function() {
      return failed = true;
    }));
    try {
      this._loadFiles();
      survivor()(destoroyah.bitterStruggle);
      destoroyah.bitterStruggle.fight();
      return failed;
    } finally {
      this._hideGlobals();
      destoroyah.bitterStruggle.surrender();
      this._unloadFiles();
      detach.forEach(function(f) {
        return f();
      });
    }
  };

  return DestoroyahRunner;

})();
