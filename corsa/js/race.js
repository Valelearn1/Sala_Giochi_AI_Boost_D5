/*
 * GIRI E TEMPI DI UNA CORSA (logica pura, testata)
 *
 * Per contare un giro bisogna passare tutti i traguardi intermedi in ordine
 * e poi tornare al traguardo: così non si può tagliare né andare al contrario.
 */

/**
 * @param {object} options
 * @param {number} options.laps - quanti giri
 * @param {number[]} options.checkpoints - frazioni del giro, es. [0.25, 0.5, 0.75]
 */
export function createRace({ laps, checkpoints }) {
  return {
    laps,
    checkpoints,
    lap: 1, // il giro in corso
    nextCheckpoint: 0, // indice in checkpoints; quando li ha passati tutti si punta al traguardo
    lapTimes: [],
    lapStartedAt: 0,
    finished: false,
    totalTime: null,
  };
}

/** Quanto vicino (in frazione di giro) bisogna passare a un traguardo perché conti. */
const WINDOW = 0.06;

/** Distanza "in avanti" da a a b sul giro, tra 0 e 1. */
function aheadOf(a, b) {
  return (b - a + 1) % 1;
}

/**
 * Aggiorna la corsa con la posizione dell'auto.
 * @param {object} race
 * @param {number} progress - avanzamento nel giro (0…1), da nearestOnTrack
 * @param {number} timeMs - tempo dal VIA
 * @returns {{ event: null | 'checkpoint' | 'lap' | 'finish', lapTime?: number }}
 */
export function updateRace(race, progress, timeMs) {
  if (race.finished) return { event: null };

  const allPassed = race.nextCheckpoint >= race.checkpoints.length;
  const target = allPassed ? 0 : race.checkpoints[race.nextCheckpoint];

  // Il traguardo (o il checkpoint) conta se ci siamo appena dentro, non "da dietro"
  if (aheadOf(target, progress) > WINDOW) return { event: null };

  if (!allPassed) {
    race.nextCheckpoint += 1;
    return { event: 'checkpoint' };
  }

  const lapTime = timeMs - race.lapStartedAt;
  race.lapTimes.push(lapTime);
  race.lapStartedAt = timeMs;
  race.nextCheckpoint = 0;

  if (race.lap >= race.laps) {
    race.finished = true;
    race.totalTime = timeMs;
    return { event: 'finish', lapTime };
  }
  race.lap += 1;
  return { event: 'lap', lapTime };
}

/** Il giro più veloce finora (null se non ce n'è ancora uno). */
export function bestLap(race) {
  return race.lapTimes.length ? Math.min(...race.lapTimes) : null;
}

/** 83456 → "1:23.4" */
export function formatTime(milliseconds) {
  const tenths = Math.floor(milliseconds / 100);
  const minutes = Math.floor(tenths / 600);
  const seconds = Math.floor((tenths % 600) / 10);
  return `${minutes}:${String(seconds).padStart(2, '0')}.${tenths % 10}`;
}
