var DestoroyahRunner, EXPOSE, chalk, destoroyah, setup, survivor, util;

destoroyah = require('./../destoroyah/main');

survivor = require('./../reporter/survivor');

chalk = require('chalk');

setup = require('../destoroyah/setup');

EXPOSE = require('../destoroyah/const').EXPOSE;

util = require('../destoroyah/util');

module.exports = DestoroyahRunner = (function() {
  function DestoroyahRunner(files) {
    this.files = files;
  }

  DestoroyahRunner.prototype._exposeGlobals = function() {
    global.destoroyah = destoroyah;
    setup.extend('rampage', global);
    setup.extend('monster', global);
    setup.extend('struggle', global);
    return EXPOSE.forEach(function(propName) {
      return global[propName] = destoroyah[propName];
    });
  };

  DestoroyahRunner.prototype._hideGlobals = function() {
    delete global.destoroyah;
    setup.dispose('rampage', global);
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
    var tearDown;
    this._exposeGlobals();
    tearDown = (function(_this) {
      return function() {
        _this._hideGlobals();
        destoroyah.bitterStruggle.surrender();
        _this._unloadFiles();
      };
    })(this);
    this._loadFiles();
    survivor()(destoroyah.bitterStruggle);
    return util["finally"](destoroyah.bitterStruggle.fight(), tearDown);
  };

  return DestoroyahRunner;

})();
