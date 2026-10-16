# Quickstart: verifying feature 36

Everything here runs against `.output/public`, never the dev server (`rules.md` §§ R25, R31). None of these scripts is committed; they live in the session scratchpad.

## 1 · Build and the automated suites

```sh
pnpm check && pnpm typecheck && pnpm test && pnpm generate && pnpm storybook:build
ls .output/public/es/404 .output/public/en/404      # index.html + _payload.json each
ls .output/public/200.html .output/public/404.html  # must fail: both gone
```

`pnpm generate` must exit 0 and its log must show `/es/404`, `/en/404` written and `/200.html`, `/404.html` `(skipped)`, with no `ERROR` line.

## 2 · Static checks by hand (spot-check of contracts/build-output.md)

```sh
for l in es en; do f=.output/public/$l/404/index.html
  perl -0ne 'print $1 if /<head>(.*?)<\/head>/s' $f | grep -o '<title>[^<]*</title>\|<meta name="robots"[^>]*>\|rel="canonical"\|hreflang'
  grep -o '<html[^>]*>' $f; grep -c 'class="led ' $f; grep -c site-nav__cta $f
done
grep -c 404 .output/public/sitemap.xml   # 0
```

Expected: one title, one `noindex`, no canonical, no `hreflang` inside `<head>` (the nav's language `<a hreflang>` is in `<body>`), the right `lang`, `1` LED, `0` nav-CTA occurrences.

## 3 · Browser check under the edge contract (the part tests cannot do)

Two scripts, used in research on 2026-10-15. `serve.mjs` reproduces `contracts/edge-not-found.md` locally: by default **Stage 1** (status 404 + the English document for every missing path, gate G5), with `STAGE=2` the deferred per-prefix rule; plus the directory-index rewrite for existing pages. `probe.mjs` drives headless Chrome over CDP with Node's built-in `WebSocket` (Node ≥ 22).

```js
// serve.mjs — node serve.mjs .output/public 4310
import { createServer } from 'node:http'
import { readFileSync, statSync } from 'node:fs'
import { join, extname } from 'node:path'
const ROOT = process.argv[2]; const PORT = Number(process.argv[3] || 4310)
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.xml': 'application/xml', '.txt': 'text/plain' }
const isFile = p => { try { return statSync(p).isFile() } catch { return false } }
createServer((req, res) => {
  const path = decodeURIComponent(new URL(req.url, 'http://x').pathname)
  let file = join(ROOT, path)
  // directory-index rewrite, as request-router does
  if (!extname(path)) file = join(ROOT, path, 'index.html')
  if (isFile(file)) { res.writeHead(200, { 'content-type': TYPES[extname(file)] || 'application/octet-stream' }); return res.end(readFileSync(file)) }
  // Stage 1 (agreed, gate G5): the English document for every missing path.
  // STAGE=2 simulates the deferred per-prefix rule (gate G6: /es → es, anything else → en).
  const locale = process.env.STAGE === '2' ? (/^\/es(\/|$)/.test(path) ? 'es' : 'en') : 'en'
  res.writeHead(404, { 'content-type': TYPES['.html'] })
  console.error('404', path, '->', locale)
  res.end(readFileSync(join(ROOT, locale, '404', 'index.html')))
}).listen(PORT, () => console.error('listening', PORT))
```

```js
// probe.mjs — node probe.mjs <url> [width] [css selector to click]
import { spawn } from 'node:child_process'
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const [url, width = '1440', clickSel] = process.argv.slice(2)
const port = 9300 + Math.floor(Math.random() * 500)
const chrome = spawn(CHROME, ['--headless=new', `--remote-debugging-port=${port}`, '--no-first-run', '--no-default-browser-check', `--user-data-dir=/tmp/claude-501/chrome-probe-${port}`, 'about:blank'], { stdio: 'ignore' })
const sleep = ms => new Promise(r => setTimeout(r, ms))
let targets
for (let i = 0; i < 50; i++) { try { targets = await (await fetch(`http://127.0.0.1:${port}/json`)).json(); break } catch { await sleep(200) } }
const page = targets.find(t => t.type === 'page')
const ws = new WebSocket(page.webSocketDebuggerUrl)
await new Promise(r => ws.addEventListener('open', r))
let id = 0; const pending = new Map(); const logs = []
ws.addEventListener('message', ev => { const m = JSON.parse(ev.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m.result); pending.delete(m.id) }
  if (m.method === 'Runtime.consoleAPICalled') logs.push(`console.${m.params.type}: ` + m.params.args.map(a => a.value ?? a.description).join(' '))
  if (m.method === 'Runtime.exceptionThrown') logs.push('exception: ' + m.params.exceptionDetails.exception?.description)
  if (m.method === 'Network.responseReceived') logs.push(`net ${m.params.response.status} ${m.params.response.url}`) })
