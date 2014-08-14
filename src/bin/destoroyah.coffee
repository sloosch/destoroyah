DestoroyahRunner = require './../lib/runner/default'
gaze = require 'gaze'
glob = require 'glob'
path = require 'path'
program = require 'commander'
pkg = require './../package.json'

try
  require('coffee-script').register()

list = (val) -> val.split ', '

program
.version pkg.version
.usage '[options] [files]'
.option '-w, --watch', 'run disasters on file changes (changes on disaster files are always watched, even when -e or -d are set)'
.option '-e, --watchExtension <extensions>'
  ,'file extension to watch for changes - defaults to "js, coffee"'
  ,list
.option '-d, --watchDirectory <paths>'
  ,'only watch files in this directories - defaults to the current working directory'
  , list
.parse process.argv

disasterFiles = program.args
disasterFiles = ['disasters/*'] if disasterFiles.length == 0

run = ->
  files = disasterFiles
  .reduce ((acc, g) -> acc.concat glob.sync g), []
  .map (e) -> path.resolve e
  runner = new DestoroyahRunner(files)
  runner.run()

if program.watch?
  wd = if program.watchDirectory? then program.watchDirectory else [process.cwd()]
  defaultExtensions = ['js', 'coffee']
  if program.watchExtension?
    defaultExtensions = program.watchExtension

  toWatch = disasterFiles.slice 0
  wd.forEach (dir) ->
    toWatch = toWatch.concat defaultExtensions.map (e) -> dir + '/**/*.' + e
    toWatch.push '!' + dir + '/node_modules/**'

  gaze toWatch, (err, watcher) ->
    if err
      console.error err
      process.exit 1
    @.on 'all', (event, filepath) ->
      console.log event + ' ' + filepath
      delete require.cache[filepath]
      run()

failed = run()
process.exit(1) if not program.watch? && failed
