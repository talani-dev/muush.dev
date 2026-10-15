# Quickstart: verifying feature 35

## Before installing

```bash
# Baseline, for the bundle-size and <body> comparisons
pnpm generate
du -sk .output/public/_nuxt
for p in es en es/nosotros en/about; do
  sed -n '/<body/,/<\/body>/p' .output/public/$p/index.html | sed 's/<script[^>]*>.*<\/script>//g' > /tmp/feature35-before-$(echo $p | tr / -).html
done
```

## Install (stop on registry failure)

```bash
pnpm add @nuxtjs/sitemap@^8.6.2 @nuxtjs/robots@^6.2.4 nuxt-schema-org@^6.4.3
```

If this fails with a registry/auth error (CodeArtifact, 401/403, `ERR_PNPM_FETCH`): **stop and report**. Do not touch `.npmrc`, `~/.npmrc`, `pnpm config`, or `npm config`. Roberto fixes the registry.

After install, confirm the resolved versions in `pnpm-lock.yaml`: sitemap 8.x, robots 6.x, schema-org 6.x, `nuxt-site-config` 4.x, `nuxt` still 4.5.x.

## Inspect the output

```bash
pnpm generate
cd .output/public

# 1. Heads of the 4 pages
for p in es en es/nosotros en/about; do
  echo "== /$p"
  grep -oE '<html[^>]*>|<title>[^<]*</title>|<meta (name|property)="(description|robots|og:[a-z_:]+|twitter:[a-z]+)"[^>]*>|<link[^>]*(canonical|alternate)[^>]*>' $p/index.html
  grep -c 'application/ld+json' $p/index.html
done

# 2. JSON-LD of one page, pretty
python3 -c "import re,json;h=open('es/index.html').read();print(json.dumps(json.loads(re.search(r'<script type=\"application/ld\+json\"[^>]*>(.*?)</script>',h,re.S).group(1)),indent=1,ensure_ascii=False))"

# 3. Sitemap and robots
cat robots.txt
grep -oE '<loc>[^<]*</loc>|hreflang="[^"]*" href="[^"]*"' sitemap.xml
ls __sitemap__ sitemap_index.xml 2>&1   # must not exist

# 4. Root object
grep -E 'robots|hreflang|canonical' index.html

# 5. Client bundle
grep -lE 'botd|fingerprintjs|BotDetector' _nuxt/*.js ; echo "botd hits: $?"   # 1 = none
grep -lE 'defineOrganization|schema-org-graph' _nuxt/*.js
du -sk _nuxt

# 6. Report-only: every index.html
find . -name index.html | sort
```

## Quality gate

```bash
pnpm check && pnpm typecheck && pnpm test && pnpm generate && pnpm storybook:build
```
