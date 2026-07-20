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
echo "=== Check: validazione proprietà contro schema JSON ==="

SCHEMA="$REPO_ROOT/data/property.schema.json"
CATALOG="$REPO_ROOT/data/properties.demo.json"

node -e "
const fs = require('fs');
const schemaPath = process.argv[1];
const catalogPath = process.argv[2];

const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));

const required = schema.required || [];
const props = schema.properties || {};
let errors = 0;

function checkType(val, type) {
  if (type === 'integer') return typeof val === 'number' && Number.isInteger(val);
  if (type === 'array') return Array.isArray(val);
  return typeof val === type;
}

for (const p of catalog.properties) {
  for (const field of required) {
    if (p[field] === undefined) {
      process.stderr.write('  ✗ Campo obbligatorio mancante «' + field + '» in ' + p.id + '\n');
      errors++;
    }
  }
  for (const [field, def] of Object.entries(props)) {
    if (p[field] === undefined) continue;
    const val = p[field];
    const type = def.type;
    if (type && !checkType(val, type)) {
      process.stderr.write('  ✗ Tipo errato per «' + field + '» in ' + p.id + ': atteso ' + type + ', trovato ' + (Array.isArray(val) ? 'array' : typeof val) + '\n');
      errors++;
    }
    if (def.enum && !def.enum.includes(val)) {
      process.stderr.write('  ✗ Valore non valido per «' + field + '» in ' + p.id + ': «' + val + '» non è tra ' + def.enum.join(', ') + '\n');
      errors++;
    }
    if (def.minimum !== undefined && typeof val === 'number' && val < def.minimum) {
      process.stderr.write('  ✗ Valore sotto il minimo per «' + field + '» in ' + p.id + ': ' + val + ' < ' + def.minimum + '\n');
      errors++;
    }
    if (def.pattern && typeof val === 'string' && !new RegExp(def.pattern).test(val)) {
      process.stderr.write('  ✗ Pattern non rispettato per «' + field + '» in ' + p.id + ': «' + val + '\"\n');
      errors++;
    }
  }
}

if (errors === 0) {
  process.stdout.write('  ✔ Tutte le proprietà rispettano lo schema\n');
  process.exit(0);
} else {
  process.exit(1);
}
" "$SCHEMA" "$CATALOG" || ERRORS=$((ERRORS + 1))



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
