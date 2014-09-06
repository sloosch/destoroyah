#use of promises for async testing
#where destoroyah.Promise is either an es6 promise or a compatible polyfill
awake 'Promise', 10, ->
  #return a promise and resolve it later available in the setup functions and in the rampage

  whenAwake -> new destoroyah.Promise (resolve, reject) ->
    setTimeout ->
      console.log 'waited 1000ms when awake'
      resolve()
    , 1000

  whenCalm -> new destoroyah.Promise (resolve, reject) ->
    setTimeout ->
      console.log 'waited 1000ms when calm'
      resolve()
    , 1000

  beforeRampage -> new destoroyah.Promise (resolve, reject) ->
    setTimeout ->
      console.log 'waited 1000ms before rampage'
      resolve()
    , 1000

  afterRampage -> new destoroyah.Promise (resolve, reject) ->
    setTimeout ->
      console.log 'waited 1000ms after rampage'
      resolve()
    , 1000

  rampage 'on timeout', (pInt) -> new destoroyah.Promise (resolve, reject) ->
    setTimeout (-> resolve(pInt >= 0)), 100
