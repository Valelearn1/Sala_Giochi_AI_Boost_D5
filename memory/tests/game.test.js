/*
 * Test della logica del Memory.
 * Si eseguono con Node (versione 22 o successiva), senza installare nulla:
 *
 *   node --test memory/tests/*.test.js
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { shuffle } from '../js/shuffle.js';
import { createDeck, getPairCount, SYMBOLS } from '../js/cards.js';
import { CHARACTERS, getCharacters } from '../js/characters.js';
import {
  createGame,
  flipCard,
  endTurn,
  getCurrentPlayer,
  getRanking,
  getWinners,
  OUTCOME,
  PHASE,
} from '../js/game.js';

// --- Funzioni di supporto per i test -------------------------------------

/** Trova gli id di due carte con lo stesso simbolo. */
function findPair(game, emoji = game.cards.find((card) => !card.isMatched).emoji) {
  return game.cards.filter((card) => card.emoji === emoji).map((card) => card.id);
}

/** Trova gli id di due carte coperte con simboli diversi. */
function findMismatch(game) {
  const covered = game.cards.filter((card) => !card.isMatched);
  const first = covered[0];
  const second = covered.find((card) => card.emoji !== first.emoji);
  return [first.id, second.id];
}

function newGame(playerNames = ['Anna', 'Bruno']) {
  return createGame({ playerNames, pairCount: 8 });
}

// --- shuffle ---------------------------------------------------------------

test('shuffle non modifica l’array originale e mantiene gli stessi elementi', () => {
  const original = [1, 2, 3, 4, 5];
  const result = shuffle(original);

  assert.deepEqual(original, [1, 2, 3, 4, 5]);
  assert.deepEqual([...result].sort(), [1, 2, 3, 4, 5]);
});

test('shuffle segue Fisher-Yates con un generatore prevedibile', () => {
  // Con random() = 0, ogni elemento viene scambiato con quello in posizione 0.
  assert.deepEqual(shuffle([1, 2, 3, 4], () => 0), [2, 3, 4, 1]);
  // Con random() ≈ 1, ogni elemento viene scambiato con se stesso.
  assert.deepEqual(shuffle([1, 2, 3, 4], () => 0.9999), [1, 2, 3, 4]);
});

// --- mazzo -----------------------------------------------------------------

test('le difficoltà hanno 8, 10 e 18 coppie', () => {
  assert.equal(getPairCount('4x4'), 8);
  assert.equal(getPairCount('4x5'), 10);
  assert.equal(getPairCount('6x6'), 18);
  assert.ok(SYMBOLS.length >= 18);
});

test('il mazzo contiene esattamente due carte per simbolo, con id unici', () => {
  const deck = createDeck(10);
  assert.equal(deck.length, 20);

  const ids = new Set(deck.map((card) => card.id));
  assert.equal(ids.size, 20);

  for (const card of deck) {
    const copies = deck.filter((other) => other.emoji === card.emoji);
    assert.equal(copies.length, 2);
  }
});

test('ogni versione ha almeno 18 personaggi, con nomi ed emoji tutti diversi', () => {
  for (const [version, characters] of Object.entries(CHARACTERS)) {
    assert.ok(characters.length >= 18, version);
    assert.equal(new Set(characters.map((c) => c.name)).size, characters.length, `${version}: nomi doppi`);
    assert.equal(new Set(characters.map((c) => c.emoji)).size, characters.length, `${version}: emoji doppie`);
  }
});

test('la partita usa il mazzo della versione scelta', () => {
  const animeNames = new Set(getCharacters('anime').map((c) => c.name));
  const game = createGame({ playerNames: ['A', 'B'], pairCount: 8, symbols: getCharacters('anime') });
  assert.ok(game.cards.every((card) => animeNames.has(card.name)));
  // Versione sconosciuta: si torna al mazzo classico
  assert.equal(getCharacters('inesistente'), CHARACTERS.classica);
});

// --- turni e regole --------------------------------------------------------

test('la partita inizia con il primo giocatore, punteggi a zero e nessuna mossa', () => {
  const game = newGame();
  assert.equal(getCurrentPlayer(game).name, 'Anna');
  assert.equal(game.moves, 0);
  assert.equal(game.phase, PHASE.PLAYING);
  assert.ok(game.players.every((player) => player.score === 0));
});

