chalk = require 'chalk'
logSymbols = require 'log-symbols'
util = require './../destoroyah/util'

paintMonsterRampage = (monster, rampage) -> monster.reason + ' ' + rampage.reason

module.exports = survivor = -> (bitterStruggle) ->
  detach = []
  results = []
  detach.push bitterStruggle.on 'awake monster', (monster) ->
    console.log chalk.gray(chalk.underline.magenta(monster.reason) +  ' awakes, rampage')
  detach.push bitterStruggle.on 'end rampage', (monster, rampage, destResult) ->
    msg = ''
    if destResult.failed
      msg = chalk.red(logSymbols.error + ' Defeated by the monster ' + chalk.bold(rampage.reason) +
      ' with arguments: ' +
      util.argFormat(destResult.lastArguments))
    else
      msg = chalk.green(' ...' + rampage.reason +
      ' (' + destResult.angryness + ' [+' + destResult.combos + '])' + ' ' + logSymbols.success)
    results.push destResult

    msg += chalk.blue(' » ' + util.argFormat([rampage.inspectedVal])) if rampage.inspected
    console.log '  ' + msg

  detach.push bitterStruggle.on 'error rampage', (monster, rampage, error) ->
    msg = 'Found a weak spot, fight ended unfair "' + chalk.bold(rampage.reason) + '" with error ' + error
    msg += '\nfought with arguments ' + util.argFormat(error.__destoroyah) if error.__destoroyah?
    msg += '\n' + error.stack if error.stack?
    console.log '  ' + chalk.red(logSymbols.error + ' ' + msg)

  detach.push bitterStruggle.on 'end', ->
    f() for f in detach
    console.log chalk.magenta.bold.underline logSymbols.info + ' Match summary:'
    fails = results.reduce ((acc, r) -> if r.failed then acc + 1 else acc), 0
    attacks = results.reduce ((acc, r) -> acc + r.combos + r.angryness), 0
    console.log chalk.gray 'Failed to defeat ' + fails + ' rampages, monsters have attacked ' + attacks + ' times'
