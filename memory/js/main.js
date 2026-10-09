/*
 * PUNTO DI INGRESSO
 *
 * Collega l'interfaccia (ui.js) alla logica (game.js):
 * quando succede qualcosa sulla pagina chiede alla logica cosa fare,
 * poi chiede all'interfaccia di mostrare il risultato.
 * È anche l'unico posto con dei timer (setTimeout).
 */

import { getPairCount } from './cards.js';
import { getCharacters } from './characters.js';
import { createGame, flipCard, endTurn, getCard, getCurrentPlayer, getWinners, OUTCOME } from './game.js';
import { loadRecords, saveRecords, updateRecord } from './records.js';
import * as ui from './ui.js';
import * as sound from '../../assets/suoni.js';

/** Per quanto restano visibili due carte diverse prima di rigirarsi. */
const MISMATCH_DELAY_MS = 1000;
/** Pausa dopo l'ultima coppia, per vederla girarsi prima della classifica. */
const RESULTS_DELAY_MS = 900;

let game = null; // la partita in corso
let settings = null; // ultime impostazioni scelte, servono per "Rigioca"
let pendingTimer = null; // timer in attesa, da annullare se si esce dalla partita
let isPlaying = false; // true mentre è visibile la schermata della partita (per la musica)
let startTime = 0; // quando è iniziata la partita, per il "Tempo" nella classifica

function startGame(newSettings) {
  cancelPendingTimer();
  settings = newSettings;
  game = createGame({
    playerNames: settings.playerNames,
    pairCount: getPairCount(settings.difficulty),
    // I personaggi della versione scelta (classica o anime), vedi assets/tema.js
    symbols: getCharacters(window.SalaTema?.get()),
  });

  ui.createBoard(game, settings.difficulty);
  ui.renderGame(game);
  ui.showScreen('game');
  ui.showStatus(`Tocca a ${getCurrentPlayer(game).name}: gira due carte`);
  ui.showTurnBanner(game);
  ui.focusFirstCard();

  startTime = Date.now();
  isPlaying = true;
  sound.startMusic();
  sound.play('turn');
}

function handleCardClick(cardId) {
  const { outcome } = flipCard(game, cardId);
  if (outcome === OUTCOME.IGNORED) {
    return;
  }

  ui.renderGame(game);
  sound.play('flip');
  const playerName = getCurrentPlayer(game).name;

  if (outcome === OUTCOME.MATCH || outcome === OUTCOME.GAME_OVER) {
    // Le due carte della coppia: quella appena girata e la sua gemella
    const { name } = getCard(game, cardId);
    const pairIds = game.cards.filter((card) => card.isMatched && card.name === name).map((card) => card.id);
    ui.celebrateMatch(pairIds, cardId, game.currentPlayerIndex);
    sound.play('match', { delay: 0.35 }); // quando la moneta salta fuori, a carta girata
  }

  if (outcome === OUTCOME.MATCH) {
    ui.showStatus(`Coppia trovata! ${playerName} gioca ancora`);
  } else if (outcome === OUTCOME.MISMATCH) {
    ui.showStatus('Non sono uguali…');
    sound.play('mismatch', { delay: 0.35 });
    pendingTimer = setTimeout(passTurn, MISMATCH_DELAY_MS);
  } else if (outcome === OUTCOME.GAME_OVER) {
    ui.showStatus('Ultima coppia trovata!');
    pendingTimer = setTimeout(showResults, RESULTS_DELAY_MS);
  }
}

/** Dopo due carte diverse: le rigira e annuncia il prossimo giocatore. */
function passTurn() {
  pendingTimer = null;
  endTurn(game);
  ui.renderGame(game);
  ui.showStatus(`Tocca a ${getCurrentPlayer(game).name}`);
  ui.showTurnBanner(game);
  sound.play('turn');
}

function showResults() {
  pendingTimer = null;
  // Prima mostriamo la schermata: un elemento nascosto non può ricevere il focus.
  ui.showScreen('results');
  const durationMs = Date.now() - startTime;
  // Record del livello su questo dispositivo: vale il tempo più basso
  const winnerNames = new Intl.ListFormat('it', { type: 'conjunction' }).format(getWinners(game).map((player) => player.name));
  const { records, best, isNew } = updateRecord(loadRecords(), settings.difficulty, { name: winnerNames, durationMs, moves: game.moves });
  if (isNew) saveRecords(records);
  ui.renderResults(game, { durationMs, record: { best, isNew } });

  isPlaying = false;
  sound.stopMusic();
  sound.play('fanfare');
}

function goToSetup() {
  cancelPendingTimer();
  ui.hideTurnBanner();
  ui.showScreen('setup');

  isPlaying = false;
  sound.stopMusic();
}

/** Accende o spegne l'audio; la musica suona solo durante la partita. */
function toggleSound() {
  sound.setSoundOn(!sound.isSoundOn());
  ui.renderSoundToggle(sound.isSoundOn());

  if (sound.isSoundOn()) {
    sound.play('toggleOn');
    if (isPlaying) sound.startMusic();
  }
}

function cancelPendingTimer() {
  clearTimeout(pendingTimer);
  pendingTimer = null;
}

// --- Collegamento degli eventi ------------------------------------------------

ui.renderSoundToggle(sound.isSoundOn());
ui.onSoundToggle(toggleSound);

// Cambio di versione durante una partita: le carte restano quelle, i nuovi personaggi arrivano dalla prossima
window.addEventListener('sala-tema', () => {
  if (isPlaying) ui.showStatus('I personaggi della nuova versione arrivano con la prossima partita');
});

// Il browser può ricordare la scelta del modulo dopo un "indietro": allineiamo i campi.
ui.updateNameFields(ui.readSettings().playerNames.length);
ui.onPlayerCountChange(ui.updateNameFields);
ui.onSetupSubmit(startGame);
ui.onCardClick(handleCardClick);
ui.onQuit(goToSetup);
ui.onReplay(() => startGame(settings));
ui.onChangeSettings(goToSetup);
