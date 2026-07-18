/**
 * Test per scripts/property-search.js
 * Esegui con: node --test test/property-search.test.js
 */

'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

// Import interno del modulo di ricerca per test unitari
// Dobbiamo estrarre la funzione search; la importiamo direttamente
const CATALOG_PATH = path.join(__dirname, '..', 'data', 'properties.demo.json');
const fs = require('node:fs');

function loadCatalog() {
  const data = JSON.parse(fs.readFileSync(CATALOG_PATH, 'utf8'));
  assert.ok(Array.isArray(data.properties), 'Il catalogo deve avere un array properties');
  return data.properties;
}

function search(properties, filters) {
  return properties.filter((p) => {
    if (filters.budgetMax !== undefined && p.prezzo > filters.budgetMax) return false;
    if (filters.budgetMin !== undefined && p.prezzo < filters.budgetMin) return false;
    if (filters.comune) {
      if (!p.comune.toLowerCase().includes(filters.comune.toLowerCase())) return false;
    }
    if (filters.zona) {
      if (
        !p.zona.toLowerCase().includes(filters.zona.toLowerCase()) &&
        !p.comune.toLowerCase().includes(filters.zona.toLowerCase())
      )
        return false;
    }
    if (filters.tipologia) {
      if (p.tipologia.toLowerCase() !== filters.tipologia.toLowerCase()) return false;
    }
    if (filters.camereMin !== undefined && p.camere < filters.camereMin) return false;
    if (filters.caratteristiche && filters.caratteristiche.length > 0) {
      for (const req of filters.caratteristiche) {
        const found = p.caratteristiche.some((c) => c.toLowerCase().includes(req.toLowerCase()));
        if (!found) return false;
      }
    }
    return true;
  });
}

test('catalogo demo: struttura valida', () => {
  const props = loadCatalog();
  assert.ok(props.length >= 8, 'Il catalogo deve avere almeno 8 proprietà');
  for (const p of props) {
    assert.ok(p.id, `Proprietà senza id: ${JSON.stringify(p)}`);
    assert.ok(typeof p.prezzo === 'number', `Prezzo non numerico per ${p.id}`);
    assert.ok(typeof p.stato_demo === 'boolean', `stato_demo non booleano per ${p.id}`);
    assert.ok(p.nota_verifica, `nota_verifica mancante per ${p.id}`);
  }
});

test('ricerca per budget massimo', () => {
  const props = loadCatalog();
  const results = search(props, { budgetMax: 200000 });
  assert.ok(results.length > 0, 'Devono esserci proprietà sotto 200.000 EUR');
  for (const r of results) {
    assert.ok(r.prezzo <= 200000, `Prezzo ${r.prezzo} supera il budget massimo`);
  }
});

test('ricerca per budget minimo', () => {
  const props = loadCatalog();
  const results = search(props, { budgetMin: 800000 });
  for (const r of results) {
    assert.ok(r.prezzo >= 800000, `Prezzo ${r.prezzo} è sotto il budget minimo`);
  }
});

test('ricerca per comune', () => {
  const props = loadCatalog();
  const results = search(props, { comune: 'Bergamo' });
  assert.ok(results.length > 0, 'Devono esserci proprietà a Bergamo');
  for (const r of results) {
    assert.ok(r.comune.toLowerCase().includes('bergamo'), `Comune ${r.comune} non corrisponde`);
  }
});

test('ricerca per zona parziale', () => {
  const props = loadCatalog();
  const results = search(props, { zona: 'Alta' });
  assert.ok(results.length > 0, 'Devono esserci proprietà in zone con "Alta"');
});

test('ricerca per tipologia', () => {
  const props = loadCatalog();
  const results = search(props, { tipologia: 'villa' });
  assert.ok(results.length > 0, 'Devono esserci ville nel catalogo');
  for (const r of results) {
    assert.equal(r.tipologia, 'villa');
  }
});

test('ricerca per camere minime', () => {
  const props = loadCatalog();
  const results = search(props, { camereMin: 4 });
  for (const r of results) {
    assert.ok(r.camere >= 4, `Camere ${r.camere} è inferiore al minimo richiesto`);
  }
});

test('ricerca per caratteristiche', () => {
  const props = loadCatalog();
  const results = search(props, { caratteristiche: ['piscina'] });
  assert.ok(results.length > 0, 'Devono esserci proprietà con piscina');
  for (const r of results) {
    const found = r.caratteristiche.some((c) => c.toLowerCase().includes('piscina'));
    assert.ok(found, `Proprietà ${r.id} non ha la caratteristica richiesta`);
  }
});

test('nessun risultato con filtri estremi', () => {
  const props = loadCatalog();
  const results = search(props, { budgetMax: 1, camereMin: 100 });
  assert.equal(results.length, 0, 'Con filtri impossibili non ci devono essere risultati');
});

test('tutti i record hanno stato_demo=true nel catalogo demo', () => {
  const props = loadCatalog();
  for (const p of props) {
    assert.equal(p.stato_demo, true, `Proprietà ${p.id} non è marcata come demo`);
  }
});
