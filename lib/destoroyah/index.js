var destoroyah;

destoroyah = require('./main');

module.exports = destoroyah;

if (typeof window !== 'undefined') {
  window.destoroyah = destoroyah;
  window.awake = destoroyah.awake;
  window.rampage = destoroyah.rampage;
  window.equipWith = destoroyah.equipWith;
  window.beforeRampage = destoroyah.beforeRampage;
  window.afterRampage = destoroyah.afterRampage;
  window.whenAwake = destoroyah.whenAwake;
  window.whenCalm = destoroyah.whenCalm;
  window.hoping = destoroyah.hoping;
  window.attack = destoroyah.attack;
  window.field = destoroyah.field;
}
