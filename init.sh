#!/usr/bin/env bash
# init.sh — harness environment verification
# Run at the START of a session and before declaring any task done.

set -u -o pipefail
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[0;33m'; NC='\033[0m'
ok()   { printf "${GREEN}[OK]${NC}    %s\n" "$1"; }
warn() { printf "${YELLOW}[WARN]${NC}  %s\n" "$1"; }
fail() { printf "${RED}[FAIL]${NC}  %s\n" "$1"; }
EXIT_CODE=0

echo "── 1. Environment ──────────────────────────────────────"
if command -v node >/dev/null 2>&1; then
  ok "node $(node --version)"
else
  fail "node not found"
  EXIT_CODE=1
fi
if command -v pnpm >/dev/null 2>&1; then
  ok "pnpm $(pnpm --version)"
else
  fail "pnpm not found"
  EXIT_CODE=1
fi

echo "── 2. Harness base files ───────────────────────────────"
for f in AGENTS.md CLAUDE.md feature_list.json docs/harness/progress/current.md \
         docs/harness/verification.md docs/harness/specs.md \
         docs/harness/CHECKPOINTS.md .specify/memory/constitution.md; do
  [ -f "$f" ] && ok "Found $f" || { fail "Missing $f"; EXIT_CODE=1; }
done

if [ -d docs/business ] && [ -n "$(ls -A docs/business 2>/dev/null)" ]; then
  ok "docs/business/ has project context"
else
  fail "docs/business/ is empty or missing — add at least overview.md"
  EXIT_CODE=1
fi

echo "── 3. feature_list.json ────────────────────────────────"
if command -v node >/dev/null 2>&1; then
  if node -e '
    const fs = require("fs");
    const data = JSON.parse(fs.readFileSync("feature_list.json", "utf8"));
    const active = data.features.filter(f => f.status === "in_progress" || f.status === "reviewing");
    if (active.length > 1) {
      console.error("More than 1 feature in_progress/reviewing combined: " + active.map(f => f.name).join(", "));
      process.exit(1);
    }
  ' 2>/tmp/feature_list_check.log; then
    ok "feature_list.json valid — at most 1 feature in_progress/reviewing"
  else
    fail "feature_list.json check failed"
    cat /tmp/feature_list_check.log
    EXIT_CODE=1
  fi
else
  warn "node not found — skipping feature_list.json validation"
fi

echo "── 4. Type check ───────────────────────────────────────"
if pnpm typecheck 2>&1 | tail -20; then
  ok "pnpm typecheck"
else
  fail "pnpm typecheck"
  EXIT_CODE=1
fi

echo "── 5. Lint + format (biome) ────────────────────────────"
if pnpm check 2>&1 | tail -20; then
  ok "pnpm check"
else
  fail "pnpm check"
  EXIT_CODE=1
fi

echo "── 6. Tests ─────────────────────────────────────────────"
if pnpm test 2>&1 | tail -30; then
  ok "pnpm test"
else
  fail "pnpm test"
  EXIT_CODE=1
fi

echo "── 7. Build ─────────────────────────────────────────────"
if pnpm build 2>&1 | tail -30; then
  ok "pnpm build"
else
  fail "pnpm build"
  EXIT_CODE=1
fi

echo "── 8. Summary ───────────────────────────────────────────"
[ $EXIT_CODE -eq 0 ] \
  && ok "Environment ready." \
  || fail "Environment NOT ready — fix the errors above."
exit $EXIT_CODE
