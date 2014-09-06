awake 'Attacks', ->

  class Foo
    constructor : (@someInt, @someString) ->
    bar : -> 'baz'

  equipWith 'pileOfFn', -> attack.anyOf({fnName : fnName, fn : fn} for fnName, fn of attack.pileOf)
  equipWith 'anObject', -> attack.object {foo : 'string', baz : 'int'}
  equipWith 'anItem', -> attack.anyOf ['foo', 1], [999, 'baz']
  equipWith 'aCustomValue', -> attack.cb (dist) -> 'Call ' + ((dist() * 1000) | 0) + ' for emergency'
  equipWith 'composedObjAttack', -> attack.object {an : 'anObject', value : 'aCustomValue', foo : 'string'}
  equipWith 'aConstant', -> attack.constant 42
  equipWith 'fooInstance', -> attack.instance Foo, 'int', 'string'
  equipWith 'limitedNumbers', ->
    attack.object
      int : -> attack.int 10
      pInt : -> attack.pInt 10
      nInt : -> attack.nInt 10
      decimal : -> attack.decimal 10
      pDecimal : -> attack.pDecimal 10
      nDecimal : -> attack.nDecimal 10
  equipWith 'aFunctionReturningFoo', -> attack.fn 'fooInstance'

  rampage 'on decimal', (decimal) -> typeof decimal == 'number'
  rampage 'on positive decimal', (pDecimal) -> typeof pDecimal == 'number' && pDecimal >= 0
  rampage 'on negative decimal', (nDecimal) -> typeof nDecimal == 'number' && nDecimal <= 0
  rampage 'on integer', (int) -> typeof int == 'number' && (int | 0) - int == 0
  rampage 'on positive integer', (pInt) -> typeof pInt == 'number' && (pInt | 0) - pInt == 0 && pInt >= 0
  rampage 'on negative interger', (nInt) -> typeof nInt == 'number' && (nInt | 0) - nInt == 0 && nInt <= 0
  rampage 'on positive decimal being greater than 0', hoping.that().some((v) -> v > 0), (pDecimal) -> pDecimal
  rampage 'on negative decimal being less than 0', hoping.that().some((v) -> v < 0), (nDecimal) -> nDecimal
  rampage 'on positive int being greater than 0', hoping.that().some((v) -> v > 0), (pInt) -> pInt
  rampage 'on negative int being less than 0', hoping.that().some((v) -> v < 0), (nInt) -> nInt
  rampage 'on number limiting', (limitedNumbers) ->
    return true if limitedNumbers == null
    limitedNumbers.int >= -10 && limitedNumbers.int <= 10 &&
    limitedNumbers.pInt >= 0 && limitedNumbers.pInt <= 10 &&
    limitedNumbers.nInt >= -10 && limitedNumbers.nInt <= 0 &&
    limitedNumbers.decimal >= -10 && limitedNumbers.decimal <= 10 &&
    limitedNumbers.pDecimal >= 0 && limitedNumbers.pDecimal <= 10 &&
    limitedNumbers.nDecimal >= -10 && limitedNumbers.nDecimal <= 0

  rampage 'on the random generator', (random) -> random >= 0 && random <= 1
  rampage 'on boolean', hoping.that().some(hoping.isTrue(), hoping.isFalse()), (bool) -> bool
  rampage 'on sign', hoping.that().some(((v) -> v == -1), ((v) -> v == 1)), (sign) -> sign
  rampage 'on char', (char) -> char == null || (typeof char == 'string' && (char.length == 0 || char.length == 1))
  rampage 'on string', (string) -> string == null || (typeof string == 'string')
  rampage 'on aCustomValue',  (aCustomValue) -> /^Call \d{0,3} for emergency$/.test aCustomValue

  rampage 'on pile of functions', (pileOfFn) ->
    return true if pileOfFn.fnName == 'pile'
    if pileOfFn.fnName == 'anyOf'
      pile = pileOfFn.fn([1, 2]).execute(field.even)
    else if pileOfFn.fnName == 'object'
      pile = pileOfFn.fn({foo : 'string'}).execute(field.even)
    else if pileOfFn.fnName == 'cb'
      pile = pileOfFn.fn(-> 'foo').execute(field.even)
    else if pileOfFn.fnName == 'fn'
      pile = pileOfFn.fn(attack.pInt).execute(field.even)
    else if pileOfFn.fnName == 'constant'
      pile = pileOfFn.fn(42).execute(field.even)
    else if pileOfFn.fnName == 'instance'
      pile = pileOfFn.fn(Foo, 'int', 'string').execute(field.even)
    else
      pile = pileOfFn.fn().execute(field.even)
    pile.length == 0 || (typeof pile[0] != 'undefined')
  rampage 'on object', (anObject) ->
    anObject == null || (typeof anObject.foo == 'string' && typeof anObject.baz == 'number')
  rampage 'on an item choosen from any of', (anItem) ->
    anItem == 'foo' || anItem == 1 || anItem == 999 || anItem == 'baz'
  rampage 'on another object referencing other attacks', (composedObjAttack) ->
    composedObjAttack == null or
    ('string' == typeof composedObjAttack.foo &&
    /^Call \d{0,3} for emergency$/.test(composedObjAttack.value) &&
    'string' == typeof composedObjAttack.an.foo &&
    'number' == typeof composedObjAttack.an.baz)
  rampage 'on a constant value', (aConstant) -> aConstant == 42
  rampage 'on an instance of foo', (fooInstance) ->
    fooInstance == null or
    (fooInstance instanceof Foo &&
    fooInstance.bar() == 'baz' &&
    'number' == typeof fooInstance.someInt &&
    'string' == typeof fooInstance.someString)
  rampage 'on a function returning arbitary Foos', (aFunctionReturningFoo) ->
    retVal = aFunctionReturningFoo()
    retVal == null or retVal instanceof Foo
  rampage 'on a renamed attack', (fooInstance_bar) -> fooInstance_bar == null || fooInstance_bar instanceof Foo
