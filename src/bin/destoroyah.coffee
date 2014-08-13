DestoroyahRunner = require './../lib/runner/default'
gaze = require 'gaze'
glob = require 'glob'
path = require 'path'
program = require 'commander'
pkg = require './../package.json'

try
  require('coffee-script').register()

program
.version(pkg.version)
.usage '[options] [files]'
.option '-w, --watch', 'run disasters on file changes'
.parse process.argv

globs = program.args
globs = ['disasters/*'] if globs.length == 0

run = ->
  files = globs
  .reduce ((acc, g) -> acc.concat glob.sync g), []
  .map (e) -> path.resolve e
  runner = new DestoroyahRunner(files)
  runner.run()

if program.watch?
  gaze globs, (err, watcher) ->
    if err
      console.error err
      process.exit(1)
    @.on 'all', run

failed = run()
process.exit(1) if not program.watch? && failed
