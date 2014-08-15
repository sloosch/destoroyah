awake 'Hope', ->

  equipWith 'setOfTruthy', -> attack.anyOf [true, 'foo', {}, []]
  equipWith 'setOfNotTruthy', -> attack.anyOf [undefined, null, NaN, 0]
  equipWith 'rangeOf10', -> attack.anyOf [-10..10]
  equipWith 'range20to30', -> attack.anyOf [20..30]
  equipWith 'setOfFoo', -> attack.anyOf ['foo', 'bar', 'baz']

  rampage 'on default is true', -> true
  rampage 'on is true', hoping.isTrue(), -> true
  rampage 'on is false', hoping.isFalse(), -> false
  rampage 'on is Truthy', hoping.isTruthy(), (setOfTruthy) -> setOfTruthy
  rampage 'on is not Truthy', hoping.not.isTruthy(), (setOfNotTruthy) -> setOfNotTruthy
  rampage 'on is equal', hoping.isEqual('foo'), -> 'foo'
  rampage 'on is not equal', hoping.not.isEqual('foo'), -> 'bar'
  rampage 'on is defined', hoping.isDefined(), (setOfTruthy) -> setOfTruthy
  rampage 'on is not defined', hoping.not.isDefined(), -> undefined
  rampage 'on is positive', hoping.isPositive(true), (pInt) -> pInt
  rampage 'on is not positive', hoping.not.isPositive(), (nInt) -> nInt
  rampage 'on is null', hoping.isNull(), -> null
  rampage 'on is not null', hoping.not.isNull(), (int) -> int
  rampage 'on is in range', hoping.isInRange(-10, 10, true), (rangeOf10) -> rangeOf10
  rampage 'on is not in range', hoping.not.isInRange(-10, 10), (range20to30) -> range20to30
  rampage 'on is one of', hoping.isOneOf(['foo', 'bar', 'baz']), (setOfFoo) -> setOfFoo
  rampage 'on is not one of', hoping.not.isOneOf(['quux', 'zap', 'higgs']), (setOfFoo) -> setOfFoo

  rampage 'on some are true', hoping.that().some(hoping.isTrue()), (bool) -> bool
  rampage 'on everyone is true with guard', hoping.that((v) -> v == true).all(hoping.isTrue()), (bool) -> bool
  rampage 'on no one is true', hoping.that().none(hoping.isTrue()), (setOfFoo) -> setOfFoo
  rampage 'on not all are the same', hoping.that().notAll(hoping.isEqual('foo')), (setOfFoo) -> setOfFoo
