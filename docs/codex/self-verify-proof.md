# Self Verify Proof

Date: 2026-02-05

## Supply Links (Home)
Command:
`(Invoke-WebRequest -UseBasicParsing https://hrtaj.com/).Links | Where-Object href -match '/supply' | Select-Object -First 5 -ExpandProperty href`

Output:
```
/supply
/supply
/supply/developer
/supply/owner
/supply
```

## Callback Links (Home)
Command:
`(Invoke-WebRequest -UseBasicParsing https://hrtaj.com/).Links | Where-Object href -match '/callback' | Select-Object -First 5 -ExpandProperty href`

Output:
```
/callback
/callback
```

## No Raw home.* Keys
Command:
`$content = (Invoke-WebRequest -UseBasicParsing https://hrtaj.com/).Content; if ($content -match 'home\.') { 'FOUND home.' } else { 'OK: no home.' }`

Output:
```
OK: no home.
```

## No Repeated ???
Command:
`$content = (Invoke-WebRequest -UseBasicParsing https://hrtaj.com/).Content; if ($content -match '\?{3,}') { 'FOUND ???' } else { 'OK: no ???' }`

Output:
```
OK: no ???
```
