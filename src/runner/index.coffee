DestoroyahRunner = require './runner'
gaze = require 'gaze'
glob = require 'glob'
path = require 'path'

try
  require('coffee-script').register()

globs = process.argv.slice(2)

run = ->
  files = globs
  .reduce ((acc, g) -> acc.concat glob.sync g), []
  .map (e) -> path.resolve e
  runner = new DestoroyahRunner(files)
  runner.run()

gaze globs, (err, watcher) ->
  if err
    console.error err
    return
  @.on 'all', run

run()
