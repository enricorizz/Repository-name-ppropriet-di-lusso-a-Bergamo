#!/usr/bin/env node
/**
 * visit-request.js — Validazione di una richiesta di visita immobile
 *
 * Utilizzo:
 *   echo '{"property_id":"BG-2026-001","nome":"Mario Rossi","email":"mario@esempio.it","data_preferita":"2026-08-15","fascia_oraria":"mattina"}' \
 *     | node scripts/visit-request.js
 *
 * Input: JSON su stdin
 * Output: JSON su stdout { valid: true|false, normalized: {...}, errors: [...], avviso: "..." }
 * Exit codes: 0 = valido, 1 = non valido, 2 = errore parsing
 *
 * NOTA: Questo script valida la richiesta ma NON conferma appuntamenti.
 *       La conferma richiede l'intervento di un operatore umano.
 */

'use strict';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DATA_RE = /^\d{4}-\d{2}-\d{2}$/;
const PROPERTY_ID_RE = /^BG-\d{4}-\d{3}$/;
const FASCE_ORARIE = ['mattina', 'pomeriggio', 'sera', 'qualsiasi'];
const AVVISO = 'La richiesta di visita è stata registrata come valida. La conferma definitiva richiede l\'approvazione di un operatore umano. Non considerare questa come una conferma d\'appuntamento.';

function normalizeString(s) {
  if (typeof s !== 'string') return s;
  return s.trim().replace(/\s+/g, ' ');
}

function isDateInFuture(dateStr) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(dateStr + 'T00:00:00');
  return d >= today;
}

function validate(raw) {
  const errors = [];

  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) {
    return { valid: false, normalized: null, errors: ['Il body deve essere un oggetto JSON'], avviso: null };
  }

  const normalized = {};

  // property_id obbligatorio
  if (!raw.property_id || typeof raw.property_id !== 'string' || !raw.property_id.trim()) {
    errors.push('Campo obbligatorio mancante: property_id');
  } else {
    normalized.property_id = normalizeString(raw.property_id).toUpperCase();
    if (!PROPERTY_ID_RE.test(normalized.property_id)) {
      errors.push('property_id non valido (formato atteso: BG-YYYY-NNN)');
    }
  }

  // nome obbligatorio
  if (!raw.nome || typeof raw.nome !== 'string' || !raw.nome.trim()) {
    errors.push('Campo obbligatorio mancante: nome');
  } else {
    normalized.nome = normalizeString(raw.nome);
    if (normalized.nome.length < 2) errors.push('Il nome deve avere almeno 2 caratteri');
  }

  // email obbligatorio
  if (!raw.email || typeof raw.email !== 'string' || !raw.email.trim()) {
    errors.push('Campo obbligatorio mancante: email');
  } else {
    normalized.email = normalizeString(raw.email).toLowerCase();
    if (!EMAIL_RE.test(normalized.email)) errors.push('Email non valida');
  }

  // data_preferita obbligatoria
  if (!raw.data_preferita || typeof raw.data_preferita !== 'string') {
    errors.push('Campo obbligatorio mancante: data_preferita (formato YYYY-MM-DD)');
  } else {
    const dateStr = normalizeString(raw.data_preferita);
    if (!DATA_RE.test(dateStr)) {
      errors.push('data_preferita deve essere nel formato YYYY-MM-DD');
    } else if (!isDateInFuture(dateStr)) {
      errors.push('data_preferita deve essere una data futura');
    } else {
      normalized.data_preferita = dateStr;
    }
  }

  // fascia_oraria (opzionale)
  if (raw.fascia_oraria !== undefined) {
    const fascia = normalizeString(String(raw.fascia_oraria)).toLowerCase();
    if (!FASCE_ORARIE.includes(fascia)) {
      errors.push(`fascia_oraria non valida. Valori ammessi: ${FASCE_ORARIE.join(', ')}`);
    } else {
      normalized.fascia_oraria = fascia;
    }
  }

  // note (opzionale)
  if (raw.note !== undefined) {
    normalized.note = normalizeString(String(raw.note));
    if (normalized.note.length > 500) errors.push('Le note non possono superare 500 caratteri');
  }

  // telefono (opzionale)
  if (raw.telefono !== undefined && raw.telefono !== '') {
    normalized.telefono = String(raw.telefono).replace(/[\s\-\.()]/g, '');
  }

  const valid = errors.length === 0;
  return {
    valid,
    normalized: valid ? normalized : null,
    errors,
    avviso: valid ? AVVISO : null,
  };
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
