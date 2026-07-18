#!/usr/bin/env bash
# scripts/smoke-test.sh
# Test funzionale minimo degli script locali.
# Non richiede OpenClaw installato.
#
# Exit code: 0 = tutto OK, 1 = errori

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ERRORS=0

pass() { echo "  ✔ $*"; }
fail() { echo "  ✗ $*" >&2; ERRORS=$((ERRORS + 1)); }

echo "=== Smoke test: property-search ==="

# Test 1: ricerca senza filtri (deve restituire tutti)
OUT=$(node "$REPO_ROOT/scripts/property-search.js" 2>/dev/null)
COUNT=$(echo "$OUT" | node -e "const d=JSON.parse(require('fs').readFileSync('/dev/stdin','utf8')); process.stdout.write(String(d.count))")
if [[ "$COUNT" -ge 8 ]]; then
  pass "Ricerca senza filtri: $COUNT risultati"
else
  fail "Ricerca senza filtri: attesi almeno 8, ottenuti $COUNT"
fi

# Test 2: ricerca per budget
OUT=$(node "$REPO_ROOT/scripts/property-search.js" --budget-max 200000 2>/dev/null)
COUNT=$(echo "$OUT" | node -e "const d=JSON.parse(require('fs').readFileSync('/dev/stdin','utf8')); process.stdout.write(String(d.count))")
pass "Ricerca budget ≤200k: $COUNT risultati"

# Test 3: nessun risultato con filtro estremo
OUT=$(node "$REPO_ROOT/scripts/property-search.js" --budget-max 1 2>/dev/null)
COUNT=$(echo "$OUT" | node -e "const d=JSON.parse(require('fs').readFileSync('/dev/stdin','utf8')); process.stdout.write(String(d.count))")
if [[ "$COUNT" -eq 0 ]]; then
  pass "Nessun risultato con filtro budget=1"
else
  fail "Attesi 0 risultati con budget=1, ottenuti $COUNT"
fi

echo ""
echo "=== Smoke test: lead-validate ==="

# Test 4: lead valido
EXIT_CODE=0
OUT=$(echo '{"nome":"Mario","email":"mario@test.it"}' | node "$REPO_ROOT/scripts/lead-validate.js" 2>/dev/null) || EXIT_CODE=$?
if [[ $EXIT_CODE -eq 0 ]]; then
  pass "Lead valido: exit 0"
else
  fail "Lead valido: exit $EXIT_CODE (atteso 0)"
fi

# Test 5: lead non valido
EXIT_CODE=0
echo '{"nome":"Mario"}' | node "$REPO_ROOT/scripts/lead-validate.js" > /dev/null 2>&1 || EXIT_CODE=$?
if [[ $EXIT_CODE -eq 1 ]]; then
  pass "Lead non valido: exit 1"
else
  fail "Lead non valido: exit $EXIT_CODE (atteso 1)"
fi

echo ""
echo "=== Smoke test: visit-request ==="

# Calcola una data futura
FUTURE_DATE=$(node -e "const d=new Date(); d.setDate(d.getDate()+30); process.stdout.write(d.toISOString().slice(0,10))")

# Test 6: richiesta valida
EXIT_CODE=0
OUT=$(echo "{\"property_id\":\"BG-2026-001\",\"nome\":\"Mario Rossi\",\"email\":\"mario@test.it\",\"data_preferita\":\"$FUTURE_DATE\"}" \
  | node "$REPO_ROOT/scripts/visit-request.js" 2>/dev/null) || EXIT_CODE=$?
if [[ $EXIT_CODE -eq 0 ]]; then
  pass "Visit request valida: exit 0"
else
  fail "Visit request valida: exit $EXIT_CODE (atteso 0)"
fi

# Test 7: richiesta non valida (data passata)
EXIT_CODE=0
echo '{"property_id":"BG-2026-001","nome":"Mario","email":"mario@test.it","data_preferita":"2020-01-01"}' \
  | node "$REPO_ROOT/scripts/visit-request.js" > /dev/null 2>&1 || EXIT_CODE=$?
if [[ $EXIT_CODE -eq 1 ]]; then
  pass "Visit request non valida (data passata): exit 1"
else
  fail "Visit request non valida: exit $EXIT_CODE (atteso 1)"
fi

echo ""
echo "=== Riepilogo smoke test ==="
if [[ $ERRORS -eq 0 ]]; then
  echo "✔ Tutti gli smoke test superati"
  exit 0
else
  echo "✗ $ERRORS errori trovati" >&2
  exit 1
fi
