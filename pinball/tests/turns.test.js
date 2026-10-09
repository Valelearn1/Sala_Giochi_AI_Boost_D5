import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  createMatch,
  getCurrentPlayer,
  getBallNumber,
  addPoints,
  endBall,
  getRanking,
  getWinners,
} from '../js/turns.js';

const match = (names = ['Anna', 'Bruno']) => createMatch({ playerNames: names, ballsPerPlayer: 3 });

test('da 1 a 4 giocatori', () => {
  assert.doesNotThrow(() => match(['Solo']));
  assert.doesNotThrow(() => match(['A', 'B', 'C', 'D']));
  assert.throws(() => match([]));
  assert.throws(() => match(['A', 'B', 'C', 'D', 'E']));
});

test('a ogni pallina persa il turno passa al giocatore successivo', () => {
  const m = match(['A', 'B', 'C']);
  assert.equal(getCurrentPlayer(m).name, 'A');
  endBall(m);
  assert.equal(getCurrentPlayer(m).name, 'B');
  endBall(m);
  assert.equal(getCurrentPlayer(m).name, 'C');
  endBall(m);
  assert.equal(getCurrentPlayer(m).name, 'A');
  assert.equal(getBallNumber(m), 2);
});

test('i punti vanno al giocatore di turno', () => {
  const m = match();
  addPoints(m, 500);
  endBall(m);
  addPoints(m, 200);
  assert.deepEqual(m.players.map((p) => p.score), [500, 200]);
});

test('3 palline a testa: la partita finisce dopo 6 palline in due', () => {
  const m = match();
  const results = [];
  for (let i = 0; i < 6; i++) results.push(endBall(m).finished);
  assert.deepEqual(results, [false, false, false, false, false, true]);
  assert.equal(m.finished, true);
  assert.ok(m.players.every((p) => p.ballsLeft === 0));
});

test('giocatore singolo: gioca tutte e 3 le palline di fila', () => {
  const m = match(['Solo']);
  assert.equal(getBallNumber(m), 1);
  endBall(m);
  assert.equal(getBallNumber(m), 2);
  endBall(m);
  assert.equal(getBallNumber(m), 3);
  assert.equal(endBall(m).finished, true);
});

test('dopo la fine nessun punto viene più aggiunto', () => {
  const m = match(['Solo']);
  for (let i = 0; i < 3; i++) endBall(m);
  addPoints(m, 1000);
  assert.equal(m.players[0].score, 0);
});

test('classifica con vincitore e con pareggio', () => {
  const m = match(['A', 'B', 'C']);
  m.players[0].score = 3000;
  m.players[1].score = 9000;
  m.players[2].score = 3000;
  assert.deepEqual(getRanking(m).map((e) => [e.name, e.rank]), [['B', 1], ['A', 2], ['C', 2]]);
  assert.deepEqual(getWinners(m).map((p) => p.name), ['B']);

  m.players[1].score = 3000;
  assert.equal(getWinners(m).length, 3);
});
