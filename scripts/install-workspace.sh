#!/usr/bin/env bash
# scripts/install-workspace.sh
# Installa il workspace OpenClaw nella destinazione configurata.
# Idempotente: non sovrascrive file esistenti senza consenso esplicito.
#
# Utilizzo:
#   bash scripts/install-workspace.sh [--dest /percorso/destinazione] [--force]
#
# Variabili d'ambiente:
#   OPENCLAW_WORKSPACE_DIR   Destinazione (default: ~/.openclaw/workspace)
#   INSTALL_FORCE            Se "1", sovrascrive file esistenti

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SOURCE_DIR="$REPO_ROOT/workspace"
DEST_DIR="${OPENCLAW_WORKSPACE_DIR:-$HOME/.openclaw/workspace}"
FORCE="${INSTALL_FORCE:-0}"

# Parse argomenti CLI
while [[ $# -gt 0 ]]; do
  case "$1" in
    --dest)
      DEST_DIR="$2"
      shift 2
      ;;
    --force)
      FORCE="1"
      shift
      ;;
    *)
      echo "Opzione non riconosciuta: $1" >&2
      echo "Utilizzo: bash scripts/install-workspace.sh [--dest /percorso] [--force]" >&2
      exit 1
      ;;
  esac
done

echo "=== Rizzetti Immobiliare — Installazione workspace OpenClaw ==="
echo "Sorgente: $SOURCE_DIR"
echo "Destinazione: $DEST_DIR"
echo ""

if [[ ! -d "$SOURCE_DIR" ]]; then
  echo "ERRORE: Directory sorgente non trovata: $SOURCE_DIR" >&2
  exit 1
fi

mkdir -p "$DEST_DIR"

COPIED=0
SKIPPED=0

install_file() {
  local src="$1"
  local rel="${src#$SOURCE_DIR/}"
  local dst="$DEST_DIR/$rel"
  local dst_dir
  dst_dir="$(dirname "$dst")"

  mkdir -p "$dst_dir"

  if [[ -e "$dst" && "$FORCE" != "1" ]]; then
    echo "  SKIP (già presente): $rel"
    SKIPPED=$((SKIPPED + 1))
    return
  fi

  cp "$src" "$dst"
  echo "  COPIA: $rel"
  COPIED=$((COPIED + 1))
}

while IFS= read -r -d '' file; do
  install_file "$file"
done < <(find "$SOURCE_DIR" -type f -print0)

echo ""
echo "=== Installazione completata ==="
echo "  File copiati:  $COPIED"
echo "  File saltati:  $SKIPPED"
echo ""
echo "Prossimi passi:"
echo "  openclaw gateway status"
echo "  openclaw doctor"
echo "  openclaw agent --message 'Ciao, cerca appartamenti a Bergamo'"
echo ""
if [[ $SKIPPED -gt 0 ]]; then
  echo "NOTA: $SKIPPED file già presenti non sono stati sovrascritti."
  echo "  Usa --force per sovrascrivere tutti i file esistenti."
fi
