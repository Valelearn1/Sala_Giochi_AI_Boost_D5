/*
 * REGOLE E PUNTEGGI REGOLABILI
 * (i punti base di ogni elemento sono in table-layout.js, accanto all'elemento)
 */

export const RULES = {
  ballsPerPlayer: 3,
  maxPlayers: 4,

  multiplierMax: 5, // accendere le 3 corsie fa salire il moltiplicatore fino a ×5
  targetBankBonus: 2000, // bonus per aver abbattuto tutti i bersagli (× moltiplicatore)
  targetResetMs: 1000, // dopo quanto si rialzano i bersagli

  // Bonus a fine pallina: punti per ogni elemento colpito durante quella pallina
  endOfBallBonusPerHit: {
    bumper: 20,
    slingshot: 10,
    target: 50,
    lane: 30,
    outlane: 0,
  },
};
