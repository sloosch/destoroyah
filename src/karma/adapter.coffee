destoroyah.karma = {}
destoroyah.karma.reporter = (karma) -> (bitterStruggle) ->
  bitterStruggle.on 'start', ->
    karma.info
      total : bitterStruggle.monsters.reduce ((acc, m) -> acc + m.rampages.length), 0
      specs : bitterStruggle.monsters.reduce ((acc, m) -> acc.concat m.rampages.map (r) -> r.reason), []
  bitterStruggle.on 'end', ->
    karma.complete()
  bitterStruggle.on 'end rampage', (monster, rampage, destResult) ->

    result =
      description : rampage.reason + ' (' + destResult.angryness + ' [+' + destResult.combos + '])'
      skipped : false
      success : !destResult.failed
      suite : [monster.reason]
      time : destResult.time
      id : rampage.id
    result.log = if destResult.failed
      ['Defeated by the monster with attack : ' + destoroyah.argFormat destResult.lastArguments]
    else
      []
    karma.result result
  bitterStruggle.on 'error rampage', (monster, rampage, error) ->
    msg = 'Found a weak spot, fight ended unfair with error ' + error
    msg += '\nfought with arguments ' + destoroyah.argFormat(error.__destoroyah) if error.__destoroyah?
    result =
      description : rampage.reason
      skipped : false
      success : false
      suite : [monster.reason]
      id : rampage.id
      log : [msg]
      time : 0
    karma.result result

window.__karma__.start = (config) ->
  destoroyah.karma.reporter(window.__karma__)(destoroyah.bitterStruggle)
  destoroyah.bitterStruggle.fight()
