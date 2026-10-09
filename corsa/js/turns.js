/*
 * TURNI (logica pura, testata)
 *
 * Da 1 a 4 giocatori, uno alla volta: ognuno fa la sua corsa a cronometro.
 * Vince il tempo totale più basso; a pari tempo si condivide la posizione.
 */

export const MIN_PLAYERS = 1;
export const MAX_PLAYERS = 4;

export function createMatch({ playerNames }) {
  if (playerNames.length < MIN_PLAYERS || playerNames.length > MAX_PLAYERS) {
    throw new Error(`Servono da ${MIN_PLAYERS} a ${MAX_PLAYERS} giocatori`);
  }
  return {
    players: playerNames.map((name) => ({ name, totalTime: null, bestLap: null })),
    currentPlayerIndex: 0,
    finished: false,
  };
}

export function getCurrentPlayer(match) {
  return match.players[match.currentPlayerIndex];
}

/**
 * Il giocatore di turno ha finito la corsa: si salva il tempo e tocca al prossimo.
 * @returns {{ finished: boolean }} vero se hanno corso tutti
 */
export function finishRun(match, { totalTime, bestLap }) {
  if (match.finished) return { finished: true };
  Object.assign(getCurrentPlayer(match), { totalTime, bestLap });
  if (match.currentPlayerIndex === match.players.length - 1) {
    match.finished = true;
  } else {
    match.currentPlayerIndex += 1;
  }
  return { finished: match.finished };
}

/** Classifica dal tempo più basso; a pari tempo stessa posizione (1°, 1°, 3°). */
export function getRanking(match) {
  const sorted = match.players
    .map((player, playerIndex) => ({ ...player, playerIndex }))
    .sort((a, b) => a.totalTime - b.totalTime);
  return sorted.map((player) => ({
    ...player,
    rank: 1 + sorted.filter((other) => other.totalTime < player.totalTime).length,
  }));
}

export function getWinners(match) {
  const best = Math.min(...match.players.map((player) => player.totalTime));
  return match.players.filter((player) => player.totalTime === best);
}
