/*
 * INTERFACCIA
 *
 * Tutto ciò che legge o modifica la pagina HTML sta qui.
 * Queste funzioni NON cambiano le regole del gioco: ricevono lo stato
 * della partita (creato da game.js) e lo mostrano.
 */

import { DIFFICULTIES } from './cards.js';
import { getRanking, getWinners } from './game.js';
import { icona } from '../../assets/icone.js';

/** Punteggi mostrati l'ultima volta: servono per animare quello che sale. */
let previousScores = [];

/** Riferimenti agli elementi della pagina, cercati una volta sola. */
const elements = {
  screens: {
    setup: document.querySelector('#setup-screen'),
    game: document.querySelector('#game-screen'),
    results: document.querySelector('#results-screen'),
  },
  setupForm: document.querySelector('#setup-form'),
  nameFields: document.querySelectorAll('.name-field'),
  board: document.querySelector('#board'),
  scoreboard: document.querySelector('#scoreboard'),
  movesCount: document.querySelector('#moves-count'),
  // Versione anime: copie delle mosse e delle coppie nell'intestazione del tavolo
  movesMirror: document.querySelector('[data-mosse]'),
  pairsCount: document.querySelector('[data-coppie]'),
  participants: document.querySelector('[data-partecipanti]'),
  status: document.querySelector('#status'),
  turnBanner: document.querySelector('#turn-banner'),
  resultsTitle: document.querySelector('#results-title'),
  resultsSummary: document.querySelector('#results-summary'),
  ranking: document.querySelector('#ranking'),
  challengers: document.querySelector('[data-sfidanti]'),
  stats: {
    time: document.querySelector('[data-statistica="tempo"]'),
    moves: document.querySelector('[data-statistica="mosse"]'),
    accuracy: document.querySelector('[data-statistica="precisione"]'),
  },
  quitButton: document.querySelector('#quit-button'),
  soundToggle: document.querySelector('#sound-toggle'),
  replayButton: document.querySelector('#replay-button'),
  settingsButton: document.querySelector('#settings-button'),
};

// --- Schermate ---------------------------------------------------------------

/** Mostra una sola schermata ('setup', 'game' o 'results') e nasconde le altre. */
export function showScreen(name) {
  for (const [screenName, screen] of Object.entries(elements.screens)) {
    screen.hidden = screenName !== name;
  }
}

// --- Impostazioni --------------------------------------------------------------

/** "Giocatore" nella versione classica, "Mago" in quella anime. */
function playerWord() {
  return window.SalaTema?.get() === 'anime' ? 'Mago' : 'Giocatore';
}

/** Suggerimento nei campi nome: "Giocatore 1" o "Mago 1", secondo la versione. */
function updatePlaceholders() {
  document.querySelectorAll('input[name="player-name"]').forEach((input, index) => {
    input.placeholder = `${playerWord()} ${index + 1}`;
  });
}
updatePlaceholders();
window.addEventListener('sala-tema', updatePlaceholders);

/** Mostra tanti campi "nome" quanti sono i giocatori scelti. */
export function updateNameFields(playerCount) {
  elements.nameFields.forEach((field, index) => {
    field.hidden = index >= playerCount;
  });
  elements.participants.textContent = `${playerCount} partecipanti`;
}

/**
 * Legge il modulo delle impostazioni.
 * I nomi lasciati vuoti diventano "Giocatore 1", "Giocatore 2", … ("Mago 1"… nella versione anime)
 */
export function readSettings() {
  const data = new FormData(elements.setupForm);
  const playerCount = Number(data.get('player-count'));
  const typedNames = data.getAll('player-name').slice(0, playerCount);

  return {
    difficulty: data.get('difficulty'),
    playerNames: typedNames.map((name, index) => name.trim() || `${playerWord()} ${index + 1}`),
  };
}

// --- Tavolo da gioco -----------------------------------------------------------

/**
 * Crea i bottoni delle carte per una nuova partita.
 * I bottoni vengono creati UNA volta sola: durante la partita cambiamo solo
 * le loro classi, così l'animazione CSS di rotazione può funzionare.
 */
