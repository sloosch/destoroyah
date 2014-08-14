charRepeater = (char, length) ->
  return '' if length == 0
  (char for [1..length]).join ''

awake 'Repeater', 10, ->

  rampage 'on the char repeater', (char, pInt_length) ->
    generated = charRepeater char, pInt_length
    return generated.length is 0 if char is null or char is ''
    generated.length is pInt_length
