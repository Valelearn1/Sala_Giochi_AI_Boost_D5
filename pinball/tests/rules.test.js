/*
 * Test delle regole del flipper (nessun browser, nessuna fisica):
 *
 *   node --test pinball/tests/*.test.js
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { createBallState, applyHit, endOfBallBonus } from '../js/rules.js';
import { RULES } from '../js/config/rules-config.js';

const newBall = () => createBallState({ laneCount: 3, targetCount: 4 });
const lane = (id) => ({ type: 'lane', id, points: 150 });
const target = (id) => ({ type: 'target', id, points: 250 });

test('ogni elemento dà i suoi punti base con moltiplicatore ×1', () => {
  const state = newBall();
  assert.equal(applyHit(state, { type: 'bumper', id: 0, points: 100 }, RULES).points, 100);
  assert.equal(applyHit(state, { type: 'slingshot', id: 'left', points: 50 }, RULES).points, 50);
  assert.equal(applyHit(state, { type: 'outlane', id: 'left', points: 500 }, RULES).points, 500);
});

test('accendere le 3 corsie aumenta il moltiplicatore e spegne le luci', () => {
  const state = newBall();
  applyHit(state, lane(0), RULES);
  applyHit(state, lane(0), RULES); // la stessa corsia due volte non basta
  applyHit(state, lane(1), RULES);
  assert.equal(state.multiplier, 1);

  const result = applyHit(state, lane(2), RULES);
  assert.equal(state.multiplier, 2);
  assert.equal(result.message, 'Moltiplicatore ×2!');
  assert.equal(result.multiplierUp, true);
  assert.deepEqual(state.lanesLit, [false, false, false]);
});

test('il moltiplicatore si applica ai punti e non supera il massimo', () => {
  const state = newBall();
  for (let round = 0; round < 10; round++) {
    [0, 1, 2].forEach((id) => applyHit(state, lane(id), RULES));
  }
  assert.equal(state.multiplier, RULES.multiplierMax);
  assert.equal(applyHit(state, { type: 'bumper', id: 1, points: 100 }, RULES).points, 100 * RULES.multiplierMax);
});

test('abbattere tutti i bersagli dà il bonus e li rialza', () => {
  const state = newBall();
  [0, 1, 2].forEach((id) => assert.equal(applyHit(state, target(id), RULES).resetTargets, false));

  const result = applyHit(state, target(3), RULES);
  assert.equal(result.resetTargets, true);
  assert.equal(result.message, 'Bonus bersagli!');
  assert.equal(result.points, 250 + RULES.targetBankBonus);
  assert.deepEqual(state.targetsDown, [false, false, false, false]);
});

test('un bersaglio già abbattuto non dà altri punti', () => {
  const state = newBall();
  applyHit(state, target(1), RULES);
  assert.equal(applyHit(state, target(1), RULES).points, 0);
  assert.equal(state.hits.target, 1);
});

test('bonus di fine pallina in base agli elementi colpiti', () => {
  const state = newBall();
  applyHit(state, { type: 'bumper', id: 0, points: 100 }, RULES);
  applyHit(state, { type: 'bumper', id: 1, points: 100 }, RULES);
  applyHit(state, target(0), RULES);

  const { bonus, details } = endOfBallBonus(state, RULES);
  assert.equal(bonus, 2 * RULES.endOfBallBonusPerHit.bumper + RULES.endOfBallBonusPerHit.target);
  assert.deepEqual(details.map((d) => d.type), ['bumper', 'target']);
});

test('una pallina nuova riparte con moltiplicatore ×1', () => {
  const state = newBall();
  [0, 1, 2].forEach((id) => applyHit(state, lane(id), RULES));
  assert.equal(state.multiplier, 2);
  assert.equal(newBall().multiplier, 1);
});
