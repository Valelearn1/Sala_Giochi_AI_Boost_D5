/*
 * PROVA: flipper spaziale ispirato a 3D Pinball Space Cadet
 *
 * Usa lo stesso motore del flipper della sala (fisica, disegno, comandi e
 * regole), con una disposizione diversa (layout-spazio.js) e un tema spaziale.
 * Lo sfondo (stelle, nebulose, rosa di luci, stella viola) è disegnato una
 * volta sola su un canvas separato, sotto quello del gioco.
 * Gioco libero: niente turni, la pallina riappare quando cade.
 */

import * as layout from './layout-spazio.js';
import { PHYSICS } from '../../pinball/js/config/physics-config.js';
import { RULES } from '../../pinball/js/config/rules-config.js';
import { createPhysics } from '../../pinball/js/physics.js';
import { createRenderer } from '../../pinball/js/render.js';
import { createInput } from '../../pinball/js/input.js';
import { createBallState, applyHit } from '../../pinball/js/rules.js';

/** Tema spaziale: sfondo trasparente (c'è il canvas dello sfondo sotto), binari rossi e metallo. */
const THEME_SPAZIO = {
  tableName: 'Missione Spazio',
  bumperStyle: 'mushroom', // dischi bianchi e blu, come i bumper di Space Cadet
  decor: 'none',
  particleColor: '200, 215, 255', // stelle che brillano
  colors: {
    abyssTop: 'rgba(0, 0, 0, 0)',
    abyssBottom: 'rgba(0, 0, 0, 0)',
    light: '120, 140, 255',
    wall: '#4a4f6b',
    wallEdge: '#e0443a', // binari rossi
    flipperLeft: '#e8e8f2',
    flipperRight: '#e8e8f2',
    flipperEdge: '#e0443a',
    ball: '#c9cede',
    ballCore: '#ffffff',
    ballRim: '#5d6378',
    ballGlow: 'rgba(255, 255, 255, 0.45)',
    plunger: '#8a8fa8',
    gate: '#e0443a',
    bumper: '#1e40c8',
    bumperLight: '#ffffff',
    bumperDark: '#0a1a5c',
    bumperGlow: 'rgba(120, 160, 255, 0.5)',
    slingshot: '#7fd7ff', // fulmini azzurri
    slingshotFillA: '#2a1458',
    slingshotFillB: '#4b2a8c',
    target: '#ffe14d',
    targetDown: '#2a3270',
    laneOff: '#2a3270',
    laneOn: '#ffe14d',
    outlane: '#ff6b5a',
    post: '#ffe14d',
    paint: 'rgba(255, 255, 255, 0.1)',
  },
};

const elements = {
  table: document.querySelector('#table'),
  sfondo: document.querySelector('#sfondo'),
  tableWrap: document.querySelector('#table-wrap'),
  launchButton: document.querySelector('#launch-button'),
  punti: document.querySelector('#punti'),
  messaggio: document.querySelector('#messaggio'),
};

let punti = 0;
let ballState = nuovaPallina();
let chargeStartedAt = null;

function nuovaPallina() {
  return createBallState({ laneCount: layout.TOP_LANES.length, targetCount: layout.TARGETS.length });
}

const physics = createPhysics({ layout, config: PHYSICS, onEvent: gestisciEvento });
const renderer = createRenderer({ canvas: elements.table, layout, theme: THEME_SPAZIO });
const input = createInput({
  touchArea: elements.tableWrap,
  launchButton: elements.launchButton,
  onLaunchStart: () => {
    chargeStartedAt = performance.now();
  },
  onLaunchRelease: () => {
    physics.launch(carica());
    chargeStartedAt = null;
  },
  onPause: () => {},
});

function carica() {
  return chargeStartedAt === null ? 0 : Math.min(1, (performance.now() - chargeStartedAt) / PHYSICS.plungerChargeMs);
}

function gestisciEvento(evento) {
  if (evento.type === 'drain') {
    mostra('Pallina persa: eccone un\'altra');
    ballState = nuovaPallina();
    physics.resetTargets();
    setTimeout(() => physics.spawnBall(), 800);
    return;
  }
  const risultato = applyHit(ballState, evento, RULES);
  punti += risultato.points;
  elements.punti.textContent = punti.toLocaleString('it-IT');
  renderer.flash(evento.type, evento.id);
  if (risultato.resetTargets) setTimeout(() => physics.resetTargets(), RULES.targetResetMs);
  if (risultato.message) mostra(risultato.message);
}

function mostra(testo) {
  elements.messaggio.textContent = testo;
}

/* ========================================================================
   Sfondo spaziale (disegnato una volta, a ogni cambio di misura)
   ======================================================================== */

