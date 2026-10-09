/*
 * TURNI DELLA PARTITA
 *
 * Logica pura: chi gioca, quante palline restano a ciascuno, chi vince.
 * Ogni giocatore ha le sue palline; quando ne perde una, tocca al
 * giocatore successivo che ne ha ancora. Finite tutte, la partita è chiusa.
 */

export const MIN_PLAYERS = 1;
export const MAX_PLAYERS = 4;

/**
 * @param {object} options
 * @param {string[]} options.playerNames - da 1 a 4 nomi
 * @param {number} options.ballsPerPlayer
 */
export function createMatch({ playerNames, ballsPerPlayer }) {
  if (playerNames.length < MIN_PLAYERS || playerNames.length > MAX_PLAYERS) {
    throw new Error(`Servono da ${MIN_PLAYERS} a ${MAX_PLAYERS} giocatori`);
  }

  return {
    players: playerNames.map((name) => ({ name, score: 0, ballsLeft: ballsPerPlayer })),
    ballsPerPlayer,
    currentPlayerIndex: 0,
    finished: false,
  };
}

export function getCurrentPlayer(match) {
  return match.players[match.currentPlayerIndex];
}

/** Numero della pallina in gioco per il giocatore di turno (1, 2 o 3). */
export function getBallNumber(match) {
  const player = getCurrentPlayer(match);
  return match.ballsPerPlayer - player.ballsLeft + 1;
}

/** Aggiunge punti al giocatore di turno. */
export function addPoints(match, points) {
  if (match.finished) return;
  getCurrentPlayer(match).score += points;
}

/**
 * La pallina del giocatore di turno è persa: il turno passa al prossimo
 * giocatore che ha ancora palline (dopo l'ultimo si torna al primo).
 * @returns {{ finished: boolean }}
 */
export function endBall(match) {
  if (match.finished) return { finished: true };

  getCurrentPlayer(match).ballsLeft -= 1;

  const count = match.players.length;
  for (let offset = 1; offset <= count; offset++) {
    const index = (match.currentPlayerIndex + offset) % count;
    if (match.players[index].ballsLeft > 0) {
      match.currentPlayerIndex = index;
      return { finished: false };
    }
  }

  match.finished = true;
  return { finished: true };
}

/**
 * Classifica dal punteggio più alto; a pari punti la stessa posizione (1°, 1°, 3°).
 * @returns {{ name: string, score: number, rank: number, playerIndex: number }[]}
 */
export function getRanking(match) {
  const sorted = match.players
    .map((player, playerIndex) => ({ name: player.name, score: player.score, playerIndex }))
    .sort((a, b) => b.score - a.score);

  return sorted.map((entry) => ({
    ...entry,
    rank: 1 + sorted.filter((other) => other.score > entry.score).length,
  }));
}

/** I giocatori con il punteggio più alto: più di uno significa pareggio. */
export function getWinners(match) {
  const best = Math.max(...match.players.map((player) => player.score));
  return match.players.filter((player) => player.score === best);
}
