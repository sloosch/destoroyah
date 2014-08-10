createPattern = (path) ->
  pattern : path, included : true, served : true, watched : false
initDestoroyah = (files) ->
  files.unshift createPattern __dirname + '/adapter.js'
  files.unshift createPattern __dirname + '/destoroyah.js'
  return
initDestoroyah.$inject = ['config.files']

module.exports = 'framework:destoroyah' : ['factory', initDestoroyah]
