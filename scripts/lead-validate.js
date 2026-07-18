#!/usr/bin/env node
/**
 * lead-validate.js — Validazione e normalizzazione di un lead (richiesta di contatto)
 *
 * Utilizzo:
 *   echo '{"nome":"Mario","cognome":"Rossi","email":"mario@esempio.it","telefono":"3331234567","interesse":"acquisto","budget_max":400000}' \
 *     | node scripts/lead-validate.js
 *
 * Input: JSON su stdin
 * Output: JSON su stdout { valid: true|false, normalized: {...}, errors: [...] }
 * Exit codes: 0 = valido, 1 = non valido, 2 = errore parsing
 *
 * NOTA PRIVACY: Questo script non persiste né trasmette dati personali.
 * I dati vanno trattati secondo le policy GDPR del titolare.
 */

'use strict';

const CAMPI_OBBLIGATORI = ['nome', 'email'];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TELEFONO_RE = /^[\d\s\+\-\.()]{7,20}$/;
const INTERESSI_VALIDI = ['acquisto', 'vendita', 'affitto', 'valutazione', 'informazioni'];

function normalizeString(s) {
  if (typeof s !== 'string') return s;
  return s.trim().replace(/\s+/g, ' ');
}

function normalizeTelefono(t) {
  if (typeof t !== 'string') return t;
  return t.replace(/[\s\-\.()]/g, '');
}

function validate(raw) {
  const errors = [];

  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) {
    return { valid: false, normalized: null, errors: ['Il body deve essere un oggetto JSON'] };
  }

  const normalized = {};

  // Campi obbligatori
  for (const campo of CAMPI_OBBLIGATORI) {
    if (!raw[campo] || typeof raw[campo] !== 'string' || !raw[campo].trim()) {
      errors.push(`Campo obbligatorio mancante o vuoto: ${campo}`);
    }
  }

  // nome
  if (raw.nome) {
    normalized.nome = normalizeString(raw.nome);
    if (normalized.nome.length < 2) errors.push('Il nome deve avere almeno 2 caratteri');
  }

  // cognome (opzionale)
  if (raw.cognome !== undefined) {
    normalized.cognome = normalizeString(raw.cognome);
  }

  // email
  if (raw.email) {
    normalized.email = normalizeString(raw.email).toLowerCase();
    if (!EMAIL_RE.test(normalized.email)) errors.push('Email non valida');
  }

  // telefono (opzionale)
  if (raw.telefono !== undefined && raw.telefono !== '') {
    normalized.telefono = normalizeTelefono(String(raw.telefono));
    if (!TELEFONO_RE.test(raw.telefono)) errors.push('Telefono non valido (formato non riconosciuto)');
  }

  // interesse (opzionale)
  if (raw.interesse !== undefined) {
    const interesseNorm = normalizeString(String(raw.interesse)).toLowerCase();
    if (!INTERESSI_VALIDI.includes(interesseNorm)) {
      errors.push(`Interesse non valido. Valori ammessi: ${INTERESSI_VALIDI.join(', ')}`);
    } else {
      normalized.interesse = interesseNorm;
    }
  }

  // budget_max (opzionale)
  if (raw.budget_max !== undefined) {
    const bm = Number(raw.budget_max);
    if (isNaN(bm) || bm < 0) {
      errors.push('budget_max deve essere un numero positivo');
    } else {
      normalized.budget_max = bm;
    }
  }

  // messaggio (opzionale)
  if (raw.messaggio !== undefined) {
    normalized.messaggio = normalizeString(String(raw.messaggio));
    if (normalized.messaggio.length > 2000) {
      errors.push('Il messaggio non può superare 2000 caratteri');
    }
  }

  const valid = errors.length === 0;
  return { valid, normalized: valid ? normalized : null, errors };
}

function main() {
  let raw = '';
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', (chunk) => { raw += chunk; });
  process.stdin.on('end', () => {
    let parsed;
    try {
      parsed = JSON.parse(raw.trim() || '{}');
    } catch (err) {
      process.stderr.write(JSON.stringify({ error: 'Errore parsing JSON', details: err.message }) + '\n');
      process.exit(2);
    }

    const result = validate(parsed);
    process.stdout.write(JSON.stringify(result, null, 2) + '\n');
    process.exit(result.valid ? 0 : 1);
  });
}

if (require.main === module) {
  main();
}

module.exports = { validate };
