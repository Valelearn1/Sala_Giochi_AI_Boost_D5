/*
 * PUNTO DI INGRESSO
 *
 * Collega pista, auto, giri, turni, disegno, comandi e pannello.
 * Fasi della partita:
 *   setup → turn ("Tocca a…") → countdown (3, 2, 1, VIA!) → racing → arrived → turn del prossimo…
 *   … e alla fine results. Durante countdown e racing si può mettere in pausa.
 */

import * as trackData from './config/track.js';
import { CAR, STEP_SECONDS, MAX_FRAME_SECONDS, COUNTDOWN_SECONDS } from './config/physics-config.js';
import { getTheme } from './config/theme.js';
import { smoothLoop, measureLoop, nearestOnTrack, directionAt } from './track.js';
import { createCar, stepCar, keepInside } from './car.js';
import { createRace, updateRace, bestLap, formatTime } from './race.js';
import { createMatch, finishRun, getWinners } from './turns.js';
import { loadRecord, saveRecord, updateRecord } from './records.js';
import { createRenderer } from './render.js';
import { createInput } from './input.js';
import * as hud from './hud.js';
import * as sound from '../../assets/suoni.js';
import { createAudioPanel } from '../../assets/pannello-audio.js';

/** Dopo l'arrivo, quanto resta il tempo sullo schermo prima del prossimo turno. */
const ARRIVED_MS = 1800;

const path = smoothLoop(trackData.CONTROL_POINTS, 8);
const lengths = measureLoop(path);
const startAngle = directionAt(path, 0);

const elements = {
  canvas: document.querySelector('#track'),
  trackWrap: document.querySelector('#track-wrap'),
  soundToggle: document.querySelector('#sound-toggle'),
};

const currentTheme = () => getTheme(window.SalaTema?.get(), window.SalaTema?.getMode());
const renderer = createRenderer({ canvas: elements.canvas, path, lengths, theme: currentTheme() });
window.addEventListener('sala-tema', () => renderer.setTheme(currentTheme()));
window.addEventListener('sala-modo', () => renderer.setTheme(currentTheme()));

const input = createInput({
  buttons: document.querySelectorAll('[data-control]'),
  onPause: togglePause,
});

let settings = null;
let match = null;
let race = null;
let car = null;
let phase = 'setup';
let pausedFrom = null; // la fase da riprendere dopo la pausa
let raceTime = 0; // millisecondi dal VIA (si ferma in pausa)
let countdownLeft = 0; // secondi
let arrivedTimer = null;
let lastFrame = performance.now();
let accumulator = 0;
let wasOffRoad = false;

// --- Flusso della partita ------------------------------------------------------

function startMatch(newSettings) {
  clearTimeout(arrivedTimer);
  settings = newSettings;
  match = createMatch({ playerNames: settings.playerNames });
  hud.hidePauseOverlay();
  hud.showScreen('game');
  hud.afterScreenChange(fitTrack); // la pista si misura quando la schermata è visibile
  beginTurn();
}

/** "Tocca a…": auto sulla linea di partenza, ferma. */
function beginTurn() {
  phase = 'turn';
  input.setEnabled(false);
  car = createCar({ x: path[0].x, y: path[0].y, angle: startAngle });
  race = createRace({ laps: trackData.LAPS, checkpoints: trackData.CHECKPOINTS });
  raceTime = 0;
  renderer.reset();
  hud.renderHud({ match, race, timeMs: 0 });
  hud.showMessage('', { sticky: true });
  hud.showTurnOverlay(match);
  sound.play('turn');
}

function startCountdown() {
  hud.hideTurnOverlay();
  phase = 'countdown';
  countdownLeft = COUNTDOWN_SECONDS;
  hud.showCountdown(String(COUNTDOWN_SECONDS));
  sound.play('countdown');
  sound.startMusic();
}

/** Ogni secondo del conto alla rovescia: 3, 2, 1… VIA! */
function tickCountdown(seconds) {
  const before = Math.ceil(countdownLeft);
  countdownLeft -= seconds;
  const now = Math.ceil(countdownLeft);
  if (now === before) return;
  if (now > 0) {
    hud.showCountdown(String(now));
    sound.play('countdown');
  } else {
    hud.showCountdown('VIA!');
    sound.play('go');
    setTimeout(() => phase === 'racing' && hud.showCountdown(null), 700);
    phase = 'racing';
    input.setEnabled(true);
    hud.showMessage(`Giro 1 di ${race.laps}`);
  }
}

/** Un passo di simulazione: guida, pista, giri. */
function stepRace() {
  const near = nearestOnTrack(path, lengths, car.x, car.y);
  const onRoad = near.distance < trackData.ROAD_WIDTH / 2;
  stepCar(car, input.controls, STEP_SECONDS, CAR, onRoad);
  keepInside(car, trackData.TRACK_WIDTH, trackData.TRACK_HEIGHT);
  raceTime += STEP_SECONDS * 1000;

  if (!onRoad && !wasOffRoad && Math.abs(car.speed) > 60) hud.showMessage('Fuori pista: si va piano!');
  wasOffRoad = !onRoad;

  // Vicino alla strada contano giri e traguardi intermedi (lontano, sul prato, no)
  if (near.distance > trackData.ROAD_WIDTH * 1.5) return;
  const { event, lapTime } = updateRace(race, near.progress, raceTime);
  if (event === 'lap') {
    sound.play('lap');
    hud.showMessage(`Giro ${race.lap - 1}: ${formatTime(lapTime)} · ora il giro ${race.lap}`);
  } else if (event === 'finish') {
    arrive();
  }
}

