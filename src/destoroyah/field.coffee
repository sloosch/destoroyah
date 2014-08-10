field =
  even : -> Math.random()
  gauss : -> (Math.random() + Math.random() + Math.random() + Math.random()) / 4.0
  iGauss : ->
    r = Math.random() - Math.random() + Math.random() - Math.random()
    r += 4.0 if r < 0
    r / 4.0
  edges : ->
    r = Math.random()
    r * r * (3 - 2 * r)
  lowerEdge : -> Math.min(Math.random(), Math.random(), Math.random(), Math.random(), Math.random(), Math.random())
  upperEdge : -> Math.max(Math.random(), Math.random(), Math.random(), Math.random(), Math.random(), Math.random())
  softEdges : -> if field.even() > 0.5 then field.lowerEdge() else field.upperEdge()

module.exports = field
