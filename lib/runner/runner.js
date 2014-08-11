(function() {
  var DestoroyahRunner, chalk, destoroyah, survivor;

  destoroyah = require('./../destoroyah/main');

  survivor = require('./../reporter/survivor');

  chalk = require('chalk');

  module.exports = DestoroyahRunner = (function() {
    function DestoroyahRunner(files) {
      this.files = files;
    }

    DestoroyahRunner.prototype._exposable = function() {
      return ['awake', 'rampage', 'field', 'attack', 'equipWith', 'hoping', 'beforeAttack', 'afterAttack'];
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
      this._exposeGlobals();
      try {
        this._loadFiles();
        survivor()(destoroyah.bitterStruggle);
        return destoroyah.bitterStruggle.fight();
      } finally {
        this._hideGlobals();
        destoroyah.bitterStruggle.surrender();
        this._unloadFiles();
      }
    };

    return DestoroyahRunner;

  })();

}).call(this);