const send = (method, params = {}) => new Promise(r => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method, params })) })
await send('Runtime.enable'); await send('Network.enable')
await send('Emulation.setDeviceMetricsOverride', { width: Number(width), height: 900, deviceScaleFactor: 1, mobile: Number(width) < 600 })
await send('Page.navigate', { url })
await sleep(3500)
const ev = async expr => (await send('Runtime.evaluate', { expression: expr, returnByValue: true })).result.value
if (clickSel) { await ev(`document.querySelector(${JSON.stringify(clickSel)}).click()`); await sleep(2000) }
const out = await ev(`JSON.stringify({ href: location.href, lang: document.documentElement.lang, title: document.title, h1: document.querySelector('h1')?.textContent?.trim(), toggle: document.querySelector('nav a[hreflang]')?.getAttribute('href'), navCta: !!document.querySelector('.site-nav__cta'), leds: document.querySelectorAll('.led').length, links: document.querySelectorAll("link[rel=canonical],link[hreflang]").length, robots: document.querySelector('meta[name=robots]')?.content })`)
console.log(out); for (const l of logs.filter(l => !l.startsWith('net 200'))) console.log(l)
ws.close(); chrome.kill()
process.exit(0)
```

Run once with the server in Stage 1 (`node serve.mjs .output/public 4310`) and once in Stage 2 (`STAGE=2 node serve.mjs .output/public 4310`) — Stage 2 is what exercises the Spanish document at arbitrary `/es/…` URLs:

```sh
for u in /en/no-existe /es/nada /xyz /fr/abc /en/about/zzz "/en/zz?x=1#frag"; do
  node probe.mjs "http://127.0.0.1:4310$u" 1440; node probe.mjs "http://127.0.0.1:4310$u" 390; done
node probe.mjs http://127.0.0.1:4310/en/no-existe 1440 'nav a[hreflang]'          # → /es home
node probe.mjs http://127.0.0.1:4310/es/nada 1440 'main a.led'                   # Stage 1 → /en home; Stage 2 → /es home
node probe.mjs http://127.0.0.1:4310/en/about 1440                               # regression: About unchanged
```

Expected for every missing URL: `href` = the requested URL (not `/…/404`), `lang` = `en-US` for every URL in Stage 1 and the prefix rule's language in Stage 2, `h1` is the locale's headline, `toggle` is the other home, `navCta: false`, `leds: 1`, `links: 0`, `robots: "noindex"`, and **no** `console.*`, `exception` or non-200 `net` line except the document's own `net 404`.

## 4 · Measurements (by eye + CDP, `findings.md` § R44 discipline)

At 1440×900 and 390×844 on `/es/no-existe` and `/en/no-existe`:

- the three rings' `getBoundingClientRect().width`: 700/500/300 and 420/300/180 (± 1);
- `document.documentElement.scrollWidth === innerWidth` (no horizontal scroll from the 420/700 rings);
- the rings paint behind the text and above the dotted paper;
- the red glow (G4): one `.section-backdrop` child of the not-found section, computed `z-index` −3 (`--layer-glow`), its centre at page ≈ (viewport − 160, 240) per `research.md` R6b — record the measured centre; if y is off by more than a few px because the site's nav differs from the reference header, correct `--spacing-not-found-glow-y` from the measurement and say so; `document.documentElement.scrollHeight` equals the layout root's height (the glow does not lengthen the page);
- with scripting disabled (`Emulation.setScriptExecutionDisabled`), the page is complete, the nav shows no CTA, one LED;
- with `prefers-reduced-motion: reduce` emulated, the Pill ping and the LED spin are off;
- record the nav's in-flow height and the resulting top of the Pill, and compare with the reference (header 24 + 72; `research.md` R6, last table) — report, don't adjust silently.

## 5 · Storybook

`NotFoundContent` story renders with both locales' copy in Storybook (stubs `NuxtLink`, `rules.md` § R23); `SiteNav` gains a "without CTA" story.