test('servono da 2 a 4 giocatori', () => {
  assert.throws(() => newGame(['Solo']));
  assert.throws(() => newGame(['A', 'B', 'C', 'D', 'E']));
  assert.doesNotThrow(() => newGame(['A', 'B', 'C', 'D']));
});

test('coppia trovata: le carte restano scoperte, +1 punto e stesso giocatore', () => {
  const game = newGame();
  const [a, b] = findPair(game);

  assert.equal(flipCard(game, a).outcome, OUTCOME.FIRST_CARD);
  assert.equal(flipCard(game, b).outcome, OUTCOME.MATCH);

  assert.ok(game.cards[a].isMatched && game.cards[b].isMatched);
  assert.equal(game.players[0].score, 1);
  assert.equal(getCurrentPlayer(game).name, 'Anna');
  assert.equal(game.moves, 1);
});

test('carte diverse: fase CHECKING, poi endTurn le rigira e passa il turno', () => {
  const game = newGame();
  const [a, b] = findMismatch(game);

  flipCard(game, a);
  assert.equal(flipCard(game, b).outcome, OUTCOME.MISMATCH);
  assert.equal(game.phase, PHASE.CHECKING);
  assert.equal(game.moves, 1);

  endTurn(game);

  assert.equal(game.cards[a].isFlipped, false);
  assert.equal(game.cards[b].isFlipped, false);
  assert.equal(getCurrentPlayer(game).name, 'Bruno');
  assert.equal(game.phase, PHASE.PLAYING);
});

test('durante il controllo i clic sulle altre carte vengono ignorati', () => {
  const game = newGame();
  const [a, b] = findMismatch(game);
  const other = game.cards.find((card) => card.id !== a && card.id !== b);

  flipCard(game, a);
  flipCard(game, b);

  assert.equal(flipCard(game, other.id).outcome, OUTCOME.IGNORED);
  assert.equal(other.isFlipped, false);
});

test('cliccare una carta già scoperta non fa nulla', () => {
  const game = newGame();
  const [a, b] = findPair(game);

  flipCard(game, a);
  assert.equal(flipCard(game, a).outcome, OUTCOME.IGNORED, 'stessa carta due volte');
  assert.deepEqual(game.flippedIds, [a]);

  flipCard(game, b);
  assert.equal(flipCard(game, a).outcome, OUTCOME.IGNORED, 'carta già accoppiata');
  assert.equal(game.moves, 1);
});

test('dopo l’ultimo giocatore il turno torna al primo', () => {
  const game = newGame(['A', 'B', 'C']);
  for (let i = 0; i < 3; i++) {
    const [a, b] = findMismatch(game);
    flipCard(game, a);
    flipCard(game, b);
    endTurn(game);
  }
  assert.equal(getCurrentPlayer(game).name, 'A');
});

test('la partita finisce quando tutte le coppie sono trovate', () => {
  const game = newGame();
  let lastOutcome;

  for (let i = 0; i < 8; i++) {
    const [a, b] = findPair(game);
    flipCard(game, a);
    lastOutcome = flipCard(game, b).outcome;
  }

  assert.equal(lastOutcome, OUTCOME.GAME_OVER);
  assert.equal(game.phase, PHASE.FINISHED);
  assert.equal(game.players[0].score, 8);
});

// --- classifica ------------------------------------------------------------

test('classifica ordinata per punteggio, con posizioni condivise in caso di parità', () => {
  const game = newGame(['A', 'B', 'C']);
  game.players[0].score = 2;
  game.players[1].score = 5;
  game.players[2].score = 2;

  const ranking = getRanking(game);
  assert.deepEqual(
    ranking.map((entry) => [entry.name, entry.rank]),
    [['B', 1], ['A', 2], ['C', 2]],
  );
  assert.deepEqual(getWinners(game).map((player) => player.name), ['B']);
});

test('pareggio: più vincitori con lo stesso punteggio', () => {
  const game = newGame(['A', 'B']);
  game.players[0].score = 4;
  game.players[1].score = 4;

  assert.equal(getWinners(game).length, 2);
  assert.ok(getRanking(game).every((entry) => entry.rank === 1));
});
