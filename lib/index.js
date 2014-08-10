(function() {
  var createPattern, initDestoroyah;

  createPattern = function(path) {
    return {
      pattern: path,
      included: true,
      served: true,
      watched: false
    };
  };

  initDestoroyah = function(files) {
    files.unshift(createPattern(__dirname + '/adapter.js'));
    files.unshift(createPattern(__dirname + '/destoroyah.js'));
  };

  initDestoroyah.$inject = ['config.files'];

  module.exports = {
    'framework:destoroyah': ['factory', initDestoroyah]
  };

}).call(this);
