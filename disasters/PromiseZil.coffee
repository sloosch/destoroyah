#use of promises for async testing
#where destoroyah.Promise is either an es6 promise or a compatible polyfill
awake 'Promise', 10, ->

  #return a promise and resolve it later
  rampage 'on timeout', (pInt) -> new destoroyah.Promise (resolve, reject) ->
    setTimeout (-> resolve(pInt >= 0)), 100
