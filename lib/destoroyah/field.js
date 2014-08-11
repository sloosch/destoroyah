var field;

field = {
  even: function() {
    return Math.random();
  },
  gauss: function() {
    return (Math.random() + Math.random() + Math.random() + Math.random()) / 4.0;
  },
  iGauss: function() {
    var r;
    r = Math.random() - Math.random() + Math.random() - Math.random();
    if (r < 0) {
      r += 4.0;
    }
    return r / 4.0;
  },
  edges: function() {
    var r;
    r = Math.random();
    return r * r * (3 - 2 * r);
  },
  lowerEdge: function() {
    return Math.min(Math.random(), Math.random(), Math.random(), Math.random(), Math.random(), Math.random());
  },
  upperEdge: function() {
    return Math.max(Math.random(), Math.random(), Math.random(), Math.random(), Math.random(), Math.random());
  },
  softEdges: function() {
    if (field.even() > 0.5) {
      return field.lowerEdge();
    } else {
      return field.upperEdge();
    }
  }
};

module.exports = field;
