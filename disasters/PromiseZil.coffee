#use of promises for async testing
#where destoroyah.Promise is either an es6 promise or a compatible polyfill
awake 'Promise', 10, ->
  #return a promise and resolve it later available in the setup functions and in the rampage

  whenAwake -> new destoroyah.Promise (resolve, reject) ->
    setTimeout ->
      console.log 'waited 500ms when awake'
      resolve()
    , 500

  whenCalm -> new destoroyah.Promise (resolve, reject) ->
    setTimeout ->
      console.log 'waited 500ms when calm'
      resolve()
    , 500

  beforeRampage -> new destoroyah.Promise (resolve, reject) ->
    setTimeout ->
      console.log 'waited 500ms before rampage'
      resolve()
    , 500

  afterRampage -> new destoroyah.Promise (resolve, reject) ->
    setTimeout ->
      console.log 'waited 500ms after rampage'
      resolve()
    , 500

  rampage 'on timeout', (pInt) -> new destoroyah.Promise (resolve, reject) ->
    setTimeout (-> resolve(pInt >= 0)), 100

  rampage 'on thenable frameworks like Q, P, bluebird etc.', destoroyah.thenable (pInt) ->
    mockedThenable = {
      then : (resolve, reject) ->
        setTimeout (-> resolve(pInt >= 0)), 100
    }

  whenCalm destoroyah.thenable ->
    mockedThenable = {
      then : (resolve, reject) ->
        setTimeout (->
          console.log 'waited 500ms for a thenable when calm'
          resolve()
          ), 500
    }
