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
let chargeStartedAt = null; // momento in cui è iniziata la carica del lanciatore

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
    // Fase 1: gioco libero, la pallina riappare nel lanciatore
    elements.message.textContent = 'Pallina persa';
    setTimeout(() => physics.spawnBall(), 800);
  }
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

  renderer.draw(physics.getSnapshot(), { charge: currentCharge() });
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
  window.pinballDebug = { physics, input, PHYSICS, layout };
}

physics.spawnBall();
input.setEnabled(true);
requestAnimationFrame(frame);