export function createBoard(game, difficultyKey) {
  const { columns, rows } = DIFFICULTIES[difficultyKey];
  elements.screens.game.dataset.players = game.players.length;
  elements.board.style.setProperty('--columns', columns);
  elements.board.style.setProperty('--rows', rows);
  elements.board.replaceChildren(...game.cards.map(createCardButton));
  previousScores = [];
}

function createCardButton(card) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'card';
  button.dataset.cardId = card.id;
  button.innerHTML = `
    <span class="card-inner" aria-hidden="true">
      <span class="card-face card-back"></span>
      <span class="card-face card-front">
        <span class="card-picture"></span>
        <span class="card-name"></span>
      </span>
    </span>`;

  // Immagine del personaggio se c'è, altrimenti l'emoji
  const picture = button.querySelector('.card-picture');
  if (card.image) {
    const image = document.createElement('img');
    image.src = card.image;
    image.alt = '';
    image.className = 'card-portrait';
    picture.append(image);
  } else {
    picture.textContent = card.emoji;
  }
  button.querySelector('.card-name').textContent = card.name;
  return button;
}

/** Chiama `onCardClick(cardId)` quando si clicca (o si preme Invio/Spazio su) una carta. */
export function onCardClick(handler) {
  elements.board.addEventListener('click', (event) => {
    const button = event.target.closest('.card');
    if (button) {
      handler(Number(button.dataset.cardId));
    }
  });
}

/** Aggiorna tutto ciò che si vede durante la partita. */
export function renderGame(game) {
  renderCards(game);
  renderScoreboard(game);
  elements.movesCount.textContent = game.moves;
  elements.movesMirror.textContent = game.moves;
  const foundPairs = game.cards.filter((card) => card.isMatched).length / 2;
  elements.pairsCount.textContent = `${foundPairs}/${game.cards.length / 2}`;
}

function renderCards(game) {
  for (const card of game.cards) {
    const button = elements.board.querySelector(`[data-card-id="${card.id}"]`);
    const isVisible = card.isFlipped || card.isMatched;

    button.classList.toggle('is-flipped', isVisible);
    button.classList.toggle('is-matched', card.isMatched);
    button.setAttribute('aria-disabled', String(isVisible));
    button.setAttribute('aria-label', describeCard(card));

    if (card.isMatched) {
      button.dataset.player = card.matchedBy;
    }
  }
}

/** Testo letto dagli screen reader per ogni carta. */
function describeCard(card) {
  const position = `Carta ${card.id + 1}`;
  if (card.isMatched) return `${position}: ${card.name}, coppia trovata`;
  if (card.isFlipped) return `${position}: ${card.name}`;
  return `${position}, coperta`;
}

function renderScoreboard(game) {
  const items = game.players.map((player, index) => {
    const isCurrent = index === game.currentPlayerIndex;
    const item = document.createElement('li');
    item.className = 'score';
    item.dataset.player = index;
    item.classList.toggle('is-current', isCurrent);
    // Se il punteggio è appena salito, la riga fa un piccolo "salto"
    item.classList.toggle('is-scoring', player.score > (previousScores[index] ?? 0));
    if (isCurrent) item.setAttribute('aria-current', 'true');

    item.innerHTML = `
      <span class="player-cap" aria-hidden="true"></span>
      <span class="score-avatar" aria-hidden="true">${icona('persona', 18)}</span>
      <span class="score-name"></span>
      <span class="score-coins">
        <span class="coin-icon" aria-hidden="true"></span>
        <span class="score-times" aria-hidden="true">×</span>
        <span class="score-points"></span>
        <span class="score-turn">${isCurrent ? 'Tocca a te!' : ''}</span>
      </span>`;
    // textContent (e non innerHTML) per i nomi: così un nome come "<b>" non diventa HTML.
    item.querySelector('.score-name').textContent = player.name;
    item.querySelector('.score-points').textContent = player.score;
    item.querySelector('.score-points').setAttribute('aria-label', `${player.score} punti`);
    return item;
  });

  previousScores = game.players.map((player) => player.score);
  elements.scoreboard.replaceChildren(...items);
}

