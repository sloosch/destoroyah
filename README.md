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
forgot the not so obvious case:
```coffeescript
it 'should return a zero length string when given length is 0', ->
  generated = charRepeater('c', 0)
  expect(generated.length).toBe(0)
```
...
####DDD style, no need to think of every possible argument
write a [disaster](https://github.com/sloosch/destoroyah/blob/master/introduction.litcoffee)
```coffeescript
awake 'Repeater', ->
  rampage 'on the char repeater', (char, pInt_length) ->
    generated = charRepeater(char, pInt_length)
    return generated.length is 0 if char is null or char is ''
    generated.length is pInt_length
```
now **destoroyah** will complain that the `charRepeater` doesn't fulfill our hopes in each case  
**destoroyah** will force you to the correct implementation  
```coffeescript
charRepeater = (char, length) ->
  return '' if length == 0
  (char for [1..length]).join ''
```

###Why you should care?
Because whether you not me can think of all possibilities that can happen to your functions.
Bad arguments like NULL, an empty string, empty array... in combination with good arguments.
A quickcheck framework knows these edge cases and tests them.
Even further it generates hundreds of test cases for you.
The function will by tested with all possible cases - not just the ones we thought about.

###Disasters
Write your **disasters** according to the [introduction](https://github.com/sloosch/destoroyah/blob/master/introduction.litcoffee)
You may want to consider using coffee-script to keep your disasters as clean as possible.

#####Why those names? "awake", "rampage", "angryness", "attack", "hope"....
Because writing tests should be fun!  
"A monster is going on a rampage on your functions by attacking it with arguments.
You can just sit there and hope that your function withstands these attacks."
No this is no joke, it is a fully working simple to use QuickCheck testing library.

#####I don't like these childish names! How do they translate to my beloved BDD?
- awake = describe
- rampage = it
- hope = expect
- disaster = specification
- monster = test suite
- attacks = generated arguments you use for your function
- angryness = maximum number of test cases

###Install

`npm install -g destoroyah`


###Can i win the Fields Medal?
Yes you can [BhargavaZil](https://github.com/sloosch/destoroyah/blob/master/disasters/BhargavaZil.coffee)!

###Burn!
open the terminal and type `destoroyah [--watch] [disasters]` e.g. `destoroyah './disasters/*Zil.coffee'` to run each disaster in the 'disasters' folder.  
`--watch` will run the disasters after each file change in the current directory

    Usage: destoroyah [options] [files]

      Options:

        -h, --help                         output usage information
        -V, --version                      output the version number
        -w, --watch                        run disasters on file changes (changes on disaster files are always watched, even when -e or -d are set)
        -e, --watchExtension <extensions>  file extension to watch for changes - defaults to "js, coffee"
        -d, --watchDirectory <paths>       only watch files in this directories - defaults to the current working directory

###Karma
to run with karma use [karma-destoroyah](https://github.com/sloosch/karma-destoroyah)
