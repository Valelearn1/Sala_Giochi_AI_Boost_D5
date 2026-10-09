/*
 * PUNTO DI INGRESSO
 *
 * Collega fisica, regole, turni, disegno, pannello e input, e fa girare
 * il ciclo di gioco: a ogni fotogramma la fisica avanza a passi fissi
 * (sempre uguali, qualunque sia la velocità dello schermo), poi si ridisegna.
 *
 * La partita passa da una fase all'altra così:
 *
 *   setup → turn ("Tocca a…") → playing ⇄ paused
 *                ↑                 │ pallina persa
 *                └──── between ◄───┘ → results (quando le palline sono finite)
 */

import * as layout from './config/table-layout.js';
import { PHYSICS } from './config/physics-config.js';
import { RULES } from './config/rules-config.js';
import { getTheme } from './config/theme.js';
import { createPhysics } from './physics.js';
import { createBallState, applyHit, endOfBallBonus } from './rules.js';
import { createMatch, getCurrentPlayer, addPoints, endBall } from './turns.js';
import { createRenderer } from './render.js';
import { createInput } from './input.js';
import * as hud from './hud.js';
import * as sound from '../../assets/suoni.js';

/** Pausa dopo la pallina persa, prima della schermata "Tocca a…". */
const BETWEEN_BALLS_MS = 1400;

const elements = {
  canvas: document.querySelector('#table'),
  tableWrap: document.querySelector('#table-wrap'),
  launchButton: document.querySelector('#launch-button'),
  pauseButton: document.querySelector('#pause-button'),
  soundToggle: document.querySelector('#sound-toggle'),
};

let phase = 'setup';
let settings = null; // ultime impostazioni, per "Rigioca"
let match = null; // giocatori e punteggi (turns.js)
let ballState = null; // regole della pallina in gioco (rules.js)
let chargeStartedAt = null; // inizio della carica del lanciatore
let betweenTimer = null;
let launchedAt = null; // quando è partita la pallina (per il salvataggio)
let ballSaveUsed = false; // il salvataggio vale una volta per pallina

const physics = createPhysics({ layout, config: PHYSICS, onEvent: handlePhysicsEvent });
// Il tema del tavolo segue la versione della sala (classica = abissi, anime = grimori)
// Il tema del tavolo segue versione (classica/anime) e modalità (chiara/scura)
const currentTableTheme = () => getTheme(window.SalaTema?.get(), window.SalaTema?.getMode());
const renderer = createRenderer({ canvas: elements.canvas, layout, theme: currentTableTheme() });
// Cambiando versione o modalità chiara/scura, il tavolo si ridisegna con il tema giusto
window.addEventListener('sala-tema', () => renderer.setTheme(currentTableTheme()));
window.addEventListener('sala-modo', () => renderer.setTheme(currentTableTheme()));
const input = createInput({
  touchArea: elements.tableWrap,
  launchButton: elements.launchButton,
  pauseButton: elements.pauseButton,
  flipperButtons: document.querySelectorAll('[data-flipper]'),
  onLaunchStart: () => {
    chargeStartedAt = performance.now();
  },
  onLaunchRelease: () => {
    if (phase === 'playing' && physics.launch(currentCharge())) {
      launchedAt = performance.now();
      sound.play('launch');
      if (!ballSaveUsed) hud.showMessage(`Pallina salvata per ${RULES.ballSaveMs / 1000} secondi`);
    }
    chargeStartedAt = null;
  },
  onPause: togglePause,
});

// --- Flusso della partita ------------------------------------------------------

function startMatch(newSettings) {
  clearTimeout(betweenTimer);
  settings = newSettings;
  match = createMatch({ playerNames: settings.playerNames, ballsPerPlayer: RULES.ballsPerPlayer });
  hud.hidePauseOverlay();
  hud.showScreen('game');
  fitTable();
  beginTurn(null);
}

/** Mostra "Tocca a [nome]" e prepara il tavolo per la pallina nuova. */
function beginTurn(lastBall) {
  phase = 'turn';
  input.setEnabled(false);
  physics.removeBall();
  physics.resetTargets();
  ballState = createBallState({ laneCount: layout.TOP_LANES.length, targetCount: layout.TARGETS.length });
  launchedAt = null;
  ballSaveUsed = false;
  hud.renderHud(match, ballState.multiplier);
  hud.showMessage('', { sticky: true });
  hud.showTurnOverlay({ match, lastBall });
  sound.play('turn');
}

/** Il giocatore ha premuto "Premi per lanciare": la pallina appare sul pistone. */
function startBall() {
  if (phase !== 'turn') return;
  hud.hideTurnOverlay();
  physics.spawnBall();
  phase = 'playing';
  input.setEnabled(true);
  hud.showMessage('Tieni premuto Spazio (o Lancia) per caricare');
  sound.startMusic();
}

function handlePhysicsEvent(event) {
  if (phase !== 'playing') return;

  if (event.type === 'drain') {
    if (isBallSaveActive()) {
      saveBall();
    } else {
      loseBall();
    }
    return;
  }

  const result = applyHit(ballState, event, RULES);
  addPoints(match, result.points);
  renderer.flash(event.type, event.id);
  playHitSound(event, result);
  if (result.resetTargets) {
    setTimeout(() => physics.resetTargets(), RULES.targetResetMs);
  }
  if (result.message) hud.showMessage(result.message);
  hud.renderHud(match, ballState.multiplier);
}

