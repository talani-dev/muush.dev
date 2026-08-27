<!--
  ⚠️ PR Title: must follow `<gitmoji> <type>(<scope>): <description>` —
     same convention as commit messages (see .husky/commit-msg).
     The repo is configured so the squash-merge subject = this title,
     so a valid title produces a valid commit automatically. A workflow
     (`.github/workflows/pr-title.yml`) blocks the PR if the title fails.

     Examples:
       ✨ feat(landing): add hero section
       🐛 fix(i18n): correct hreflang for /en/ pages
       🔖 release: v0.1.2
       🔧 chore(deps): bump astro to 7.2.8

  PR template. Delete the sections that don't apply. Keep the structure
  so reviewers can scan the PR in 30 seconds.
-->

## 📋 Summary

<!-- 1–3 bullets: WHAT this PR changes. No "why" here — keep that for Motivation if it's not obvious from the title. -->

-
-

## 🏷️ Type of change

<!-- Check one. If multiple apply, split into separate PRs. -->

- [ ] ✨ feat — new feature
- [ ] 🐛 fix — bug fix
- [ ] ♻️ refactor — code change that neither fixes a bug nor adds a feature
- [ ] 📝 docs — documentation only
- [ ] ✅ test — adding or correcting tests
- [ ] 🔧 chore — tooling, config, deps, CI
- [ ] ⚡ perf — performance improvement
- [ ] 👷 ci — CI/CD changes only

## 🔗 Related issue

<!-- Skip lines that don't apply. -->

- 🔒 **Closes**: #
- 🔖 **Refs**: #

## 💡 Motivation

<!-- Optional. Use this when the "why" is not obvious from the title. -->

## 🧪 Test plan

<!-- Concrete steps the reviewer (human or agent) can run. Check off what's verified locally. -->

- [ ] 🧹 `pnpm check` — Biome lint + format, no errors
- [ ] 📘 `pnpm typecheck` — `astro check`, no errors
- [ ] 🧪 `pnpm test` — Vitest, all green
- [ ] 🏗️ `pnpm build` — static build succeeds
- [ ] 👀 Manual verification: <describe what you clicked / where you looked, in which locale>

## 📸 Preview / screenshots

<!-- For UI changes, paste before/after screenshots for both /es/ and /en/. Delete if no visual change. -->

## 👤 Human-only follow-ups

<!-- Actions the implementer cannot perform (require repo admin / external dashboards, e.g. CloudFront invalidation). The repo owner must complete these after merge. Delete if none. -->

- [ ]

## ⚠️ Deviations

<!-- Any deviation from the spec/design the reviewer should know about. Be specific. Delete if none. -->
