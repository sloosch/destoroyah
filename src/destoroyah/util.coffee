exports.argFormat = (args) ->
  str = []
  for arg in args
    str.push if arg == null then '<NULL>'
    else
      switch typeof arg
        when 'undefined' then '<undefined>'
        when 'string' then (if arg.length == 0 then '<empty string>' else '“' + arg + '”')
        when 'number' then arg
        when 'boolean' then (if arg == true then '<TRUE>' else '<FALSE>')
        when 'object' then JSON.stringify(arg)
  if str.length > 0 then str.join ', ' else '<no arguments>'
