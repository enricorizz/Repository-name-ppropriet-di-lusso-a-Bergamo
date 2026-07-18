/**
 * Test per scripts/visit-request.js
 * Esegui con: node --test test/visit-request.test.js
 */

'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');

const { validate } = require('../scripts/visit-request.js');

// Data futura per i test
function futureDate(daysAhead = 30) {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  return d.toISOString().slice(0, 10);
}

const VALID_BASE = {
  property_id: 'BG-2026-001',
  nome: 'Mario Rossi',
  email: 'mario@esempio.it',
  data_preferita: futureDate(30),
};

test('richiesta visita valida: campi minimi', () => {
  const result = validate(VALID_BASE);
  assert.equal(result.valid, true);
  assert.ok(result.normalized);
  assert.equal(result.errors.length, 0);
  assert.ok(result.avviso, 'Deve esserci un avviso sulla necessità di conferma umana');
});

test('richiesta visita valida: con fascia oraria', () => {
  const result = validate({ ...VALID_BASE, fascia_oraria: 'mattina' });
  assert.equal(result.valid, true);
  assert.equal(result.normalized.fascia_oraria, 'mattina');
});

test('richiesta visita valida: property_id normalizzato in maiuscolo', () => {
  const result = validate({ ...VALID_BASE, property_id: 'bg-2026-001' });
  assert.equal(result.valid, true);
  assert.equal(result.normalized.property_id, 'BG-2026-001');
});

test('avviso presente: la conferma richiede operatore umano', () => {
  const result = validate(VALID_BASE);
  assert.ok(result.avviso);
  assert.ok(result.avviso.toLowerCase().includes('operatore'), 'Il messaggio deve menzionare operatore umano');
});

test('richiesta non valida: property_id mancante', () => {
  const { property_id: _, ...rest } = VALID_BASE;
  const result = validate(rest);
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((e) => e.includes('property_id')));
});

test('richiesta non valida: property_id formato errato', () => {
  const result = validate({ ...VALID_BASE, property_id: '123-ERRORE' });
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((e) => e.includes('property_id')));
});

test('richiesta non valida: data passata', () => {
  const result = validate({ ...VALID_BASE, data_preferita: '2020-01-01' });
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((e) => e.toLowerCase().includes('data')));
});

test('richiesta non valida: formato data errato', () => {
  const result = validate({ ...VALID_BASE, data_preferita: '15/08/2026' });
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((e) => e.toLowerCase().includes('data')));
});

test('richiesta non valida: email assente', () => {
  const { email: _, ...rest } = VALID_BASE;
  const result = validate(rest);
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((e) => e.includes('email')));
});

test('richiesta non valida: fascia oraria non valida', () => {
  const result = validate({ ...VALID_BASE, fascia_oraria: 'notte' });
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((e) => e.toLowerCase().includes('fascia')));
});

test('input non valido: non-oggetto', () => {
  const result = validate(null);
  assert.equal(result.valid, false);
  assert.equal(result.avviso, null);
});
