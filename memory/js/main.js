/*
 * PUNTO DI INGRESSO
 *
 * Collega l'interfaccia (ui.js) alla logica (game.js):
 * quando succede qualcosa sulla pagina chiede alla logica cosa fare,
 * poi chiede all'interfaccia di mostrare il risultato.
 * È anche l'unico posto con dei timer (setTimeout).
 */

import { getPairCount } from './cards.js';
import { createGame, flipCard, endTurn, getCurrentPlayer, OUTCOME } from './game.js';
import * as ui from './ui.js';
import * as sound from './sound.js';

/** Per quanto restano visibili due carte diverse prima di rigirarsi. */
const MISMATCH_DELAY_MS = 1000;
/** Pausa dopo l'ultima coppia, per vederla girarsi prima della classifica. */
const RESULTS_DELAY_MS = 900;

let game = null; // la partita in corso
let settings = null; // ultime impostazioni scelte, servono per "Rigioca"
let pendingTimer = null; // timer in attesa, da annullare se si esce dalla partita
let isPlaying = false; // true mentre è visibile la schermata della partita (per la musica)

function startGame(newSettings) {
  cancelPendingTimer();
  settings = newSettings;
  game = createGame({
    playerNames: settings.playerNames,
    pairCount: getPairCount(settings.difficulty),
  });

  ui.createBoard(game, settings.difficulty);
  ui.renderGame(game);
  ui.showScreen('game');
  ui.showStatus(`Tocca a ${getCurrentPlayer(game).name}: gira due carte`);
  ui.showTurnBanner(game);
  ui.focusFirstCard();

  isPlaying = true;
  sound.startMusic();
  sound.playTurn();
}

function handleCardClick(cardId) {
  const { outcome } = flipCard(game, cardId);
  if (outcome === OUTCOME.IGNORED) {
    return;
  }

  ui.renderGame(game);
  sound.playFlip();
  const playerName = getCurrentPlayer(game).name;

  if (outcome === OUTCOME.MATCH || outcome === OUTCOME.GAME_OVER) {
    ui.celebrateMatch(cardId);
    sound.playCoin({ delay: 0.35 }); // quando la moneta salta fuori, a carta girata
  }

  if (outcome === OUTCOME.MATCH) {
    ui.showStatus(`Coppia trovata! ${playerName} gioca ancora`);
  } else if (outcome === OUTCOME.MISMATCH) {
    ui.showStatus('Non sono uguali…');
    sound.playMismatch({ delay: 0.35 });
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
  sound.playTurn();
}

function showResults() {
  pendingTimer = null;
  // Prima mostriamo la schermata: un elemento nascosto non può ricevere il focus.
  ui.showScreen('results');
  ui.renderResults(game);

  isPlaying = false;
  sound.stopMusic();
  sound.playFanfare();
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
    sound.playToggleOn();
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

// Il browser può ricordare la scelta del modulo dopo un "indietro": allineiamo i campi.
ui.updateNameFields(ui.readSettings().playerNames.length);
ui.onPlayerCountChange(ui.updateNameFields);
ui.onSetupSubmit(startGame);
ui.onCardClick(handleCardClick);
ui.onQuit(goToSetup);
ui.onReplay(() => startGame(settings));
ui.onChangeSettings(goToSetup);
