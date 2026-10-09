/*
 * LOGICA DEL GIOCO
 *
 * Questo file non sa nulla di HTML, CSS o timer: contiene solo lo stato della
 * partita e le regole. Per questo si può leggere e testare da solo
 * (vedi tests/game.test.js).
 *
 * La partita passa da una fase all'altra così:
 *
 *   PLAYING ──(2ª carta diversa)──► CHECKING ──(endTurn)──► PLAYING
 *      │
 *      └──(ultima coppia trovata)──► FINISHED
 */

import { createDeck } from './cards.js';

export const MIN_PLAYERS = 2;
export const MAX_PLAYERS = 4;

/** Le fasi della partita. */
export const PHASE = {
  PLAYING: 'playing', // il giocatore di turno può girare carte
  CHECKING: 'checking', // due carte diverse sono scoperte: si aspetta endTurn()
  FINISHED: 'finished', // tutte le coppie sono state trovate
};

/** Cosa è successo dopo aver girato una carta. */
export const OUTCOME = {
  IGNORED: 'ignored', // clic non valido: non è cambiato nulla
  FIRST_CARD: 'first-card', // girata la prima carta del turno
  MATCH: 'match', // coppia trovata: lo stesso giocatore gioca ancora
  MISMATCH: 'mismatch', // carte diverse: bisogna chiamare endTurn()
  GAME_OVER: 'game-over', // coppia trovata ed era l'ultima
};

/**
 * Crea una nuova partita.
 *
 * @param {object} options
 * @param {string[]} options.playerNames - da 2 a 4 nomi
 * @param {number} options.pairCount - quante coppie mettere sul tavolo
 * @param {() => number} [options.random] - generatore casuale (utile nei test)
 * @param {object[]} [options.symbols] - il mazzo da cui pescare (es. i personaggi della versione anime)
 */
export function createGame({ playerNames, pairCount, random = Math.random, symbols }) {
  if (playerNames.length < MIN_PLAYERS || playerNames.length > MAX_PLAYERS) {
    throw new Error(`Servono da ${MIN_PLAYERS} a ${MAX_PLAYERS} giocatori`);
  }

  return {
    cards: createDeck(pairCount, random, symbols),
    players: playerNames.map((name) => ({ name, score: 0 })),
    currentPlayerIndex: 0,
    flippedIds: [], // carte girate nel turno corrente (al massimo 2)
    moves: 0, // quante volte sono state girate due carte
    phase: PHASE.PLAYING,
  };
}

export function getCurrentPlayer(game) {
  return game.players[game.currentPlayerIndex];
}

export function getCard(game, cardId) {
  return game.cards.find((card) => card.id === cardId);
}

/**
 * Una carta si può girare solo se:
 * - la partita è in fase PLAYING (non durante il controllo di due carte);
 * - la carta esiste ed è ancora coperta.
 */
export function canFlip(game, cardId) {
  const card = getCard(game, cardId);
  return game.phase === PHASE.PLAYING && card !== undefined && !card.isFlipped;
}

/**
 * Il giocatore di turno gira una carta.
 * Restituisce un oggetto { outcome } con uno dei valori di OUTCOME.
 */
export function flipCard(game, cardId) {
  if (!canFlip(game, cardId)) {
    return { outcome: OUTCOME.IGNORED };
  }

  getCard(game, cardId).isFlipped = true;
  game.flippedIds.push(cardId);

  if (game.flippedIds.length === 1) {
    return { outcome: OUTCOME.FIRST_CARD };
  }

  return checkFlippedPair(game);
}

/** Confronta le due carte appena girate e applica le regole. */
function checkFlippedPair(game) {
  game.moves += 1;

  const [first, second] = game.flippedIds.map((id) => getCard(game, id));

  if (first.name !== second.name) {
    game.phase = PHASE.CHECKING;
    return { outcome: OUTCOME.MISMATCH };
  }

  markAsMatched(game, first);
  markAsMatched(game, second);
  getCurrentPlayer(game).score += 1;
  game.flippedIds = [];

  if (areAllPairsFound(game)) {
    game.phase = PHASE.FINISHED;
    return { outcome: OUTCOME.GAME_OVER };
  }

  return { outcome: OUTCOME.MATCH };
}

function markAsMatched(game, card) {
  card.isMatched = true;
  card.matchedBy = game.currentPlayerIndex;
}

export function areAllPairsFound(game) {
  return game.cards.every((card) => card.isMatched);
}

/**
 * Chiude il turno dopo due carte diverse: le rigira e passa
 * al giocatore successivo (dopo l'ultimo si torna al primo).
 * Va chiamata dalla UI dopo aver lasciato le carte visibili per un po'.
 */
export function endTurn(game) {
  if (game.phase !== PHASE.CHECKING) {
    return;
  }

  for (const cardId of game.flippedIds) {
    getCard(game, cardId).isFlipped = false;
  }

  game.flippedIds = [];
  game.currentPlayerIndex = (game.currentPlayerIndex + 1) % game.players.length;
  game.phase = PHASE.PLAYING;
}

/**
 * Classifica finale, dal punteggio più alto al più basso.
 * A parità di punti i giocatori condividono la posizione (es. 1°, 1°, 3°).
 *
 * @returns {{ name: string, score: number, rank: number, playerIndex: number }[]}
 */
export function getRanking(game) {
  const sorted = game.players
    .map((player, playerIndex) => ({ ...player, playerIndex }))
    .sort((a, b) => b.score - a.score);

  return sorted.map((player) => ({
    ...player,
    rank: 1 + sorted.filter((other) => other.score > player.score).length,
  }));
}

/** I giocatori con il punteggio più alto: più di uno significa pareggio. */
export function getWinners(game) {
  const bestScore = Math.max(...game.players.map((player) => player.score));
  return game.players.filter((player) => player.score === bestScore);
}
