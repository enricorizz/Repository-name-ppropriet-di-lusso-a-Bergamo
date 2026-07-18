/**
 * Test per scripts/lead-validate.js
 * Esegui con: node --test test/lead-validate.test.js
 */

'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');

const { validate } = require('../scripts/lead-validate.js');

test('lead valido: campi obbligatori presenti', () => {
  const result = validate({ nome: 'Mario Rossi', email: 'mario@esempio.it' });
  assert.equal(result.valid, true);
  assert.ok(result.normalized);
  assert.equal(result.errors.length, 0);
});

test('lead valido: normalizzazione email in minuscolo', () => {
  const result = validate({ nome: 'Mario', email: 'MARIO@ESEMPIO.IT' });
  assert.equal(result.valid, true);
  assert.equal(result.normalized.email, 'mario@esempio.it');
});

test('lead valido: tutti i campi opzionali', () => {
  const result = validate({
    nome: 'Maria',
    cognome: 'Bianchi',
    email: 'maria@test.it',
    telefono: '333 123 4567',
    interesse: 'acquisto',
    budget_max: 350000,
    messaggio: 'Cerco un appartamento a Bergamo',
  });
  assert.equal(result.valid, true);
  assert.equal(result.normalized.interesse, 'acquisto');
  assert.equal(result.normalized.budget_max, 350000);
});

test('lead non valido: email assente', () => {
  const result = validate({ nome: 'Mario' });
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((e) => e.includes('email')));
});

test('lead non valido: email malformata', () => {
  const result = validate({ nome: 'Mario', email: 'non-una-email' });
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((e) => e.toLowerCase().includes('email')));
});

test('lead non valido: nome assente', () => {
  const result = validate({ email: 'mario@esempio.it' });
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((e) => e.includes('nome')));
});

test('lead non valido: interesse fuori lista', () => {
  const result = validate({ nome: 'Mario', email: 'mario@test.it', interesse: 'SCAMBIO' });
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((e) => e.toLowerCase().includes('interesse')));
});

test('lead non valido: budget_max negativo', () => {
  const result = validate({ nome: 'Mario', email: 'mario@test.it', budget_max: -1 });
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((e) => e.toLowerCase().includes('budget')));
});

test('input non valido: non-oggetto', () => {
  const result = validate('stringa');
  assert.equal(result.valid, false);
  assert.ok(result.errors.length > 0);
});

test('input non valido: array', () => {
  const result = validate([{ nome: 'Mario' }]);
  assert.equal(result.valid, false);
});

test('lead non valido: normalized è null', () => {
  const result = validate({ nome: 'Mario' });
  assert.equal(result.normalized, null);
});
