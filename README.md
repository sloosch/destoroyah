##Disaster Driven Development
_disastrous quickcheck-like testing framework - let the disaster happen during development, not after deployment_

>[...]Destoroyah is also the only enemy that actually hurt Godzilla emotionally when he killed Godzilla Jr.

###Install

`npm install -g destoroyah`

###Disasters
Write your **disasters** according to the [introduction](https://github.com/sloosch/destoroyah/blob/master/introduction.litcoffee)
You may want to consider using coffee-script to keep your disasters as clean as possible.

###Burn!
open the terminal and type `destoroyah [--watch] [disasters]` e.g. `destoroyah './disasters/*Zil.coffee'` to run each disaster in the 'disasters' folder.  
`--watch` will run the disasters after each file change
