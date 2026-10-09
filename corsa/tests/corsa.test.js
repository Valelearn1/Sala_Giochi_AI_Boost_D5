/*
 * Test della corsa:   node --test corsa/tests/*.test.js
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { smoothLoop, measureLoop, nearestOnTrack, directionAt } from '../js/track.js';
import { createCar, stepCar, keepInside } from '../js/car.js';
import { createRace, updateRace, bestLap, formatTime } from '../js/race.js';
import { createMatch, finishRun, getRanking, getWinners, getCurrentPlayer } from '../js/turns.js';
import { updateRecord, loadRecord, saveRecord } from '../js/records.js';
import { CAR } from '../js/config/physics-config.js';
import { CONTROL_POINTS, ROAD_WIDTH, TRACK_WIDTH, TRACK_HEIGHT, LAPS, CHECKPOINTS } from '../js/config/track.js';
import { STEP_SECONDS } from '../js/config/physics-config.js';

const square = [[0, 0], [100, 0], [100, 100], [0, 100]];

test('la curva morbida passa per i punti di controllo ed è chiusa', () => {
  const path = smoothLoop(square, 4);
  assert.equal(path.length, 16);
  assert.deepEqual(path[0], { x: 0, y: 0 });
  assert.deepEqual(path[4], { x: 100, y: 0 });
});

test('il punto più vicino dà distanza e avanzamento nel giro', () => {
  const path = square.map(([x, y]) => ({ x, y }));
  const lengths = measureLoop(path);
  assert.equal(lengths.total, 400);
  const middleTop = nearestOnTrack(path, lengths, 50, 10);
  assert.equal(middleTop.distance, 10);
  assert.equal(middleTop.progress, 50 / 400);
  const rightSide = nearestOnTrack(path, lengths, 90, 50);
  assert.equal(rightSide.progress, 150 / 400);
  assert.equal(directionAt(path, 0), 0); // da (0,0) verso (100,0): verso destra
});

test('la pista vera è dentro il campo e non si sovrappone a se stessa', () => {
  const path = smoothLoop(CONTROL_POINTS, 8);
  for (const point of path) {
    assert.ok(point.x > ROAD_WIDTH / 2 && point.x < TRACK_WIDTH - ROAD_WIDTH / 2, `x fuori campo: ${point.x}`);
    assert.ok(point.y > ROAD_WIDTH / 2 && point.y < TRACK_HEIGHT - ROAD_WIDTH / 2, `y fuori campo: ${point.y}`);
  }
  // Due tratti lontani nel giro devono stare a più di una larghezza di strada l'uno dall'altro
  const lengths = measureLoop(path);
  for (let i = 0; i < path.length; i += 3) {
    for (let j = 0; j < path.length; j += 3) {
      const gap = Math.abs(lengths.cumulative[i] - lengths.cumulative[j]);
      const alongLoop = Math.min(gap, lengths.total - gap);
      if (alongLoop < 300) continue;
      const distance = Math.hypot(path[i].x - path[j].x, path[i].y - path[j].y);
      assert.ok(distance > ROAD_WIDTH, `tratti ${i} e ${j} troppo vicini: ${distance.toFixed(0)}`);
    }
  }
});

test("l'auto accelera fino al massimo, più piano fuori pista", () => {
  const car = createCar({ x: 0, y: 0, angle: 0 });
  for (let i = 0; i < 600; i++) stepCar(car, { gas: true }, 1 / 120, CAR, true);
  assert.equal(car.speed, CAR.maxSpeed);
  assert.ok(car.x > 0 && Math.abs(car.y) < 1e-9, 'va dritta verso destra');
  for (let i = 0; i < 600; i++) stepCar(car, { gas: true }, 1 / 120, CAR, false);
  assert.equal(car.speed, CAR.offroadMaxSpeed);
});

test("senza pedali si ferma; da ferma non sterza; il freno fa retromarcia", () => {
  const car = createCar({ x: 0, y: 0, angle: 0 });
  car.speed = 100;
  for (let i = 0; i < 240; i++) stepCar(car, {}, 1 / 120, CAR, true);
  assert.equal(car.speed, 0);
  stepCar(car, { left: true }, 1 / 120, CAR, true);
  assert.equal(car.angle, 0);
  for (let i = 0; i < 600; i++) stepCar(car, { brake: true }, 1 / 120, CAR, true);
  assert.equal(car.speed, -CAR.reverseMaxSpeed);
});

test("contro il bordo del campo l'auto resta dentro e rallenta", () => {
  const car = { x: -50, y: 450, angle: Math.PI, speed: 200 };
  keepInside(car, 600, 900);
  assert.equal(car.x, 12);
  assert.ok(car.speed < 200);
});

test('un giro conta solo passando tutti i traguardi intermedi in ordine', () => {
  const race = createRace({ laps: 2, checkpoints: [0.25, 0.5, 0.75] });
  assert.equal(updateRace(race, 0.02, 0).event, null); // si parte dal traguardo: non è un giro
  assert.equal(updateRace(race, 0.52, 1000).event, null); // saltato il primo traguardo intermedio
  assert.equal(updateRace(race, 0.27, 2000).event, 'checkpoint');
  assert.equal(updateRace(race, 0.51, 3000).event, 'checkpoint');
  assert.equal(updateRace(race, 0.02, 3500).event, null); // tagliando prima dell'ultimo non vale
  assert.equal(updateRace(race, 0.76, 4000).event, 'checkpoint');
  assert.equal(updateRace(race, 0.99, 4500).event, null);
  assert.deepEqual(updateRace(race, 0.01, 5000), { event: 'lap', lapTime: 5000 });
  assert.equal(race.lap, 2);
  for (const [progress, time] of [[0.26, 6000], [0.5, 7000], [0.75, 8000]]) updateRace(race, progress, time);
  assert.deepEqual(updateRace(race, 0.0, 9000), { event: 'finish', lapTime: 4000 });
  assert.equal(race.finished, true);
  assert.equal(race.totalTime, 9000);
  assert.equal(bestLap(race), 4000);
  assert.equal(updateRace(race, 0.3, 9500).event, null); // finita: niente più eventi
});

test('i tempi si scrivono minuti:secondi.decimi', () => {
  assert.equal(formatTime(0), '0:00.0');
  assert.equal(formatTime(83456), '1:23.4');
  assert.equal(formatTime(9999), '0:09.9');
});

test('turni: uno alla volta, vince il tempo più basso, pari tempo stessa posizione', () => {
  const match = createMatch({ playerNames: ['Anna', 'Bruno', 'Carla'] });
  assert.equal(getCurrentPlayer(match).name, 'Anna');
  assert.equal(finishRun(match, { totalTime: 60000, bestLap: 19000 }).finished, false);
  assert.equal(getCurrentPlayer(match).name, 'Bruno');
  finishRun(match, { totalTime: 55000, bestLap: 18000 });
  assert.equal(finishRun(match, { totalTime: 55000, bestLap: 17500 }).finished, true);
  assert.deepEqual(getRanking(match).map((entry) => [entry.name, entry.rank]), [['Bruno', 1], ['Carla', 1], ['Anna', 3]]);
  assert.deepEqual(getWinners(match).map((player) => player.name), ['Bruno', 'Carla']);
  assert.throws(() => createMatch({ playerNames: [] }));
});

test('record: serve un tempo più basso; archivio bloccato senza errori', () => {
  assert.deepEqual(updateRecord(null, { name: 'Asta', totalTime: 70000 }), { best: { name: 'Asta', totalTime: 70000 }, isNew: true });
  const record = { name: 'Yuno', totalTime: 60000 };
  assert.equal(updateRecord(record, { name: 'Asta', totalTime: 60000 }).isNew, false);
  assert.equal(updateRecord(record, { name: 'Asta', totalTime: 59000 }).isNew, true);
  const blocked = { getItem() { throw new Error('no'); }, setItem() { throw new Error('no'); } };
  assert.equal(loadRecord(blocked), null);
  assert.doesNotThrow(() => saveRecord(record, blocked));
});

test('la pista si può guidare: un pilota automatico fa tutti i giri restando in strada', () => {
  const path = smoothLoop(CONTROL_POINTS, 8);
  const lengths = measureLoop(path);
  const car = createCar({ x: path[0].x, y: path[0].y, angle: directionAt(path, 0) });
  const race = createRace({ laps: LAPS, checkpoints: CHECKPOINTS });
  let offroadSteps = 0;
  let time = 0;
  for (let step = 0; step < 120 * 120 && !race.finished; step++) {
    const near = nearestOnTrack(path, lengths, car.x, car.y);
    // Punta a un punto della pista poco più avanti e gira verso di lui
    const target = path[(near.segment + 6) % path.length];
    let turn = Math.atan2(target.y - car.y, target.x - car.x) - car.angle;
    turn = Math.atan2(Math.sin(turn), Math.cos(turn));
    const onRoad = near.distance < ROAD_WIDTH / 2;
    if (!onRoad) offroadSteps++;
    stepCar(car, { gas: true, left: turn < -0.05, right: turn > 0.05 }, STEP_SECONDS, CAR, onRoad);
    time += STEP_SECONDS * 1000;
    updateRace(race, near.progress, time);
  }
  assert.equal(race.finished, true);
  assert.equal(race.lapTimes.length, LAPS);
  assert.ok(time < 60_000, `troppo lenta: ${time} ms`);
  assert.ok(offroadSteps < 120 * 2, `troppo fuori pista: ${offroadSteps / 120} s`);
});
