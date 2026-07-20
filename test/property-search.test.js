/**
 * Test per scripts/property-search.js
 * Esegui con: node --test test/property-search.test.js
 */

'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

const { search, loadCatalog, validateFilters } = require('../scripts/property-search.js');

const CATALOG_PATH = path.join(__dirname, '..', 'data', 'properties.demo.json');

function loadProps() {
  return loadCatalog(CATALOG_PATH);
}

test('catalogo demo: struttura valida', () => {
  const props = loadProps();
  assert.ok(props.length >= 8, 'Il catalogo deve avere almeno 8 proprietà');
  for (const p of props) {
    assert.ok(p.id, `Proprietà senza id: ${JSON.stringify(p)}`);
    assert.ok(typeof p.prezzo === 'number', `Prezzo non numerico per ${p.id}`);
    assert.ok(typeof p.stato_demo === 'boolean', `stato_demo non booleano per ${p.id}`);
    assert.ok(p.nota_verifica, `nota_verifica mancante per ${p.id}`);
  }
});

test('ricerca per budget massimo', () => {
  const props = loadProps();
  const results = search(props, { budgetMax: 200000 });
  assert.ok(results.length > 0, 'Devono esserci proprietà sotto 200.000 EUR');
  for (const r of results) {
    assert.ok(r.prezzo <= 200000, `Prezzo ${r.prezzo} supera il budget massimo`);
  }
});

test('ricerca per budget minimo', () => {
  const props = loadProps();
  const results = search(props, { budgetMin: 800000 });
  for (const r of results) {
    assert.ok(r.prezzo >= 800000, `Prezzo ${r.prezzo} è sotto il budget minimo`);
  }
});

test('ricerca per comune', () => {
  const props = loadProps();
  const results = search(props, { comune: 'Bergamo' });
  assert.ok(results.length > 0, 'Devono esserci proprietà a Bergamo');
  for (const r of results) {
    assert.ok(r.comune.toLowerCase().includes('bergamo'), `Comune ${r.comune} non corrisponde`);
  }
});

test('ricerca per zona parziale', () => {
  const props = loadProps();
  const results = search(props, { zona: 'Alta' });
  assert.ok(results.length > 0, 'Devono esserci proprietà in zone con "Alta"');
});

test('ricerca per tipologia', () => {
  const props = loadProps();
  const results = search(props, { tipologia: 'villa' });
  assert.ok(results.length > 0, 'Devono esserci ville nel catalogo');
  for (const r of results) {
    assert.equal(r.tipologia, 'villa');
  }
});

test('ricerca per camere minime', () => {
  const props = loadProps();
  const results = search(props, { camereMin: 4 });
  for (const r of results) {
    assert.ok(r.camere >= 4, `Camere ${r.camere} è inferiore al minimo richiesto`);
  }
});

test('ricerca per caratteristiche', () => {
  const props = loadProps();
  const results = search(props, { caratteristiche: ['piscina'] });
  assert.ok(results.length > 0, 'Devono esserci proprietà con piscina');
  for (const r of results) {
    const found = r.caratteristiche.some((c) => c.toLowerCase().includes('piscina'));
    assert.ok(found, `Proprietà ${r.id} non ha la caratteristica richiesta`);
  }
});

test('nessun risultato con filtri estremi', () => {
  const props = loadProps();
  const results = search(props, { budgetMax: 1, camereMin: 100 });
  assert.equal(results.length, 0, 'Con filtri impossibili non ci devono essere risultati');
});

test('tutti i record hanno stato_demo=true nel catalogo demo', () => {
  const props = loadProps();
  for (const p of props) {
    assert.equal(p.stato_demo, true, `Proprietà ${p.id} non è marcata come demo`);
  }
});

test('ricerca per superficie minima', () => {
  const props = loadProps();
  const results = search(props, { superficieMin: 200 });
  assert.ok(results.length > 0, 'Devono esserci proprietà con superficie >= 200 mq');
  for (const r of results) {
    assert.ok(r.superficie_mq >= 200, `Superficie ${r.superficie_mq} è inferiore al minimo richiesto`);
  }
});

test('ricerca per superficie massima', () => {
  const props = loadProps();
  const results = search(props, { superficieMax: 80 });
  assert.ok(results.length > 0, 'Devono esserci proprietà con superficie <= 80 mq');
  for (const r of results) {
    assert.ok(r.superficie_mq <= 80, `Superficie ${r.superficie_mq} supera il massimo richiesto`);
  }
});

test('ordinamento per prezzo crescente', () => {
  const props = loadProps();
  const results = search(props, { sort: 'prezzo-asc' });
  for (let i = 1; i < results.length; i++) {
    assert.ok(results[i].prezzo >= results[i - 1].prezzo, 'I risultati non sono ordinati per prezzo crescente');
  }
});

test('ordinamento per prezzo decrescente', () => {
  const props = loadProps();
  const results = search(props, { sort: 'prezzo-desc' });
  for (let i = 1; i < results.length; i++) {
    assert.ok(results[i].prezzo <= results[i - 1].prezzo, 'I risultati non sono ordinati per prezzo decrescente');
  }
});

test('ordinamento per superficie crescente', () => {
  const props = loadProps();
  const results = search(props, { sort: 'superficie-asc' });
  for (let i = 1; i < results.length; i++) {
    assert.ok(results[i].superficie_mq >= results[i - 1].superficie_mq, 'I risultati non sono ordinati per superficie crescente');
  }
});

test('validateFilters: errore superficie-min > superficie-max', () => {
  const errors = validateFilters({ superficieMin: 300, superficieMax: 100 });
  assert.ok(errors.some((e) => e.includes('superficie')), 'Deve esserci un errore per superficie-min > superficie-max');
});

test('validateFilters: sort non valido', () => {
  const errors = validateFilters({ sort: 'prezzo-laterale' });
  assert.ok(errors.some((e) => e.includes('sort')), 'Deve esserci un errore per sort non valido');
});

test('validateFilters: sort valido non produce errori', () => {
  assert.deepEqual(validateFilters({ sort: 'prezzo-asc' }), []);
  assert.deepEqual(validateFilters({ sort: 'superficie-desc' }), []);
});

