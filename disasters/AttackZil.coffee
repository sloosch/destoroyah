awake 'Attacks', ->

  equipWith 'pileOfFn', -> attack.anyOf({fnName : fnName, fn : fn} for fnName, fn of attack.pileOf)
  equipWith 'anObject', -> attack.object {foo : 'string', baz : 'int'}
  equipWith 'anItem', -> attack.anyOf ['foo', 1], [999, 'baz']
  equipWith 'aCustomValue', -> attack.fn (dist) -> 'Call ' + ((dist() * 1000) | 0) + ' for emergency'

  rampage 'on decimal', (decimal) -> typeof decimal == 'number'
  rampage 'on positive decimal', (pDecimal) -> typeof pDecimal == 'number' && pDecimal >= 0
  rampage 'on negative decimal', (nDecimal) -> typeof nDecimal == 'number' && nDecimal <= 0
  rampage 'on integer', (int) -> typeof int == 'number' && (int | 0) - int == 0
  rampage 'on positive integer', (pInt) -> typeof pInt == 'number' && (pInt | 0) - pInt == 0 && pInt >= 0
  rampage 'on negative interger', (nInt) -> typeof nInt == 'number' && (nInt | 0) - nInt == 0 && nInt <= 0
  rampage 'on boolean', (bool) -> bool == true || bool == false
  rampage 'on sign', (sign) -> sign == -1 || sign == 1
  rampage 'on char', (char) -> char == null || (typeof char == 'string' && (char.length == 0 || char.length == 1))
  rampage 'on string', (string) -> string == null || (typeof string == 'string')
  rampage 'on aCustomValue',  (aCustomValue) -> /^Call \d{0,3} for emergency$/.test aCustomValue
  rampage 'on pile of functions', (pileOfFn) ->
    return true if pileOfFn.fnName == 'pile'
    if pileOfFn.fnName == 'anyOf'
      pile = pileOfFn.fn([1, 2]).execute(field.even)
    else if pileOfFn.fnName == 'object'
      pile = pileOfFn.fn({foo : 'string'}).execute(field.even)
    else if pileOfFn.fnName == 'fn'
      pile = pileOfFn.fn(-> 'foo').execute(field.even)
    else
      pile = pileOfFn.fn().execute(field.even)
    pile.length == 0 || (typeof pile[0] != 'undefined')
  rampage 'on object', (anObject) ->
    anObject == null || (typeof anObject.foo == 'string' && typeof anObject.baz == 'number')
  rampage 'on an item choosen from any of', (anItem) ->
    anItem == 'foo' || anItem == 1 || anItem == 999 || anItem == 'baz'
