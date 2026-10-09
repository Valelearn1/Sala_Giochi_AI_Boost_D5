/*
 * PANNELLO (HUD) E SCHERMATE
 *
 * Tutto ciò che è HTML: impostazioni, pannello dei punteggi, messaggi,
 * sovrapposizioni ("Tocca a…", pausa) e classifica finale.
 * Riceve lo stato della partita da turns.js e lo mostra, senza cambiarlo.
 */

import { getCurrentPlayer, getBallNumber, getRanking, getWinners } from './turns.js';

const $ = (selector) => document.querySelector(selector);

const elements = {
  screens: { setup: $('#setup-screen'), game: $('#game-screen'), results: $('#results-screen') },
  setupForm: $('#setup-form'),
  nameFields: document.querySelectorAll('.name-field'),
  player: $('#hud-player'),
  ball: $('#hud-ball'),
  multiplier: $('#hud-multiplier'),
  scores: $('#hud-scores'),
  message: $('#message'),
  hud: $('#hud'),
  turnOverlay: $('#turn-overlay'),
  turnTitle: $('#turn-title'),
  turnBall: $('#turn-ball'),
  turnBonus: $('#turn-bonus'),
  turnStart: $('#turn-start'),
  pauseOverlay: $('#pause-overlay'),
  resumeButton: $('#resume-button'),
  exitButton: $('#exit-button'),
  resultsTitle: $('#results-title'),
  resultsSummary: $('#results-summary'),
  ranking: $('#ranking'),
  replayButton: $('#replay-button'),
  settingsButton: $('#settings-button'),
};

const MESSAGE_MS = 2200;
let messageTimer = null;

// --- Schermate ---------------------------------------------------------------

export function showScreen(name) {
  for (const [screenName, screen] of Object.entries(elements.screens)) {
    screen.hidden = screenName !== name;
  }
}

// --- Impostazioni --------------------------------------------------------------

export function updateNameFields(playerCount) {
  elements.nameFields.forEach((field, index) => {
    field.hidden = index >= playerCount;
  });
}

/** Legge le impostazioni; i nomi vuoti diventano "Giocatore 1", "Giocatore 2"… */
export function readSettings() {
  const data = new FormData(elements.setupForm);
  const playerCount = Number(data.get('player-count'));
  const names = data.getAll('player-name').slice(0, playerCount);
  return { playerNames: names.map((name, index) => name.trim() || `Giocatore ${index + 1}`) };
}

// --- Pannello di gioco -------------------------------------------------------

/** Aggiorna giocatore di turno, pallina, moltiplicatore e punteggi. */
export function renderHud(match, multiplier) {
  const current = getCurrentPlayer(match);
  elements.hud.dataset.player = match.currentPlayerIndex;
  elements.player.textContent = current.name;
  elements.ball.textContent = `Pallina ${getBallNumber(match)}/${match.ballsPerPlayer}`;
  elements.multiplier.textContent = `×${multiplier}`;

  const items = match.players.map((player, index) => {
    const item = document.createElement('li');
    item.className = 'hud-score';
    item.dataset.player = index;
    item.classList.toggle('is-current', index === match.currentPlayerIndex);
    if (index === match.currentPlayerIndex) item.setAttribute('aria-current', 'true');
    item.innerHTML = '<span class="player-dot" aria-hidden="true"></span><span class="hud-score-name"></span><strong class="hud-score-points"></strong>';
    // textContent per i nomi: un nome come "<b>" non diventa HTML
    item.querySelector('.hud-score-name').textContent = player.name;
    item.querySelector('.hud-score-points').textContent = formatScore(player.score);
    return item;
  });
  elements.scores.replaceChildren(...items);
}

/** Riga dei messaggi (es. "Bonus bersagli!"). Con `sticky` resta finché non arriva il prossimo. */
export function showMessage(text, { sticky = false } = {}) {
  clearTimeout(messageTimer);
  elements.message.textContent = text;
  if (!sticky) {
    messageTimer = setTimeout(() => {
      elements.message.textContent = '';
    }, MESSAGE_MS);
  }
}

/** 12345 → "12.345" (separatore delle migliaia all'italiana). */
export function formatScore(points) {
  return points.toLocaleString('it-IT');
}

// --- Sovrapposizioni ---------------------------------------------------------

/** "Tocca a Giulia – premi per lanciare": così si capisce quando passare il dispositivo. */
export function showTurnOverlay({ match, lastBall }) {
  const player = getCurrentPlayer(match);
  elements.turnOverlay.dataset.player = match.currentPlayerIndex;
  elements.turnTitle.textContent = `Tocca a ${player.name}`;
  elements.turnBall.textContent = `Pallina ${getBallNumber(match)} di ${match.ballsPerPlayer}`;
  elements.turnBonus.textContent = lastBall
    ? `${lastBall.name}: bonus fine pallina +${formatScore(lastBall.bonus)}`
    : '';
  elements.turnOverlay.hidden = false;
  elements.turnStart.focus();
}

export function hideTurnOverlay() {
  elements.turnOverlay.hidden = true;
}

export function showPauseOverlay() {
  elements.pauseOverlay.hidden = false;
  elements.resumeButton.focus();
}

export function hidePauseOverlay() {
  elements.pauseOverlay.hidden = true;
}

// --- Classifica ----------------------------------------------------------------

export function renderResults(match) {
  const winners = getWinners(match);
  const isTie = winners.length > 1;

  elements.resultsTitle.textContent = isTie ? 'Pareggio!' : `Vince ${winners[0].name}!`;
  elements.resultsSummary.textContent = isTie
    ? `${formatNameList(winners.map((player) => player.name))} a pari merito con ${formatScore(winners[0].score)} punti`
    : `${formatScore(winners[0].score)} punti in ${match.ballsPerPlayer} palline`;

  const items = getRanking(match).map((entry) => {
    const item = document.createElement('li');
    item.className = 'ranking-item';
    item.dataset.player = entry.playerIndex;
    item.classList.toggle('is-winner', entry.rank === 1);
    item.innerHTML = `<span class="ranking-rank">${entry.rank}°</span><span class="player-dot" aria-hidden="true"></span><span class="ranking-name"></span><strong class="ranking-score">${formatScore(entry.score)}</strong>`;
    item.querySelector('.ranking-name').textContent = entry.name;
    return item;
  });
  elements.ranking.replaceChildren(...items);
  elements.resultsTitle.focus();
}

/** ['Anna', 'Bruno', 'Carla'] → "Anna, Bruno e Carla" */
function formatNameList(names) {
  if (names.length === 1) return names[0];
  return `${names.slice(0, -1).join(', ')} e ${names.at(-1)}`;
}

// --- Eventi dei pulsanti -----------------------------------------------------

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

export function onTurnStart(handler) {
  elements.turnStart.addEventListener('click', handler);
  // Anche un tocco in qualsiasi punto della sovrapposizione va bene
  elements.turnOverlay.addEventListener('click', (event) => {
    if (event.target === elements.turnOverlay) handler();
  });
}

export function onResume(handler) {
  elements.resumeButton.addEventListener('click', handler);
}

export function onExit(handler) {
  elements.exitButton.addEventListener('click', handler);
}

export function onReplay(handler) {
  elements.replayButton.addEventListener('click', handler);
}

export function onChangeSettings(handler) {
  elements.settingsButton.addEventListener('click', handler);
}