function disegnaSfondo(scala) {
  const canvas = elements.sfondo;
  const rapporto = window.devicePixelRatio || 1;
  canvas.width = Math.floor(layout.TABLE_WIDTH * scala * rapporto);
  canvas.height = Math.floor(layout.TABLE_HEIGHT * scala * rapporto);
  canvas.style.width = `${Math.floor(layout.TABLE_WIDTH * scala)}px`;
  canvas.style.height = `${Math.floor(layout.TABLE_HEIGHT * scala)}px`;
  const c = canvas.getContext('2d');
  c.setTransform(scala * rapporto, 0, 0, scala * rapporto, 0, 0);

  // Spazio profondo
  const fondo = c.createLinearGradient(0, 0, 0, layout.TABLE_HEIGHT);
  fondo.addColorStop(0, '#141a4a');
  fondo.addColorStop(1, '#070920');
  c.fillStyle = fondo;
  c.fillRect(0, 0, layout.TABLE_WIDTH, layout.TABLE_HEIGHT);

  // Nebulose
  for (const [x, y, r, colore] of [[470, 160, 220, '255, 120, 200'], [110, 420, 200, '90, 140, 255'], [300, 760, 260, '60, 200, 255']]) {
    const nebulosa = c.createRadialGradient(x, y, 0, x, y, r);
    nebulosa.addColorStop(0, `rgba(${colore}, 0.22)`);
    nebulosa.addColorStop(1, `rgba(${colore}, 0)`);
    c.fillStyle = nebulosa;
    c.fillRect(0, 0, layout.TABLE_WIDTH, layout.TABLE_HEIGHT);
  }

  // Stelle fisse (sempre nelle stesse posizioni)
  let seme = 11;
  const caso = () => (seme = (seme * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < 160; i++) {
    c.fillStyle = `rgba(255, 255, 255, ${0.25 + caso() * 0.6})`;
    c.fillRect(caso() * layout.TABLE_WIDTH, caso() * layout.TABLE_HEIGHT, 1.5, 1.5);
  }

  // Zona viola sotto la tasca dei bumper (l'"iperspazio")
  c.save();
  c.beginPath();
  c.roundRect(22, 528, 152, 150, 26);
  c.clip();
  c.fillStyle = 'rgba(140, 90, 230, 0.55)';
  c.fillRect(22, 528, 152, 150);
  c.strokeStyle = 'rgba(210, 180, 255, 0.35)';
  c.lineWidth = 8;
  for (let x = -150; x < 200; x += 28) {
    c.beginPath();
    c.moveTo(x, 690);
    c.lineTo(x + 150, 520);
    c.stroke();
  }
  c.restore();

  // Corsia curva a destra: binario metallico
  c.strokeStyle = 'rgba(160, 165, 190, 0.35)';
  c.lineWidth = 30;
  c.beginPath();
  c.arc(300, 300, 262, (300 * Math.PI) / 180, (345 * Math.PI) / 180);
  c.stroke();

  // Rosa di luci al centro: anello esterno blu, anello interno arancio, pozzo azzurro
  const centro = { x: 276, y: 720 };
  const pozzo = c.createRadialGradient(centro.x, centro.y, 4, centro.x, centro.y, 58);
  pozzo.addColorStop(0, '#9ff3ff');
  pozzo.addColorStop(0.5, '#2a8fd6');
  pozzo.addColorStop(1, 'rgba(20, 40, 120, 0)');
  c.fillStyle = pozzo;
  c.beginPath();
  c.arc(centro.x, centro.y, 58, 0, Math.PI * 2);
  c.fill();
  luciInCerchio(c, centro, 96, 18, '#2747d8', 7);
  luciInCerchio(c, centro, 66, 12, '#ff8a2a', 6);
  c.fillStyle = '#d61f2a';
  c.beginPath();
  c.arc(centro.x, centro.y, 6, 0, Math.PI * 2);
  c.fill();

  // Stella viola tra le alette, con le punte verso l'alto
  c.save();
  c.translate(276, 1040);
  c.fillStyle = 'rgba(150, 70, 230, 0.75)';
  c.beginPath();
  const punte = 7;
  for (let i = 0; i <= punte * 2; i++) {
    const angolo = Math.PI + (i * Math.PI) / punte;
    const raggio = i % 2 === 0 ? 150 : 40;
    c.lineTo(Math.cos(angolo) * raggio, Math.sin(angolo) * raggio);
  }
  c.closePath();
  c.fill();
  c.restore();
}

/** Lampadine disposte in cerchio. */
function luciInCerchio(c, centro, raggio, quante, colore, misura) {
  for (let i = 0; i < quante; i++) {
    const angolo = (i / quante) * Math.PI * 2;
    c.fillStyle = colore;
    c.beginPath();
    c.arc(centro.x + Math.cos(angolo) * raggio, centro.y + Math.sin(angolo) * raggio, misura, 0, Math.PI * 2);
    c.fill();
  }
}

/* ========================================================================
   Ciclo di gioco e misure
   ======================================================================== */

let ultimoTempo = performance.now();
let accumulatore = 0;

function fotogramma(adesso) {
  const trascorso = Math.min(adesso - ultimoTempo, PHYSICS.maxFrameMs);
  ultimoTempo = adesso;
  accumulatore += trascorso;
  while (accumulatore >= PHYSICS.stepMs) {
    physics.step(input.controls);
    accumulatore -= PHYSICS.stepMs;
  }
  renderer.draw(physics.getSnapshot(), { charge: carica(), lanesLit: ballState.lanesLit });
  requestAnimationFrame(fotogramma);
}

function adatta() {
  const box = elements.tableWrap.getBoundingClientRect();
  if (box.width === 0 || box.height === 0) return;
  renderer.resize(box.width, box.height);
  disegnaSfondo(Math.min(box.width / layout.TABLE_WIDTH, box.height / layout.TABLE_HEIGHT));
}

new ResizeObserver(adatta).observe(elements.tableWrap);
adatta();

if (new URLSearchParams(location.search).has('debug')) {
  window.pinballDebug = { physics, layout, PHYSICS };
}

physics.spawnBall();
input.setEnabled(true);
requestAnimationFrame(fotogramma);
