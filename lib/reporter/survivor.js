var chalk, logSymbols, paintMonsterRampage, survivor, util;

chalk = require('chalk');

logSymbols = require('log-symbols');

util = require('./../destoroyah/util');

paintMonsterRampage = function(monster, rampage) {
  return monster.reason + ' ' + rampage.reason;
};

module.exports = survivor = function() {
  return function(bitterStruggle) {
    var detach, results;
    detach = [];
    results = [];
    detach.push(bitterStruggle.on('awake monster', function(monster) {
      return console.log(chalk.gray(chalk.underline.magenta(monster.reason) + ' awakes, rampage'));
    }));
    detach.push(bitterStruggle.on('end rampage', function(monster, rampage, destResult) {
      var msg;
      msg = '';
      if (destResult.failed) {
        msg = chalk.red(logSymbols.error + ' Defeated by the monster ' + chalk.bold(rampage.reason) + ' with arguments: ' + util.argFormat(destResult.lastArguments));
      } else {
        msg = chalk.green(' ...' + rampage.reason + ' (' + destResult.angryness + ' [+' + destResult.combos + '])' + ' ' + logSymbols.success);
      }
      results.push(destResult);
      return console.log('  ' + msg);
    }));
    detach.push(bitterStruggle.on('error rampage', function(monster, rampage, error) {
      var msg;
      msg = 'Found a weak spot, fight ended unfair "' + chalk.bold(rampage.reason) + '" with error ' + error;
      if (error.__destoroyah != null) {
        msg += '\nfought with arguments ' + util.argFormat(error.__destoroyah);
      }
      return console.log('  ' + chalk.red(logSymbols.error + ' ' + msg));
    }));
    return detach.push(bitterStruggle.on('end', function() {
      var attacks, f, fails, _i, _len;
      for (_i = 0, _len = detach.length; _i < _len; _i++) {
        f = detach[_i];
        f();
      }
      console.log(chalk.magenta.bold.underline(logSymbols.info + ' Match summary:'));
      fails = results.reduce((function(acc, r) {
        if (r.failed) {
          return acc + 1;
        } else {
          return acc;
        }
      }), 0);
      attacks = results.reduce((function(acc, r) {
        return acc + r.combos + r.angryness;
      }), 0);
      return console.log(chalk.gray('Failed to defeat ' + fails + ' rampages, monsters have attacked ' + attacks + ' times'));
    }));
  };
};
