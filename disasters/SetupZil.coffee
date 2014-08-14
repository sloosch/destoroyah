calms = false
awakes = false
beforeRampages = 0
afterRampages = 0
awake 'Setup methods', 0, ->

  whenAwake ->
    awakes = true
    beforeRampages = 0
    afterRampage = 0

  whenCalm -> calms = true

  beforeRampage -> beforeRampages++
  
  afterRampage -> afterRampages++

  rampage 'on nothing', -> true
  rampage 'on more than nothing', -> true

awake 'PostSetup', 0, ->
  rampage 'on whenAwake hook called in Setup', -> awakes
  rampage 'on whenCalm hook called in Setup', -> calms
  rampage 'on beforeRampage hook called for each rampage of Setup', -> beforeRampages == 2
  rampage 'on afterRampage hook called for each rampage of Setup', -> afterRampages == 2
