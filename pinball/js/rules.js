/*
 * REGOLE E PUNTEGGIO DI UNA PALLINA
 *
 * Logica pura: niente Matter.js, niente DOM, niente timer.
 * main.js ci passa gli urti che arrivano dalla fisica e noi rispondiamo
 * con i punti da assegnare e cosa deve succedere sul tavolo.
 *
 * Lo stato vale per UNA pallina: a ogni pallina nuova se ne crea uno nuovo,
 * così moltiplicatore, luci e bersagli ripartono da capo (anche perché il
 * tavolo passa da un giocatore all'altro).
 */

/** Tipi di elementi che danno punti. */
export const HIT_TYPES = ['bumper', 'slingshot', 'target', 'lane', 'outlane'];

/** Stato iniziale di una pallina. */
export function createBallState({ laneCount, targetCount }) {
  return {
    multiplier: 1,
    lanesLit: Array(laneCount).fill(false),
    targetsDown: Array(targetCount).fill(false),
    hits: Object.fromEntries(HIT_TYPES.map((type) => [type, 0])), // quante volte è stato colpito ogni tipo
  };
}

/**
 * Registra un urto e calcola i punti.
 *
 * @param {object} state - creato da createBallState (viene aggiornato)
 * @param {{ type: string, id: number|string, points: number }} hit - l'elemento colpito e i suoi punti base
 * @param {object} rules - RULES da config/rules-config.js
 * @returns {{ points: number, message: string|null, resetTargets: boolean }}
 */
export function applyHit(state, hit, rules) {
  const result = { points: 0, message: null, resetTargets: false };

  if (hit.type === 'target' && state.targetsDown[hit.id]) {
    return result; // bersaglio già abbattuto: non conta
  }

  state.hits[hit.type] += 1;
  result.points = hit.points * state.multiplier;

  if (hit.type === 'lane') {
    lightLane(state, hit.id, rules, result);
  } else if (hit.type === 'target') {
    knockDownTarget(state, hit.id, rules, result);
  }

  return result;
}

/** Accende una corsia; con tutte e tre accese sale il moltiplicatore e le luci si spengono. */
function lightLane(state, laneId, rules, result) {
  state.lanesLit[laneId] = true;

  if (state.lanesLit.every(Boolean)) {
    state.lanesLit.fill(false);
    if (state.multiplier < rules.multiplierMax) {
      state.multiplier += 1;
      result.message = `Moltiplicatore ×${state.multiplier}!`;
    } else {
      result.message = `Moltiplicatore al massimo ×${state.multiplier}`;
    }
  }
}

/** Abbatte un bersaglio; con tutti giù arriva il bonus e i bersagli si rialzano. */
function knockDownTarget(state, targetId, rules, result) {
  state.targetsDown[targetId] = true;

  if (state.targetsDown.every(Boolean)) {
    result.points += rules.targetBankBonus * state.multiplier;
    result.message = 'Bonus bersagli!';
    result.resetTargets = true;
    state.targetsDown.fill(false);
  }
}

/**
 * Bonus di fine pallina: punti per ogni elemento colpito.
 * @returns {{ bonus: number, details: { type: string, count: number, points: number }[] }}
 */
export function endOfBallBonus(state, rules) {
  const details = HIT_TYPES.map((type) => ({
    type,
    count: state.hits[type],
    points: state.hits[type] * (rules.endOfBallBonusPerHit[type] ?? 0),
  })).filter((detail) => detail.points > 0);

  const bonus = details.reduce((total, detail) => total + detail.points, 0);
  return { bonus, details };
}
