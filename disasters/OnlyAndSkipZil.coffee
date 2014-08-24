awake 'Only', 0, ->
  #only run this rampage
  rrampage 'on only this one', -> true

  #therefore never run this one
  rampage 'on has been excluded', -> false

awake 'Skip', 0, ->
  #run this
  rampage 'on not being skipped', -> true

  #and skip this
  xrampage 'on has been skipped', -> false

#never awake this one
xawake 'Never Awakes', ->
  rampage 'on is awake', -> false
