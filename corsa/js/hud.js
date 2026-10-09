/*
 * PANNELLO E SCHERMATE (tutto ciò che è HTML)
 * Impostazioni, pannello della corsa, "Tocca a…", conto alla rovescia, pausa, classifica.
 */

import { formatTime } from './race.js';
import { getCurrentPlayer, getRanking, getWinners } from './turns.js';

const $ = (selector) => document.querySelector(selector);

const elements = {
  screens: { setup: $('#setup-screen'), game: $('#game-screen'), results: $('#results-screen') },
  setupForm: $('#setup-form'),
  nameFields: document.querySelectorAll('.name-field'),
  player: $('#hud-player'),
  lap: $('#hud-lap'),
  time: $('#hud-time'),
  best: $('#hud-best'),
  message: $('#message'),
  hud: $('#hud'),
  turnOverlay: $('#turn-overlay'),
  turnTitle: $('#turn-title'),
  turnNote: $('#turn-note'),
  turnStart: $('#turn-start'),
  countdown: $('#countdown'),
  pauseOverlay: $('#pause-overlay'),
  resumeButton: $('#resume-button'),
  resultsTitle: $('#results-title'),
  resultsSummary: $('#results-summary'),
  record: $('#results-record'),
  ranking: $('#ranking'),
};

// --- Schermate (con dissolvenza dove il browser la supporta) -----------------

let screenReady = Promise.resolve();

export function showScreen(name) {
  const update = () => {
    for (const [screenName, screen] of Object.entries(elements.screens)) screen.hidden = screenName !== name;
  };
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!document.startViewTransition || reduceMotion || document.hidden) {
    update();
    screenReady = Promise.resolve();
  } else {
    screenReady = document.startViewTransition(update).updateCallbackDone.catch(() => {});
  }
}

/** Esegue `action` quando la schermata nuova è visibile (es. per spostare il focus). */
export function afterScreenChange(action) {
  screenReady.then(action);
}

// --- Impostazioni ----------------------------------------------------------

/** "Giocatore" nella classica e nei Simpson, "Mago" nella versione anime. */
function playerWord() {
  return window.SalaTema?.get() === 'anime' ? 'Mago' : 'Giocatore';
}

function updatePlaceholders() {
  document.querySelectorAll('input[name="player-name"]').forEach((input, index) => {
    input.placeholder = `${playerWord()} ${index + 1}`;
  });
}
updatePlaceholders();
window.addEventListener('sala-tema', updatePlaceholders);

export function updateNameFields(playerCount) {
  elements.nameFields.forEach((field, index) => {
    field.hidden = index >= playerCount;
  });
}

export function readSettings() {
  const data = new FormData(elements.setupForm);
  const playerCount = Number(data.get('player-count'));
  const names = data.getAll('player-name').slice(0, playerCount);
  return { playerNames: names.map((name, index) => name.trim() || `${playerWord()} ${index + 1}`) };
}

// --- Pannello della corsa ----------------------------------------------------

export function renderHud({ match, race, timeMs }) {
  elements.hud.dataset.player = match.currentPlayerIndex;
  elements.player.textContent = getCurrentPlayer(match).name;
  elements.lap.textContent = `${race.lap}/${race.laps}`;
  elements.time.textContent = formatTime(timeMs);
  const best = race.lapTimes.length ? Math.min(...race.lapTimes) : null;
  elements.best.textContent = best === null ? '–' : formatTime(best);
}

let messageTimer = null;
/** Messaggio breve sotto il pannello (letto anche dagli screen reader). */
export function showMessage(text, { sticky = false } = {}) {
  clearTimeout(messageTimer);
  elements.message.textContent = text;
  if (!sticky) messageTimer = setTimeout(() => (elements.message.textContent = ''), 2200);
}

// --- Sovrapposizioni ---------------------------------------------------------

export function showTurnOverlay(match) {
  const player = getCurrentPlayer(match);
  elements.turnOverlay.dataset.player = match.currentPlayerIndex;
  elements.turnTitle.textContent = `Tocca a ${player.name}`;
  elements.turnNote.textContent = match.players.length > 1 ? `Corsa ${match.currentPlayerIndex + 1} di ${match.players.length}` : '';
  elements.turnOverlay.hidden = false;
  afterScreenChange(() => elements.turnStart.focus());
}

export function hideTurnOverlay() {
  elements.turnOverlay.hidden = true;
}

/** Il numero grande del conto alla rovescia ("3", "2", "1", "VIA!"); null lo nasconde. */
export function showCountdown(text) {
  elements.countdown.hidden = text === null;
  if (text === null) return;
  elements.countdown.textContent = text;
  // Per far ripartire l'animazione del numero
  elements.countdown.classList.remove('is-pop');
  void elements.countdown.offsetWidth;
  elements.countdown.classList.add('is-pop');
}

export function showPauseOverlay() {
  elements.pauseOverlay.hidden = false;
  elements.resumeButton.focus();
}

export function hidePauseOverlay() {
  elements.pauseOverlay.hidden = true;
}

// --- Classifica ----------------------------------------------------------------

export function renderResults(match, record = null) {
  const winners = getWinners(match);
  const names = new Intl.ListFormat('it', { type: 'conjunction' }).format(winners.map((player) => player.name));
  elements.resultsTitle.textContent = winners.length > 1 ? 'Pareggio!' : `Vince ${winners[0].name}!`;
  elements.resultsSummary.textContent = winners.length > 1
    ? `${names} a pari tempo: ${formatTime(winners[0].totalTime)}`
    : `${formatTime(winners[0].totalTime)} per tre giri`;

  elements.record.hidden = !record?.best;
  if (record?.best) {
    elements.record.classList.toggle('is-new', record.isNew);
    elements.record.textContent = record.isNew
      ? `🏆 Nuovo record del dispositivo: ${formatTime(record.best.totalTime)}`
      : `Record del dispositivo: ${formatTime(record.best.totalTime)} · ${record.best.name}`;
  }

  elements.ranking.replaceChildren(...getRanking(match).map((entry) => {
    const item = document.createElement('li');
    item.className = 'ranking-item';
    item.dataset.player = entry.playerIndex;
    item.classList.toggle('is-winner', entry.rank === 1);
    item.innerHTML = `
      <span class="ranking-rank">${entry.rank}°</span>
      <span class="player-dot" aria-hidden="true"></span>
      <span class="ranking-who"><span class="ranking-name"></span><span class="ranking-best"></span></span>
      <strong class="ranking-score">${formatTime(entry.totalTime)}</strong>`;
    item.querySelector('.ranking-name').textContent = entry.name;
    item.querySelector('.ranking-best').textContent = `giro migliore ${formatTime(entry.bestLap)}`;
    return item;
  }));
  afterScreenChange(() => elements.resultsTitle.focus());
}

// --- Pulsanti --------------------------------------------------------------------

export function onSetupSubmit(handler) {
  elements.setupForm.addEventListener('submit', (event) => {
    event.preventDefault();
    handler(readSettings());
  });
}

export function onPlayerCountChange(handler) {
  elements.setupForm.addEventListener('change', (event) => {
    if (event.target.name === 'player-count') handler(Number(event.target.value));
  });
}

export const on = (selector, handler) => $(selector).addEventListener('click', handler);
