field = require './field'
constants = require './const'

exports.attacks = attackRegistry = {pileOf : {}}

exports.registerAttack = registerAttack = (attackName, pile, constr) ->
  attackRegistry[attackName] = -> constr arguments...
  if pile
    attackRegistry.pileOf[attackName] = -> new PileOfAttack(attackRegistry[attackName] arguments...)
exports.unregisterAttack = unregisterAttack = (attackName) ->
  delete attackRegistry[attackName]
  delete attackRegistry.pileOf[attackName]

exports.resolveAttack = resolveAttack = (attackName) ->
  if 'function' == typeof attackName
    attack = attackName()
  else if attackName instanceof Attack
    attack = attackName
  else
    throw new Error('Couldn\'t find attack "' + attackName + '"') unless attackName of attackRegistry
    attack = attackRegistry[attackName]()
  throw new Error(attack + ' is not an attack') unless attack instanceof Attack
  attack

exports.Attack = class Attack
  constructor : (@args...) -> @_init @args...
  execute : (dist) ->
    @_prepare()
    args = (arg for arg in @args)
    args.unshift(dist || null)
    @_perform args...
  _prepare : ->
  _init : ->
  cases : -> undefined
  edgeCases : -> throw new Error(@ + ' doesn\'t provide any edge cases.')
  _perform : (dist) -> throw new Error('Perform not implemented for attack ' + @)

exports.ConstantAttack = class ConstantAttack extends Attack
  _init : (@value) ->
  edgeCases : -> []
  cases : -> [@value]
  _perform : -> @value

registerAttack 'constant', true, (value) -> new ConstantAttack(value)

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

exports.PDecimalAttack = class PDecimalAttack extends Attack
  edgeCases : -> [0, Math.sqrt(2)]
  _init : (@max=constants.MAX_NUMBER) ->
  _perform : (dist) -> dist() * @max

registerAttack 'pDecimal', true, (max) -> new PDecimalAttack(max)

exports.NDecimalAttack = class NDecimalAttack extends PDecimalAttack
  edgeCases : -> [0, -Math.sqrt(2)]
  _perform : (dist) -> -super(dist)

registerAttack 'nDecimal', true, (max) -> new NDecimalAttack(max)

exports.DecimalAttack = class DecimalAttack extends PDecimalAttack
  edgeCases : -> [-Math.sqrt(2), 0, Math.sqrt(2)]
  _init : ->
    super arguments...
    @sign = new SignAttack()
  _perform : (dist) ->
    @sign.execute(field.even) * super(dist)

registerAttack 'decimal', true, (max) -> new DecimalAttack(max)

exports.PIntAttack = class PIntAttack extends PDecimalAttack
  edgeCases : -> [0]
  cases : ->
    if @max <= constants.MAX_PILE_LEN
      return (i for i in [0..@max])
    return
  _perform : (dist) -> super(dist) | 0

registerAttack 'pInt', true, (max) -> new PIntAttack(max)

exports.NIntAttack = class NIntAttack extends NDecimalAttack
  edgeCases : -> [0]
  cases : ->
    if @max <= constants.MAX_PILE_LEN
      return (-i for i in [0..@max])
    return
  _perform : (dist) -> super(dist) | 0

registerAttack 'nInt', true, (max) -> new NIntAttack(max)

exports.IntAttack = class IntAttack extends DecimalAttack
  edgeCases : -> [0]
  cases : ->
    if 2 * @max <= constants.MAX_PILE_LEN
      return (i for i in [-@max..@max])
    return
  _perform : (dist) -> super(dist) | 0

registerAttack 'int', true, (max) -> new IntAttack(max)

exports.RandomAttack = class RandomAttack extends Attack
  edgeCases : -> [0, 1]
  _perform : (dist) -> dist()

registerAttack 'random', true, -> new RandomAttack()

exports.CharAttack = class CharAttack extends Attack
  edgeCases : -> ['', null]
  cases : -> constants.CHARSET.split('')
  _perform : (dist) -> constants.CHARSET.charAt (dist() * constants.CHARSET.length) | 0

registerAttack 'char', true, -> new CharAttack()

exports.StringAttack = class StringAttack extends CharAttack
  cases : -> undefined
  _perform : (dist) ->
    len = (dist() * constants.MAX_STR_LEN) | 0
    if len > 0 then (super(dist) for [1..len]).join('') else ''

registerAttack 'string', true, -> new StringAttack()

exports.ObjectAttack = class ObjectAttack extends Attack
  edgeCases : -> [null]
  _perform : (dist, example) ->
    obj = {}
    for k, v of example
      obj[k] = resolveAttack(v).execute(dist)
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

exports.CallbackAttack = class CallbackAttack extends Attack
  _init : (@fn, @edges = []) ->
  edgeCases : -> @edges
  _perform : (dist) -> @fn dist

registerAttack 'cb', true, (fn, edges) -> new CallbackAttack(fn, edges)

exports.FunctionAttack = class FunctionAttack extends Attack
  _init : (returningAttack) ->
    @attack = resolveAttack returningAttack
  _createFn : (returnVal) -> -> returnVal
  edgeCases : ->
    edgeCases = @attack.edgeCases()
    if edgeCases
      edgeCases.map (c) => @_createFn c
  cases : ->
    cases = @attack.cases()
    if cases
      cases.map (c) =>  @_createFn c
  _perform : (dist) -> @_createFn @attack.execute(dist)

registerAttack 'fn', true, (returningAttack) -> new FunctionAttack(returningAttack)

exports.InstanceAttack = class InstanceAttack extends Attack
  edgeCases : -> [null]
  _perform : (dist, constr, args) ->
    constrArgs = if args then args.map (e) -> resolveAttack(e).execute(dist) else []
    new constr(constrArgs...)

registerAttack 'instance', true, (constr, args...) -> new InstanceAttack(constr, args)
