var DestoroyahRunner, gaze, glob, globs, path, run;

DestoroyahRunner = require('./runner');

gaze = require('gaze');

glob = require('glob');

path = require('path');

try {
  require('coffee-script').register();
} catch (_error) {}

globs = process.argv.slice(2);

run = function() {
  var files, runner;
  files = globs.reduce((function(acc, g) {
    return acc.concat(glob.sync(g));
  }), []).map(function(e) {
    return path.resolve(e);
  });
  runner = new DestoroyahRunner(files);
  return runner.run();
};

gaze(globs, function(err, watcher) {
  if (err) {
    console.error(err);
    return;
  }
  return this.on('all', run);
});

run();
