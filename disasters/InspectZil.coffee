awake 'Inspect', ->
  #for debugging purpose one can use `inspect` to output the given value
  rampage 'on inspectation', hoping.isEqual('foo'), ->
    inspect 'foo' #will output 'foo'
