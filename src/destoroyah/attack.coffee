field = require './field'
constants = require './const'

exports.attacks = attackRegistry = {pileOf : {}}

exports.registerAttack = registerAttack = (attackName, pile, constr) ->
  attackRegistry[attackName] = -> constr.apply null, arguments
  if pile
    attackRegistry.pileOf[attackName] = -> new PileOfAttack(attackRegistry[attackName].apply null, arguments)
exports.unregisterAttack = unregisterAttack = (attackName) ->
  delete attackRegistry[attackName]
  delete attackRegistry.pileOf[attackName]

exports.Attack = class Attack
  constructor : (@args...) -> @_init.apply @, args
  execute : (dist) ->
    @_prepare()
    args = (arg for arg in @args)
    args.unshift(dist || null)
    @_perform.apply @, args
  _prepare : ->
  _init : ->
  cases : -> undefined
  edgeCases : -> throw new Error(@ + ' doesn\'t provide any edge cases.')
  _perform : (dist) -> throw new Error('Perform not implemented for attack ' + @)

exports.BoolAttack = class BoolAttack extends Attack
  edgeCases : -> [true, false]
  cases : -> @edgeCases()
  _perform : (dist) -> dist() > 0.5

registerAttack 'bool', true, -> new BoolAttack()

exports.SignAttack = class SignAttack extends BoolAttack
  edgeCases : -> [-1, 1]
  cases : -> @edgeCases()
  _perform : (dist) -> if super(dist) then -1 else 1

registerAttack 'sign', true, -> new SignAttack()

class PDecimalAttack extends Attack
  edgeCases : -> [0, Math.sqrt(2)]
  _perform : (dist) -> dist() * constants.MAX_NUMBER

registerAttack 'pDecimal', true, -> new PDecimalAttack()

exports.NDecimalAttack = class NDecimalAttack extends PDecimalAttack
  edgeCases : -> [0, -Math.sqrt(2)]
  _perform : (dist) -> -super(dist)

registerAttack 'nDecimal', true, -> new NDecimalAttack()

exports.DecimalAttack = class DecimalAttack extends PDecimalAttack
  edgeCases : -> [-Math.sqrt(2), 0, Math.sqrt(2)]
  _init : -> @sign = new SignAttack()
  _perform : (dist) ->
    @sign.execute(field.even) * super(dist)

registerAttack 'decimal', true, -> new DecimalAttack()

exports.PIntAttack = class PIntAttack extends PDecimalAttack
  edgeCases : -> [0]
  _perform : (dist) -> super(dist) | 0

registerAttack 'pInt', true, -> new PIntAttack()

exports.NIntAttack = class NIntAttack extends NDecimalAttack
  edgeCases : -> [0]
  _perform : (dist) -> super(dist) | 0

registerAttack 'nInt', true, -> new NIntAttack()

exports.IntAttack = class IntAttack extends DecimalAttack
  edgeCases : -> [0]
  _perform : (dist) -> super(dist) | 0

registerAttack 'int', true, -> new IntAttack()

exports.CharAttack = class CharAttack extends Attack
  edgeCases : -> ['', null]
  cases : -> constants.CHARSET.split('')
  _perform : (dist) -> constants.CHARSET.charAt (dist() * constants.CHARSET.length) | 0

registerAttack 'char', true, -> new CharAttack()

exports.StringAttack = class StringAttack extends CharAttack
  _perform : (dist) ->
    len = (dist() * constants.MAX_STR_LEN) | 0
    if len > 0 then (super(dist) for [1..len]).join('') else ''

registerAttack 'string', true, -> new StringAttack()

exports.ObjectAttack = class ObjectAttack extends Attack
  edgeCases : -> [null]
  _perform : (dist, example) ->
    obj = {}
    for k, v of example
      attack = null
      if typeof v == 'function'
        attack = v()
      else
        throw new Error('Couldn\'t find ' + v + ' attack for key ' + k) unless v of attackRegistry
        attack = attackRegistry[v]()
      throw new Error(v + ' for key ' + k ' is not an attack') unless attack instanceof Attack
      obj[k] = attack.execute dist
    obj

registerAttack 'object', true, (example) -> new ObjectAttack(example)

exports.AnyOfAttack = class AnyOfAttack extends Attack
  _init : (@arr=[], @edges=[]) ->
  edgeCases : -> @edges
  cases : -> @arr
  _perform : (dist, arr) -> @arr[(dist() * @arr.length) | 0]

registerAttack 'anyOf', true, (arr, edges) -> new AnyOfAttack(arr, edges)

exports.PileOfAttack = class PileOfAttack extends Attack
  edgeCases : -> [[], null]
  _perform : (dist, innerAttack) ->
    len = (dist() * constants.MAX_PILE_LEN) | 0
    (innerAttack.execute(dist) for [1..len])

registerAttack 'pile', true, (innerAttack) -> new PileOfAttack(innerAttack)