/** Il suono giusto per ogni urto: le missioni completate hanno un suono speciale. */
function playHitSound(event, result) {
  if (result.resetTargets) sound.play('targetBank');
  else if (result.multiplierUp) sound.play('multiplier');
  else if (result.points > 0) sound.play(event.type); // 'bumper', 'slingshot', 'target', 'lane', 'outlane'
}

/** Vero se la pallina è caduta da poco dopo il lancio e il salvataggio non è ancora stato usato. */
function isBallSaveActive() {
  return launchedAt !== null && !ballSaveUsed && performance.now() - launchedAt < RULES.ballSaveMs;
}

/** Pallina salvata: torna sul lanciatore, stesso giocatore, nessuna pallina persa. */
function saveBall() {
  ballSaveUsed = true;
  launchedAt = null;
  physics.spawnBall();
  hud.showMessage('Pallina salvata! Rilanciala');
  sound.play('ballSave');
}

/** Pallina persa: bonus di fine pallina, poi tocca al prossimo (o fine partita). */
function loseBall() {
  phase = 'between';
  input.setEnabled(false);

  const player = getCurrentPlayer(match);
  const { bonus } = endOfBallBonus(ballState, RULES);
  addPoints(match, bonus);
  const lastBall = { name: player.name, bonus };
  hud.renderHud(match, 1); // il moltiplicatore si azzera con la pallina persa
  hud.showMessage(`Pallina persa · bonus +${hud.formatScore(bonus)}`, { sticky: true });
  sound.play('drain');

  const { finished } = endBall(match);
  betweenTimer = setTimeout(() => (finished ? showResults() : beginTurn(lastBall)), BETWEEN_BALLS_MS);
}

function showResults() {
  phase = 'results';
  hud.showScreen('results');
  hud.renderResults(match);
  sound.stopMusic();
  sound.play('fanfare');
}

function goToSetup() {
  clearTimeout(betweenTimer);
  phase = 'setup';
  input.setEnabled(false);
  physics.removeBall();
  hud.hidePauseOverlay();
  hud.hideTurnOverlay();
  hud.showScreen('setup');
  sound.stopMusic();
}

function togglePause() {
  if (phase === 'playing') {
    phase = 'paused';
    input.setEnabled(false);
    hud.showPauseOverlay();
    sound.stopMusic();
  } else if (phase === 'paused') {
    hud.hidePauseOverlay();
    phase = 'playing';
    input.setEnabled(true);
    sound.startMusic();
  }
}

/** Carica del lanciatore da 0 a 1, in base a quanto è stato tenuto premuto. */
function currentCharge() {
  if (chargeStartedAt === null) return 0;
  return Math.min(1, (performance.now() - chargeStartedAt) / PHYSICS.plungerChargeMs);
}

// --- Ciclo di gioco a passo fisso -------------------------------------------

let lastTime = performance.now();
let accumulator = 0;
const flippersBefore = { left: false, right: false }; // per sentire il "clic" solo quando un'aletta parte

function frame(now) {
  const elapsed = Math.min(now - lastTime, PHYSICS.maxFrameMs);
  lastTime = now;

  // La fisica avanza solo in partita (e subito dopo la pallina persa)
  if (phase === 'playing') {
    for (const side of ['left', 'right']) {
      if (input.controls[side] && !flippersBefore[side]) sound.play('flipper');
      flippersBefore[side] = input.controls[side];
    }
  }

  if (phase === 'playing' || phase === 'between') {
    accumulator += elapsed;
    while (accumulator >= PHYSICS.stepMs) {
      physics.step(input.controls);
      accumulator -= PHYSICS.stepMs;
    }
  } else {
    accumulator = 0;
  }

  if (phase !== 'setup' && phase !== 'results') {
    renderer.draw(physics.getSnapshot(), {
      charge: currentCharge(),
      lanesLit: ballState?.lanesLit ?? [],
    });
  }
  requestAnimationFrame(frame);
}

// --- Dimensioni del canvas ---------------------------------------------------

function fitTable() {
  const box = elements.tableWrap.getBoundingClientRect();
  if (box.width > 0 && box.height > 0) renderer.resize(box.width, box.height);
}

new ResizeObserver(fitTable).observe(elements.tableWrap);

// Pagina nascosta (altra scheda, telefono bloccato): pausa automatica
document.addEventListener('visibilitychange', () => {
  if (document.hidden && phase === 'playing') togglePause();
});

// --- Audio -----------------------------------------------------------------------

/** Mostra sul pulsante se l'audio è acceso. */
function renderSoundToggle() {
  elements.soundToggle.setAttribute('aria-pressed', String(sound.isSoundOn()));
}

elements.soundToggle.addEventListener('click', () => {
  sound.setSoundOn(!sound.isSoundOn());
  renderSoundToggle();
  if (sound.isSoundOn()) {
    sound.play('toggleOn');
    if (phase === 'playing') sound.startMusic();
  }
});
renderSoundToggle();

// --- Collegamento dei pulsanti ---------------------------------------------------

hud.updateNameFields(hud.readSettings().playerNames.length);
hud.onPlayerCountChange(hud.updateNameFields);
hud.onSetupSubmit(startMatch);
hud.onTurnStart(startBall);
hud.onResume(togglePause);
hud.onExit(goToSetup);
hud.onReplay(() => startMatch(settings));
hud.onChangeSettings(goToSetup);

// Con "?debug" nell'indirizzo, lo stato è raggiungibile dalla console del browser
if (new URLSearchParams(location.search).has('debug')) {
  window.pinballDebug = {
    physics,
    input,
    PHYSICS,
    layout,
    getMatch: () => match,
    getPhase: () => phase,
    getBallState: () => ballState,
  };
}

requestAnimationFrame(frame);
