DestoroyahRunner = require './../lib/runner/default'
gaze = require 'gaze'
glob = require 'glob'
path = require 'path'
util = require './../lib/destoroyah/util'
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

lastRun = null
run = ->
  files = disasterFiles
  .reduce ((acc, g) -> acc.concat glob.sync g), []
  .map (e) -> path.resolve e
  runner = new DestoroyahRunner(files)
  lastRun = runner.run()

if program.watch?
  runQueue = []
  wd = if program.watchDirectory? then program.watchDirectory else [process.cwd()]
  defaultExtensions = ['js', 'coffee']
  if program.watchExtension?
    defaultExtensions = program.watchExtension

  toWatch = disasterFiles.slice 0
  wd.forEach (dir) ->
    toWatch = toWatch.concat defaultExtensions.map (e) -> dir + '/**/*.' + e
    toWatch.push '!' + dir + '/node_modules/**'

  waiting = false
  gaze toWatch, (err, watcher) ->
    if err
      console.error err
      process.exit 1
    @.on 'all', (event, filepath) ->
      runQueue.push event : event, filepath : filepath
      unless waiting
        waiting = true
        util.finally lastRun, ->
          for ev in runQueue
            console.log ev.event + ' ' + ev.filepath
            delete require.cache[ev.filepath]
          runQueue = []
          waiting = false
          run()

util.finally run(), (broken) ->
  process.exit(1) if broken && not program.watch?
