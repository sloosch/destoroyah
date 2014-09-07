###Basics

**awake** a monster of choice going on a rampage on your functions

Here we've named the creature 'evil monster' with an **angryness** of 123 (when omitted, defaults to 100)

    awake 'evil monster', 123, ->

let the creature go on a **rampage** on the foo function

    rampage 'on foo function',(pInt, bool) -> foo(pInt, bool) > 100

the arguments supplied to the rampage function are **attacks**.
These attacks are generated automagically for you.
In our case for each attempt of destoroyah to breakthrough we will get a different positiveInteger and boolean.

Here is a rampage with all built-in attacks which can be used without any previous setup

    rampage 'with everything', (decimal, pDecimal, nDecimal, int, pInt, nInt, bool, sign, char, string) -> surrender()

You may want to rename the attack when having multiple arguments of the same type

    rampage 'on quux', (pInt_fooBar, int_Higgs, int_Boson, string_name) -> foo(pInt_fooBar, int_Higgs, int_Boson, string_name)

A rampage will end when the function doesn't fulfills your **hope** or after the monster calms down based on his **angryness**.
By default we hope that the return value of each attack is true. This time lets hope that the value is defined

    rampage 'on bar', hoping.isDefined(), (int, sign) -> quux(int, sign)

the rampage will end when _quux_ doesn't return a defined value

There are many more predefined **hopes** - take a look at the **HopeZil** disaster.

###Adding own attacks

Equip the monster with some special attacks

    equipWith 'fooAttack', -> attack.anyOf ['foo', 'bar', 'baz']
    equipWith 'barObject', -> attack.object {foo : 'string', bar : 'pInt'}

and attack with your new super powers

    rampage 'on victim', (fooAttack, barObject) -> foo(fooAttack, barObject) != 42

of course renaming is possible

    rampage 'on victim', (fooAttack_numberOne, fooAttack_numberTwo) -> foo(fooAttack_numberOne, fooAttack_numberTwo) != 42

you may also reference a just equipped attack again

    equipWith 'pileOfFooAttacks', -> attack.pileOf.fooAttack()

where `attack.pileOf.<attack_name>` will generate an array of some length with the given attack e.g.

    equipWith 'pileOfInts', -> attack.pileOf.int()

will give an array of ints

referencing when creating an object is also possible

    equipWith 'quuxObject', -> attack.object {bar : 'barObject', name : 'string'}


possible known edge cases are always tried first to break your function

    rampage 'on baz with char', (char) -> quux(char) > 42

attacks on _quux_ will include an empty char and even null to make sure your function withstands even the roughest environments

the edge case of _int_ is 0 and the edge case of a pile is an empty array

    rampage 'on baz with int and pile', (int, pileOfInts) -> quux(int, pileOfInts) -> 42

destoroyah is evil enough to test each combination of these edge cases e.g. above attack will include `[0, []], [<any int>, []], [0, <any pile>]`

when using an _anyOf_ attack we can define our own edge case

    equipWith 'fooAttackWithEdges', -> attack.anyOf ['foo', 'bar'], ['baz', null]

where 'baz' and null are the edge cases


the monster is smart enough to may stop the rampage early when he did tried all possible attacks

    rampage 'on baz with fooAttack', (fooAttack) -> quux(fooAttack) > 42

_quux_ will be attacked just three times because _fooAttack_ just defined three cases

also works for boolean and sign attacks even in combination

    rampage 'on baz with bool and sign', (bool, sign) -> quux(bool, sign) > 42

_quux_ will be attacked four times [true, 1], [true, -1], [false, 1] and [false, -1]

attacks with infinity possibilities will stop when the monster calms down

    rampage 'on baz with decimal', (decimal) -> quux(decimal) > 42

_quux_ is attacked **angryness** times because a decimal number has an infinity number of cases

###Before and After

do some setup when destoroyah awakes

    whenAwake -> loadSomethingForEveryRampage()

do some cleanup work when destoroyah has completed all rampages and calms down

    whenCalm -> cleanAndRebuilt()

you may like to setup something before each rampage

    beforeRampage -> setupMocks()

or after each rampage

    afterRampage -> resetSomething()

###Focus

set the focus on one rampage

    rrampage 'on only this one will be executed', -> quux()

or skip a rampage

    xrampage 'on will never run', -> foo()

may never awake a whole suite

    xawake 'Always Sleeping', ->
      rampage 'never seen', -> foo()
      rampage 'never executed', -> quux()

or just awake one

    aawake 'Just This One', ->
      rampage 'on something', -> foo()

###Promises
wait for an asynchron event to happen via ES6 promises

    rampage 'on that promise', hoping.isEqual('foo'), -> new destoroyah.Promise (resolve, reject) ->
      asyncStuff (result)-> resolve(result)

`destoroyah.Promise` is either the native ES6 promise or a compatible polyfill

also possible in the setup functions

    stuff = null
    whenAwake -> new destoroyah.Promise (resolve, reject) ->
      requestStuff (result) ->
        stuff = result
        resolve()

    whenCalm -> new destoroyah.Promise (resolve, reject) ->
      cleanUpRemote resolve, reject

    beforeRampage (rampage) -> new destoroyah.Promise (resolve, reject) ->
      asynchronWriteStuff rampage, (res) -> if res then resolve() else reject()

    afterRampage (rampage) -> new destoroyah.Promise (resolve, reject) ->
      cleanUpStuff rampage, (res) -> resolve()

beside es6 promises, thenable frameworks like Q, P, bluebird etc. are supported

    whenAwake destoroyah.thenable ->
      defer = Q.defer()
      asyncFoo -> defer.resolve()
      defer.promise

so we can for example quickcheck a whole page with **Destoroyah** and [Zombie](https://github.com/assaf/zombie)

    Zombie = require 'zombie'

    awake 'Zombies', ->

      browser = null

      whenAwake destoroyah.thenable ->
        browser = new Zombie()
        browser.visit('http://sloosch.github.io/destoroyah/')

      rampage 'on my homepage', hoping.isEqual('Destoroyah'), ->
        browser.text('header > h1')
