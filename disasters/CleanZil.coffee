awake 'Clean', ->
  equipWith 'current', -> attack.anyOf Object.keys(attack)
  equipWith 'defaults', -> attack.constant ['current', 'defaults',
    'pileOf',
    'constant',
    'bool',
    'sign',
    'pDecimal',
    'nDecimal',
    'decimal',
    'pInt',
    'nInt',
    'int',
    'random',
    'char',
    'string',
    'object',
    'anyOf',
    'pile',
    'cb',
    'fn',
    'instance']

  rampage 'on custom attacks are exclusive to each monster', (current, defaults) -> defaults.indexOf(current) >= 0
