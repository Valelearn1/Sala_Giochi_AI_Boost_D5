/*
 * PUNTO DI INGRESSO
 *
 * Collega fisica, disegno e input, e fa girare il ciclo di gioco:
 * a ogni fotogramma la fisica avanza a passi fissi (sempre uguali,
 * qualunque sia la velocità dello schermo), poi si ridisegna il tavolo.
 */

import * as layout from './config/table-layout.js';
import { PHYSICS } from './config/physics-config.js';
import { THEME } from './config/theme.js';
import { RULES } from './config/rules-config.js';
import { createBallState, applyHit, endOfBallBonus } from './rules.js';
import { createPhysics } from './physics.js';
import { createRenderer } from './render.js';
import { createInput } from './input.js';

const elements = {
  canvas: document.querySelector('#table'),
  tableWrap: document.querySelector('#table-wrap'),
  launchButton: document.querySelector('#launch-button'),
  pauseButton: document.querySelector('#pause-button'),
  message: document.querySelector('#message'),
};

const physics = createPhysics({ layout, config: PHYSICS, onEvent: handlePhysicsEvent });
const renderer = createRenderer({ canvas: elements.canvas, layout, theme: THEME });

let paused = false;
let ballState = newBallState(); // regole della pallina in gioco
let score = 0; // fase 2: un solo punteggio, i giocatori arrivano nella fase 3
let chargeStartedAt = null; // momento in cui è iniziata la carica del lanciatore

function newBallState() {
  return createBallState({ laneCount: layout.TOP_LANES.length, targetCount: layout.TARGETS.length });
}

const input = createInput({
  touchArea: elements.tableWrap,
  launchButton: elements.launchButton,
  pauseButton: elements.pauseButton,
  onLaunchStart: () => {
    chargeStartedAt = performance.now();
  },
  onLaunchRelease: () => {
    physics.launch(currentCharge());
    chargeStartedAt = null;
  },
  onPause: togglePause,
});

/** Carica del lanciatore da 0 a 1, in base a quanto tempo è stato tenuto premuto. */
function currentCharge() {
  if (chargeStartedAt === null) return 0;
  return Math.min(1, (performance.now() - chargeStartedAt) / PHYSICS.plungerChargeMs);
}

function handlePhysicsEvent(event) {
  if (event.type === 'drain') {
    const { bonus } = endOfBallBonus(ballState, RULES);
    score += bonus;
    showMessage(`Pallina persa · bonus ${bonus} · totale ${score}`);
    ballState = newBallState(); // il moltiplicatore si azzera
    physics.resetTargets();
    setTimeout(() => physics.spawnBall(), 800);
    return;
  }

  // Un elemento colpito: punti, lampeggio ed eventuale messaggio
  const result = applyHit(ballState, event, RULES);
  score += result.points;
  renderer.flash(event.type, event.id);
  if (result.resetTargets) {
    setTimeout(() => physics.resetTargets(), RULES.targetResetMs);
  }
  showMessage(result.message ?? `${score} punti · ×${ballState.multiplier}`);
}

function showMessage(text) {
  elements.message.textContent = text;
}

function togglePause() {
  paused = !paused;
  elements.message.textContent = paused ? 'Pausa' : '';
  input.setEnabled(!paused);
}

// --- Ciclo di gioco a passo fisso -------------------------------------------

let lastTime = performance.now();
let accumulator = 0;

function frame(now) {
  const elapsed = Math.min(now - lastTime, PHYSICS.maxFrameMs);
  lastTime = now;

  if (!paused) {
    accumulator += elapsed;
    while (accumulator >= PHYSICS.stepMs) {
      physics.step(input.controls);
      accumulator -= PHYSICS.stepMs;
    }
  }

  renderer.draw(physics.getSnapshot(), { charge: currentCharge(), lanesLit: ballState.lanesLit });
  requestAnimationFrame(frame);
}

// --- Dimensioni del canvas ---------------------------------------------------

function fitTable() {
  const box = elements.tableWrap.getBoundingClientRect();
  renderer.resize(window.innerWidth - 32 - 276, box.height);
}

new ResizeObserver(fitTable).observe(elements.tableWrap);
fitTable();

// La pagina nascosta (altra scheda) mette in pausa da sola
document.addEventListener('visibilitychange', () => {
  if (document.hidden && !paused) togglePause();
});

// Con "?debug" nell'indirizzo, fisica e comandi sono raggiungibili dalla console del browser
if (new URLSearchParams(location.search).has('debug')) {
  window.pinballDebug = { physics, input, PHYSICS, layout, getScore: () => score, getBallState: () => ballState };
}

physics.spawnBall();
input.setEnabled(true);
requestAnimationFrame(frame);
