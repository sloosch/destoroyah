##Disaster Driven Development
_disastrous quickcheck-like testing framework - let the disaster happen during development, not after deployment_

>[...]Destoroyah is also the only enemy that actually hurt Godzilla emotionally when he killed Godzilla Jr.

###What is this for?
As an example we will try to write a function that repeats a char n times  
####BDD style, coding by example  
```coffeescript
describe 'char repeater', ->
  it 'should return a string of given length', ->
    generated = charRepeater('c', 100)
    expect(generated.length).toBe(100)
```
will may raise the implementation
```coffeescript
charRepeater = (char, length) -> (char for [1..length]).join ''
```
Test is green! Deploy!  
let the disaster happen: `charRepeater('a', 0)` ... gives `a` ?! but the test said its ok!  
...bugfixing time...

####DDD style, no need to think of every possible argument  
```coffeescript
awake 'repeater', ->
  rampage 'on the char repeater', (char, pInt_length) ->
    generated = charRepeater(char, pInt_length)
    generated.length == pInt_length
```
now **destoroyah** will complain that the `charRepeater` doesn't fulfill our hopes in each case  
**destoroyah** will force you to the correct implementation  
```coffeescript
charRepeater = (char, length) -> if length > 0 then (char for [1..length]).join '' else ''
```

###Install

`npm install -g destoroyah`

###Disasters
Write your **disasters** according to the [introduction](https://github.com/sloosch/destoroyah/blob/master/introduction.litcoffee)
You may want to consider using coffee-script to keep your disasters as clean as possible.

###Burn!
open the terminal and type `destoroyah [--watch] [disasters]` e.g. `destoroyah './disasters/*Zil.coffee'` to run each disaster in the 'disasters' folder.  
`--watch` will run the disasters after each file change
