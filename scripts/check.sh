#!/usr/bin/env bash
# scripts/check.sh
# Verifiche locali: JSON valido, struttura file, assenza di placeholder pericolosi.
#
# Utilizzo: bash scripts/check.sh
# Exit code: 0 = tutto OK, 1 = errori trovati

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ERRORS=0

pass() { echo "  ✔ $*"; }
fail() { echo "  ✗ $*" >&2; ERRORS=$((ERRORS + 1)); }

echo "=== Check: JSON validi ==="

check_json() {
  local f="$1"
  if node -e "JSON.parse(require('fs').readFileSync('$f','utf8'))" 2>/dev/null; then
    pass "JSON valido: ${f#$REPO_ROOT/}"
  else
    fail "JSON non valido: ${f#$REPO_ROOT/}"
  fi
}

for f in \
  "$REPO_ROOT/data/properties.demo.json" \
  "$REPO_ROOT/data/property.schema.json" \
  "$REPO_ROOT/package.json" \
  "$REPO_ROOT/examples/search-by-budget.json" \
  "$REPO_ROOT/examples/search-by-zone.json" \
  "$REPO_ROOT/examples/visit-request.json" \
  "$REPO_ROOT/examples/lead-intake.json"; do
  check_json "$f"
done

echo ""
echo "=== Check: file obbligatori presenti ==="

REQUIRED_FILES=(
  "README.md"
  ".gitignore"
  ".env.example"
  "package.json"
  "workspace/AGENTS.md"
  "workspace/SOUL.md"
  "workspace/TOOLS.md"
  "workspace/README.md"
  "workspace/skills/property-search/SKILL.md"
  "workspace/skills/lead-intake/SKILL.md"
  "workspace/skills/visit-request/SKILL.md"
  "data/properties.demo.json"
  "data/property.schema.json"
  "scripts/install-workspace.sh"
  "scripts/check.sh"
  "docs/SETUP.md"
  "docs/CONFIGURATION.md"
  "docs/TROUBLESHOOTING.md"
  "docs/PRIVACY-AND-SAFETY.md"
  "docs/DEPLOYMENT-CHECKLIST.md"
  ".github/workflows/ci.yml"
)

for f in "${REQUIRED_FILES[@]}"; do
  if [[ -f "$REPO_ROOT/$f" ]]; then
    pass "Presente: $f"
  else
    fail "Mancante: $f"
  fi
done

echo ""
echo "=== Check: assenza di placeholder pericolosi ==="

# Pattern che potrebbero indicare segreti veri o placeholder non sicuri
DANGEROUS_PATTERNS=(
  'sk-[a-zA-Z0-9]{20,}'
  'sk-ant-[a-zA-Z0-9]{20,}'
  'OPENCLAW_GATEWAY_TOKEN=[a-zA-Z0-9]'
  'password\s*=\s*["\x27][^"\x27]{4,}'
)

CHECKED_DIRS=("$REPO_ROOT/workspace" "$REPO_ROOT/scripts" "$REPO_ROOT/data" "$REPO_ROOT/examples" "$REPO_ROOT/.env.example")
FOUND_SECRETS=0

for pattern in "${DANGEROUS_PATTERNS[@]}"; do
  if grep -rqE "$pattern" "${CHECKED_DIRS[@]}" 2>/dev/null; then
    fail "Pattern pericoloso trovato: $pattern"
    FOUND_SECRETS=$((FOUND_SECRETS + 1))
  fi
done

if [[ $FOUND_SECRETS -eq 0 ]]; then
  pass "Nessun placeholder pericoloso trovato"
fi

echo ""
echo "=== Check: disclaimer nel catalogo demo ==="

if grep -q '"stato_demo": true' "$REPO_ROOT/data/properties.demo.json"; then
  pass "stato_demo=true presente nel catalogo"
else
  fail "stato_demo=true mancante nel catalogo"
fi

if grep -q '__disclaimer' "$REPO_ROOT/data/properties.demo.json"; then
  pass "Disclaimer presente nel catalogo"
else
  fail "Disclaimer mancante nel catalogo"
fi

echo ""
echo "=== Riepilogo ==="
if [[ $ERRORS -eq 0 ]]; then
  echo "✔ Tutti i check superati"
  exit 0
else
  echo "✗ $ERRORS errori trovati" >&2
  exit 1
fi
