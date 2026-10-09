/*
 * Test dei record del Memory:   node --test memory/tests/*.test.js
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { isBetter, updateRecord, loadRecords, saveRecords } from '../js/records.js';

const giulia = { name: 'Giulia', durationMs: 60_000, moves: 12 };

test('la prima partita di un livello è sempre un record', () => {
  const { records, isNew } = updateRecord({}, '4x4', giulia);
  assert.equal(isNew, true);
  assert.deepEqual(records['4x4'], giulia);
});

test('vince il tempo più basso; a parità di tempo, meno mosse', () => {
  assert.equal(isBetter({ durationMs: 50_000, moves: 20 }, giulia), true);
  assert.equal(isBetter({ durationMs: 70_000, moves: 8 }, giulia), false);
  assert.equal(isBetter({ durationMs: 60_000, moves: 10 }, giulia), true);
  assert.equal(isBetter({ durationMs: 60_000, moves: 12 }, giulia), false);
});

test('un risultato peggiore non cambia il record e i livelli sono separati', () => {
  const start = { '4x4': giulia };
  const slower = updateRecord(start, '4x4', { name: 'Marco', durationMs: 90_000, moves: 9 });
  assert.equal(slower.isNew, false);
  assert.equal(slower.best, giulia);
  assert.equal(slower.records, start);

  const otherLevel = updateRecord(start, '6x6', { name: 'Marco', durationMs: 90_000, moves: 30 });
  assert.equal(otherLevel.isNew, true);
  assert.deepEqual(Object.keys(otherLevel.records), ['4x4', '6x6']);
});

test('archivio vuoto, rovinato o bloccato: nessun record e nessun errore', () => {
  const memoryStorage = new Map();
  const storage = { getItem: (key) => memoryStorage.get(key) ?? null, setItem: (key, value) => memoryStorage.set(key, value) };
  assert.deepEqual(loadRecords(storage), {});
  saveRecords({ '4x4': giulia }, storage);
  assert.deepEqual(loadRecords(storage), { '4x4': giulia });

  memoryStorage.set('sala-record-memory', '{non è json');
  assert.deepEqual(loadRecords(storage), {});

  const blocked = { getItem() { throw new Error('bloccato'); }, setItem() { throw new Error('bloccato'); } };
  assert.deepEqual(loadRecords(blocked), {});
  assert.doesNotThrow(() => saveRecords({}, blocked));
});
