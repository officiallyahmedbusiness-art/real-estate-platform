# Self Verify Proof

Date: 2026-02-05

## Deployed Commit
909ea0f09fa6d89515786ec414c167a1ab54469d

## Vercel Project Inspect
Command:
`vercel project inspect`

Output:
```
Vercel CLI 50.9.6
Retrieving project…
> Found Project ahmeds-projects-d5b369e4/real-estate-platform [3s]

  General

    ID				prj_bThgnxXf1whpRI4TN0fjV075hXoX
    Name			real-estate-platform
    Owner			Ahmed's projects
    Created At		02 February 2026 10:24:43 [4d ago]
    Root Directory		.
    Node.js Version		24.x

  Framework Settings

    Framework Preset		Next.js
    Build Command		`npm run build` or `next build`
    Output Directory		Next.js default
    Install Command		`yarn install`, `pnpm install`, `npm install`, or `bun install`
```

## Vercel Domains Inspect
Command:
`vercel domains inspect hrtaj.com`

Output:
```
Vercel CLI 50.9.6
Fetching Domain hrtaj.com under ahmeds-projects-d5b369e4
> Domain hrtaj.com found under ahmeds-projects-d5b369e4 [8s]

  General

    Name			hrtaj.com
    Registrar		Third Party
    Expiration Date		-
    Creator			officiallyahmedbusiness-1535
    Created At		02 February 2026 11:03:26 [3d ago]
    Edge Network		yes
    Renewal Price		-

  Nameservers

    Intended Nameservers    Current Nameservers               
    ns1.vercel-dns.com      ariadne.ns.cloudflare.com    ?    
    ns2.vercel-dns.com      noel.ns.cloudflare.com       ?    

  Projects
   
    Project                    Domains                     
    real-estate-platform       hrtaj.com, www.hrtaj.com    
```

## Vercel Inspect
Command:
`vercel inspect hrtaj.com`

Output:
```
Vercel CLI 50.9.6
Fetching deployment "hrtaj.com" in ahmeds-projects-d5b369e4
> Fetched deployment "real-estate-platform-jxsmjbsi0-ahmeds-projects-d5b369e4.vercel.app" in ahmeds-projects-d5b369e4 [2s]

  General

    id		dpl_27DgafqkvytHDMrUU7vq4d8ciS4z
    name	real-estate-platform
    target	production
    status	? Ready
    url		https://real-estate-platform-jxsmjbsi0-ahmeds-projects-d5b369e4.vercel.app
    created	Thu Feb 05 2026 22:35:10 GMT+0200 (Eastern European Standard Time) [2m ago]


  Aliases

    ? https://hrtaj.com
    ? https://real-estate-platform-lyart.vercel.app
    ? https://real-estate-platform-ahmeds-projects-d5b369e4.vercel.app
    ? https://www.hrtaj.com
    

  Builds

    + .        [0ms]
    +-- ? favicon.ico.rsc (740.16KB) [iad1]
    +-- ? robots.txt.rsc (740.16KB) [iad1]
    +-- ? favicon.ico (740.16KB) [iad1]
    +-- ? robots.txt (740.16KB) [iad1]
    +-- ? _global-error (632.26KB) [iad1]
    +-- 149 output items hidden
```

## Curl Headers (Home)
Command:
`curl.exe -sI -H "Cache-Control: no-cache" https://hrtaj.com/`

Output:
```
HTTP/1.1 200 OK
Age: 0
Cache-Control: private, no-cache, no-store, max-age=0, must-revalidate
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://vercel.live; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' data: https:; connect-src 'self' https://nizprowlfvrivrdgqiej.supabase.co https://*.supabase.co https://*.supabase.in wss: https://vercel.live; media-src 'self' blob: https:; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'
Content-Type: text/html; charset=utf-8
Date: Thu, 05 Feb 2026 20:37:27 GMT
Link: </_next/static/media/3fd1b3eda9c5392f-s.p.2ae7fa5d.woff2>; rel=preload; as="font"; crossorigin=""; type="font/woff2", </_next/static/media/797e433ab948586e-s.p.dbea232f.woff2>; rel=preload; as="font"; crossorigin=""; type="font/woff2", </_next/static/media/9ff27b8a0a8f3dc0-s.p.9cb3a3e2.woff2>; rel=preload; as="font"; crossorigin=""; type="font/woff2", </_next/static/media/caa3a2e1cccd8315-s.p.853070df.woff2>; rel=preload; as="font"; crossorigin=""; type="font/woff2", </_next/static/media/d41831e24743a3c1-s.p.ae65d18e.woff2>; rel=preload; as="font"; crossorigin=""; type="font/woff2", </_next/static/chunks/e7e2afc26fd16f2a.css>; rel=preload; as="style"
Permissions-Policy: camera=(), microphone=(), geolocation=()
Referrer-Policy: strict-origin-when-cross-origin
Server: Vercel
Set-Cookie: locale=ar; Path=/; Expires=Fri, 05 Feb 2027 20:37:25 GMT; Max-Age=31536000; SameSite=lax
Strict-Transport-Security: max-age=63072000
Vary: rsc, next-router-state-tree, next-router-prefetch, next-router-segment-prefetch
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-Matched-Path: /
X-Vercel-Cache: MISS
X-Vercel-Id: dxb1::iad1::wsc2n-1770323845491-2b25184e3f0c
```

## Curl Headers (Listings)
Command:
`curl.exe -sI -H "Cache-Control: no-cache" https://hrtaj.com/listings`

