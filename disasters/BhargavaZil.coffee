#lets win the Fields Medal!
#proof that every number can be expressed via a quadratic expression e.g. n = a^2 + b^2 + c^2 + d^2
awake 'Bhargava', Math.pow(19, 4), ->
  #based on the work of Manjul Bhargava we just have to proof that the outcome
  #of the quadratic expression contains the sequence http://oeis.org/A030051
  criticalInts = [1, 2, 3, 5, 6, 7, 10, 13, 14, 15, 17, 19, 21, 22, 23, 26, 29, 30, 31, 34, 35, 37, 42, 58, 93, 110, 145, 203, 290]

  hit = []
  beforeRampage -> hit = []

  #collect all values
  collectResult = (v) ->
    if v in criticalInts && v not in hit
      hit.push v
    return
  #finally validate that we've found each number
  collectResult.finally = -> criticalInts.length == hit.length

  #choose the smallest number that satisfies n^2 >= 290
  equipWith 'saneInt', -> attack.anyOf [0..18]

  rampage 'on a^2 + b^2 + c^2 + d^2', collectResult, (saneInt_a, saneInt_b, saneInt_c, saneInt_d) ->
    saneInt_a * saneInt_a + saneInt_b * saneInt_b + saneInt_c * saneInt_c + saneInt_d * saneInt_d

  rampage 'on 7*a^2 + 2*b^2 + 2*c^2 + d^2', collectResult, (saneInt_a, saneInt_b, saneInt_c, saneInt_d) ->
    7 * saneInt_a * saneInt_a + 2 * saneInt_b * saneInt_b + 2 * saneInt_c * saneInt_c + saneInt_d * saneInt_d

  #TODO add the other 6560 cases
