/*
 * Test del record del flipper:   node --test pinball/tests/*.test.js
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { updateRecord, loadRecord, saveRecord } from '../js/records.js';

test('senza record, il primo punteggio sopra zero diventa il record', () => {
  assert.deepEqual(updateRecord(null, { name: 'Asta', score: 1200 }), { best: { name: 'Asta', score: 1200 }, isNew: true });
  assert.deepEqual(updateRecord(null, { name: 'Asta', score: 0 }), { best: null, isNew: false });
});

test('serve un punteggio più alto: il pareggio non basta', () => {
  const record = { name: 'Yuno', score: 5000 };
  assert.equal(updateRecord(record, { name: 'Asta', score: 5000 }).isNew, false);
  assert.equal(updateRecord(record, { name: 'Asta', score: 4999 }).best, record);
  assert.deepEqual(updateRecord(record, { name: 'Asta', score: 5001 }), { best: { name: 'Asta', score: 5001 }, isNew: true });
});

test('archivio rovinato o bloccato: nessun record e nessun errore', () => {
  const memoryStorage = new Map();
  const storage = { getItem: (key) => memoryStorage.get(key) ?? null, setItem: (key, value) => memoryStorage.set(key, value) };
  assert.equal(loadRecord(storage), null);
  saveRecord({ name: 'Noelle', score: 300 }, storage);
  assert.deepEqual(loadRecord(storage), { name: 'Noelle', score: 300 });
  memoryStorage.set('sala-record-flipper', '"testo"');
  assert.equal(loadRecord(storage), null);

  const blocked = { getItem() { throw new Error('bloccato'); }, setItem() { throw new Error('bloccato'); } };
  assert.equal(loadRecord(blocked), null);
  assert.doesNotThrow(() => saveRecord({ name: 'Asta', score: 1 }, blocked));
});