Output:
```
HTTP/1.1 200 OK
Age: 0
Cache-Control: private, no-cache, no-store, max-age=0, must-revalidate
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://vercel.live; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' data: https:; connect-src 'self' https://nizprowlfvrivrdgqiej.supabase.co https://*.supabase.co https://*.supabase.in wss: https://vercel.live; media-src 'self' blob: https:; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'
Content-Type: text/html; charset=utf-8
Date: Thu, 05 Feb 2026 20:37:38 GMT
Link: </_next/static/media/3fd1b3eda9c5392f-s.p.2ae7fa5d.woff2>; rel=preload; as="font"; crossorigin=""; type="font/woff2", </_next/static/media/797e433ab948586e-s.p.dbea232f.woff2>; rel=preload; as="font"; crossorigin=""; type="font/woff2", </_next/static/media/9ff27b8a0a8f3dc0-s.p.9cb3a3e2.woff2>; rel=preload; as="font"; crossorigin=""; type="font/woff2", </_next/static/media/caa3a2e1cccd8315-s.p.853070df.woff2>; rel=preload; as="font"; crossorigin=""; type="font/woff2", </_next/static/media/d41831e24743a3c1-s.p.ae65d18e.woff2>; rel=preload; as="font"; crossorigin=""; type="font/woff2"
Permissions-Policy: camera=(), microphone=(), geolocation=()
Referrer-Policy: strict-origin-when-cross-origin
Server: Vercel
Set-Cookie: locale=ar; Path=/; Expires=Fri, 05 Feb 2027 20:37:38 GMT; Max-Age=31536000; SameSite=lax
Strict-Transport-Security: max-age=63072000
Vary: rsc, next-router-state-tree, next-router-prefetch, next-router-segment-prefetch
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-Matched-Path: /listings
X-Vercel-Cache: MISS
X-Vercel-Id: dxb1::iad1::wsc2n-1770323858022-d695659d3f41
```

## PowerShell UTF-8 Checks (Home)
Command:
`powershell -NoProfile -Command "$u='https://hrtaj.com/?t='+[guid]::NewGuid(); $h=(Invoke-WebRequest -Headers @{'Cache-Control'='no-cache'} -Uri $u).Content; 'HOME has_QQQ=' + [bool]($h -match '\?{3,}') ; 'HOME has_home_dot=' + [bool]($h -match 'home\.') ; 'HOME has_fake_trust=' + [bool]($h -match 'Nasr City|Abbas|10 AM|10 minutes|Trust & Contact')"`

Output:
```
HOME has_QQQ=False
HOME has_home_dot=False
HOME has_fake_trust=False
Invoke-WebRequest : Object reference not set to an instance of an object.
At line:1 char:51
+ ... Guid(); $h=(Invoke-WebRequest -Headers @{'Cache-Control'='no-cache'}  ...
+                 ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    + CategoryInfo          : NotSpecified: (:) [Invoke-WebRequest], NullReferenceException
    + FullyQualifiedErrorId : System.NullReferenceException,Microsoft.PowerShell.Commands.InvokeWebRequestCommand
```

## PowerShell UTF-8 Checks (Listings)
Command:
`powershell -NoProfile -Command "$u='https://hrtaj.com/listings?t='+[guid]::NewGuid(); $h=(Invoke-WebRequest -Headers @{'Cache-Control'='no-cache'} -Uri $u).Content; 'LIST has_QQQ=' + [bool]($h -match '\?{3,}') ; 'LIST has_home_dot=' + [bool]($h -match 'home\.') ; 'LIST has_fake_trust=' + [bool]($h -match 'Nasr City|Abbas|10 AM|10 minutes|Trust & Contact')"`

Output:
```
LIST has_QQQ=False
LIST has_home_dot=False
LIST has_fake_trust=False
Invoke-WebRequest : Object reference not set to an instance of an object.
At line:1 char:59
+ ... Guid(); $h=(Invoke-WebRequest -Headers @{'Cache-Control'='no-cache'}  ...
+                 ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    + CategoryInfo          : NotSpecified: (:) [Invoke-WebRequest], NullReferenceException
    + FullyQualifiedErrorId : System.NullReferenceException,Microsoft.PowerShell.Commands.InvokeWebRequestCommand
```

Note: the exact commands above throw a NullReferenceException with Windows PowerShell's Invoke-WebRequest in this environment. The live check script now uses Invoke-WebRequest -UseBasicParsing and succeeds.

## Live Verify Script
Command:
`npm run live:verify`

Output:
```
> real-estate-platform@0.1.0 live:verify
> node scripts/live-verify.mjs

HOME has_QQQ=False
HOME has_home_dot=False
HOME has_fake_trust=False
LIST has_QQQ=False
LIST has_home_dot=False
LIST has_fake_trust=False
Live verify passed.
```

## /api/version
Command:
`curl.exe -s https://hrtaj.com/api/version`

Output:
```
{"commitSha":"909ea0f09fa6d89515786ec414c167a1ab54469d","buildTimestamp":"2026-02-05T20:39:13.795Z","version":"0.1.0"}
```

## DB Cleanup Attempt
Command:
`node scripts/cleanup_settings.mjs`

Output:
```
Before cleanup (targets only):
- facebook_url: https://www.facebook.com/share/1C1fQLJD2W/
- public_email: hrtaj4realestate@gmail.com
- whatsapp_number: +201020614022
- whatsapp_link: https://wa.me/201020614022
Failed to delete facebook_url: stack depth limit exceeded
```

## Artifacts
- `artifacts/live/home.html`
- `artifacts/live/listings.html`

## Summary
- Deployed commit `909ea0f` to production.
- Live HTML checks show no `???`, no raw `home.` keys, no fake trust strings.
- DB cleanup attempt failed with stack depth limit (likely RLS recursion) because only anon key is available.

## Files Changed
- `scripts/live-verify.mjs`
- `artifacts/live/home.html`
- `artifacts/live/listings.html`
- `docs/codex/self-verify-proof.md`
