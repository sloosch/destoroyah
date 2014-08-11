var destoroyah;

destoroyah = require('./main');

module.exports = destoroyah;

if (typeof window !== 'undefined') {
  window.destoroyah = destoroyah;
  window.awake = destoroyah.awake;
  window.rampage = destoroyah.rampage;
  window.equipWith = destoroyah.equipWith;
  window.beforeAttack = destoroyah.beforeAttack;
  window.afterAttack = destoroyah.afterAttack;
  window.hoping = destoroyah.hoping;
  window.attack = destoroyah.attack;
  window.field = destoroyah.field;
}
