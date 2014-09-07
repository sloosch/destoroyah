fieldModule = require './field'
attackModule = require './attack'
hopingModule = require './hopes'
constants = require './const'
util = require './util'
bitterStruggle = require('./struggle').bitterStruggle
Promise = require './promise'
setup = require './setup'
field = fieldModule
attack = attackModule.attacks
hoping = hopingModule.hopes

module.exports = destoroyah =
  field : field
  attack : attack
  hoping : hoping
  constants : constants
  Promise : Promise
  thenable : util.thenable
  bitterStruggle : bitterStruggle
  modules :
    field : fieldModule
    attack : attackModule
    hoping : hopingModule
    util : util
setup.extend 'monster', destoroyah
setup.extend 'struggle', destoroyah