/** Vero se nel sistema è attivo "riduci movimento": niente scintille né punti che volano. */
function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Coppia trovata: una moneta (trifoglio nell'anime) salta fuori dall'ultima carta,
 * le due carte sprizzano scintille e un "+1" vola fino al punteggio di chi l'ha trovata.
 * Sul telefono c'è anche una piccola vibrazione.
 */
export function celebrateMatch(pairIds, lastCardId, playerIndex) {
  const lastButton = elements.board.querySelector(`[data-card-id="${lastCardId}"]`);
  lastButton.append(createEffect('coin-pop'));
  navigator.vibrate?.(40); // solo dove c'è (telefoni Android): altrove non fa niente

  if (prefersReducedMotion()) return;
  for (const id of pairIds) {
    const sparks = createEffect('sparks');
    // 8 scintille, una ogni 45°: l'angolo lo legge il CSS (--angle)
    sparks.innerHTML = Array.from({ length: 8 }, (_, index) =>
      `<span class="spark" style="--angle: ${index * 45}deg"></span>`).join('');
    elements.board.querySelector(`[data-card-id="${id}"]`).append(sparks);
  }
  flyPointToScore(lastButton, playerIndex);
}

/** Un elemento decorativo che si toglie da solo quando la sua animazione CSS finisce. */
function createEffect(className) {
  const effect = document.createElement('span');
  effect.className = className;
  effect.setAttribute('aria-hidden', 'true');
  effect.addEventListener('animationend', (event) => {
    if (event.target === effect || effect.contains(event.target)) effect.remove();
  });
  return effect;
}

/** "+1" che parte dalla carta e vola verso il punteggio del giocatore (Web Animations API). */
function flyPointToScore(fromButton, playerIndex) {
  const target = elements.scoreboard.querySelector(`[data-player="${playerIndex}"] .score-points`);
  if (!target) return;
  const from = fromButton.getBoundingClientRect();
  const to = target.getBoundingClientRect();
  const startX = from.left + from.width / 2;
  const startY = from.top + from.height / 2;
  const dx = to.left + to.width / 2 - startX;
  const dy = to.top + to.height / 2 - startY;

  const point = document.createElement('span');
  point.className = 'point-fly';
  point.dataset.player = playerIndex;
  point.setAttribute('aria-hidden', 'true');
  point.textContent = '+1';
  point.style.left = `${startX}px`;
  point.style.top = `${startY}px`;
  document.body.append(point);

  const animation = point.animate(
    [
      { transform: 'translate(-50%, -50%) scale(0.5)', opacity: 0 },
      { transform: 'translate(-50%, -110%) scale(1.3)', opacity: 1, offset: 0.3 },
      { transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(0.7)`, opacity: 0.9 },
    ],
    { duration: 950, delay: 420, easing: 'cubic-bezier(0.5, 0, 0.3, 1)', fill: 'both' },
  );
  animation.finished.then(() => point.remove(), () => point.remove());
}

// --- Messaggi ------------------------------------------------------------------

/** Messaggio breve sotto i punteggi (letto anche dagli screen reader). */
export function showStatus(text) {
  elements.status.textContent = text;
}

/** Banda grande al centro, ad esempio "Tocca a Giulia", che sparisce da sola. */
export function showTurnBanner(game) {
  const banner = elements.turnBanner;
  // Il nome è in un <strong> a parte: nella versione anime è dorato e sottolineato
  // Nella versione anime è una scheda: "Cambio turno", il nome e una frase
  banner.innerHTML = `
    <span class="turn-banner-pill">${icona('rigioca', 14)} Cambio turno</span>
    <span class="turn-banner-name">Tocca a <strong></strong></span>
    <span class="turn-banner-quote">«Gira due carte e trova i personaggi gemelli.»</span>`;
  banner.querySelector('strong').textContent = game.players[game.currentPlayerIndex].name;
  banner.dataset.player = game.currentPlayerIndex;

  // Per far ripartire l'animazione CSS: togliamo la classe, forziamo il
  // ricalcolo dello stile leggendo offsetWidth, poi la rimettiamo.
  banner.classList.remove('is-visible');
  void banner.offsetWidth;
  banner.classList.add('is-visible');
}

export function hideTurnBanner() {
  elements.turnBanner.classList.remove('is-visible');
}

/** Sposta il focus sulla prima carta: comodo per chi gioca da tastiera. */
export function focusFirstCard() {
  elements.board.querySelector('.card')?.focus();
}

// --- Fine partita --------------------------------------------------------------

/** 134000 ms → "2m 14s" */
function formatDuration(milliseconds) {
  const seconds = Math.round(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  return minutes > 0 ? `${minutes}m ${seconds % 60}s` : `${seconds}s`;
}

/** `durationMs`: quanto è durata la partita (la misura main.js). */
export function renderResults(game, { durationMs = 0 } = {}) {
  const winners = getWinners(game);
  const isTie = winners.length > 1;

  elements.resultsTitle.textContent = isTie
    ? 'Pareggio!'
    : `Vince ${winners[0].name}!`;

  elements.resultsSummary.textContent = isTie
    ? `${formatNameList(winners.map((player) => player.name))} a pari merito · ${game.moves} mosse`
    : `Partita finita: tutte le coppie trovate in ${game.moves} mosse`;

  // Versione anime: statistiche della partita. Precisione = coppie trovate / mosse.
  const pairCount = game.cards.length / 2;
  elements.stats.time.textContent = formatDuration(durationMs);
  elements.stats.moves.textContent = game.moves;
  elements.stats.accuracy.textContent = `${Math.round((pairCount / Math.max(game.moves, 1)) * 100)}%`;
  elements.challengers.textContent = game.players.length;

  elements.ranking.replaceChildren(...getRanking(game).map(createRankingItem));
  elements.resultsTitle.focus();
}

function createRankingItem(entry) {
  const item = document.createElement('li');
  item.className = 'ranking-item';
  item.dataset.player = entry.playerIndex;
  item.classList.toggle('is-winner', entry.rank === 1);
  item.innerHTML = `
    <span class="ranking-rank">${entry.rank}°</span>
    <span class="player-cap" aria-hidden="true"></span>
    <span class="ranking-avatar" aria-hidden="true">${icona(entry.rank === 1 ? 'trofeo' : 'scudo', 22)}</span>
    <span class="ranking-who">
      <span class="ranking-name"></span>
      <span class="ranking-pairs" aria-hidden="true">${entry.score} ${entry.score === 1 ? 'coppia trovata' : 'coppie trovate'}</span>
    </span>
    <span class="ranking-score">
      <span class="coin-icon" aria-hidden="true"></span>
      <span aria-hidden="true">×</span>${entry.score}
      <span class="visually-hidden">${entry.score === 1 ? 'coppia' : 'coppie'}</span>
    </span>`;
  item.querySelector('.ranking-name').textContent = entry.name;
  return item;
}

/** ['Anna', 'Bruno', 'Carla'] → "Anna, Bruno e Carla" */
function formatNameList(names) {
  if (names.length === 1) return names[0];
  return `${names.slice(0, -1).join(', ')} e ${names.at(-1)}`;
}

// --- Pulsanti ------------------------------------------------------------------

export function onSetupSubmit(handler) {
  elements.setupForm.addEventListener('submit', (event) => {
    event.preventDefault(); // niente ricaricamento della pagina
    handler(readSettings());
  });
}

export function onPlayerCountChange(handler) {
  elements.setupForm.addEventListener('change', (event) => {
    if (event.target.name === 'player-count') {
      handler(Number(event.target.value));
    }
  });
}

/** Mostra se l'audio è acceso o spento sul pulsante. */
export function renderSoundToggle(isOn) {
  elements.soundToggle.setAttribute('aria-pressed', String(isOn));
}

export function onSoundToggle(handler) {
  elements.soundToggle.addEventListener('click', handler);
}

export function onQuit(handler) {
  elements.quitButton.addEventListener('click', handler);
}

export function onReplay(handler) {
  elements.replayButton.addEventListener('click', handler);
}

export function onChangeSettings(handler) {
  elements.settingsButton.addEventListener('click', handler);
}