/** Arrivo: si salva il tempo, poi tocca al prossimo (o la classifica). */
function arrive() {
  phase = 'arrived';
  input.setEnabled(false);
  sound.play('lap');
  hud.showCountdown('ARRIVO!');
  hud.showMessage(`Tempo: ${formatTime(race.totalTime)}`, { sticky: true });
  const { finished } = finishRun(match, { totalTime: race.totalTime, bestLap: bestLap(race) });
  arrivedTimer = setTimeout(() => {
    hud.showCountdown(null);
    if (finished) showResults();
    else beginTurn();
  }, ARRIVED_MS);
}

function showResults() {
  phase = 'results';
  sound.stopMusic();
  hud.showScreen('results');
  const winners = getWinners(match);
  const names = new Intl.ListFormat('it', { type: 'conjunction' }).format(winners.map((player) => player.name));
  const { best, isNew } = updateRecord(loadRecord(), { name: names, totalTime: winners[0].totalTime });
  if (isNew) saveRecord(best);
  hud.renderResults(match, { best, isNew });
  sound.play('fanfare');
}

function goToSetup() {
  clearTimeout(arrivedTimer);
  phase = 'setup';
  input.setEnabled(false);
  sound.stopMusic();
  hud.hidePauseOverlay();
  hud.hideTurnOverlay();
  hud.showCountdown(null);
  hud.showScreen('setup');
}

function togglePause() {
  if (phase === 'countdown' || phase === 'racing') {
    pausedFrom = phase;
    phase = 'paused';
    input.setEnabled(false);
    sound.stopMusic();
    hud.showPauseOverlay();
  } else if (phase === 'paused') {
    phase = pausedFrom;
    hud.hidePauseOverlay();
    if (phase === 'racing') input.setEnabled(true);
    sound.startMusic();
  }
}

// --- Ciclo di gioco ----------------------------------------------------------------

/** Un fotogramma. `manual`: chiamato da corsaDebug.advance, non dal browser. */
function frame(now, manual = false) {
  const elapsed = Math.min((now - lastFrame) / 1000, MAX_FRAME_SECONDS);
  lastFrame = now;

  if (phase === 'countdown') tickCountdown(elapsed);
  if (phase === 'racing') {
    accumulator += elapsed;
    while (accumulator >= STEP_SECONDS && phase === 'racing') {
      stepRace();
      accumulator -= STEP_SECONDS;
    }
    hud.renderHud({ match, race, timeMs: raceTime });
  } else {
    accumulator = 0;
  }

  if (phase !== 'setup' && phase !== 'results' && car) renderer.draw(car, { offRoad: wasOffRoad });
  if (!manual) requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

// Con ?debug nell'indirizzo (es. corsa/?debug) dalla console si legge lo stato
// e si fa avanzare il gioco a mano: comodo per i test
if (new URLSearchParams(location.search).has('debug')) {
  window.corsaDebug = {
    get state() {
      return { phase, race, car, raceTime, match };
    },
    /** Fa avanzare il gioco di `seconds` secondi, a fotogrammi da 1/60 s. */
    advance(seconds) {
      for (let t = 0; t < seconds; t += 1 / 60) frame(lastFrame + 1000 / 60, true);
    },
  };
}

function fitTrack() {
  const box = elements.trackWrap.getBoundingClientRect();
  if (box.width > 0 && box.height > 0) renderer.resize(box.width, box.height);
}
new ResizeObserver(fitTrack).observe(elements.trackWrap);

// Scheda nascosta o telefono bloccato: pausa automatica
document.addEventListener('visibilitychange', () => {
  if (document.hidden && (phase === 'racing' || phase === 'countdown')) togglePause();
});

// --- Audio ------------------------------------------------------------------------

const audioPanel = createAudioPanel({
  button: elements.soundToggle,
  onToggle: () => {
    sound.setSoundOn(!sound.isSoundOn());
    audioPanel.render(sound.isSoundOn());
    if (sound.isSoundOn()) {
      sound.play('toggleOn');
      if (phase === 'racing' || phase === 'countdown') sound.startMusic();
    }
  },
});
audioPanel.render(sound.isSoundOn());

// --- Pulsanti --------------------------------------------------------------------

hud.updateNameFields(hud.readSettings().playerNames.length);
hud.onPlayerCountChange(hud.updateNameFields);
hud.onSetupSubmit(startMatch);
hud.on('#turn-start', startCountdown);
hud.on('#pause-button', togglePause);
hud.on('#resume-button', togglePause);
hud.on('#exit-button', goToSetup);
hud.on('#replay-button', () => startMatch(settings));
hud.on('#settings-button', goToSetup);
