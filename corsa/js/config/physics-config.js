/*
 * COME SI GUIDA (solo dati)
 * Velocità in unità al secondo, angoli in radianti al secondo.
 * Cambiando questi numeri l'auto diventa più veloce, più pesante o più nervosa.
 */

export const CAR = {
  length: 30,
  width: 17,
  maxSpeed: 330, // in pista
  offroadMaxSpeed: 120, // sull'erba (o fuori dal sentiero) si va piano
  reverseMaxSpeed: 90,
  acceleration: 360,
  braking: 620,
  friction: 180, // rallentamento senza gas
  offroadFriction: 520,
  steering: 3.1, // quanto gira a velocità piena
  steeringSpeed: 140, // sotto questa velocità sterza meno (da fermi non si gira su se stessi)
};

/** Passo fisso della simulazione: 120 volte al secondo, uguale con qualunque schermo. */
export const STEP_SECONDS = 1 / 120;
/** Al massimo tanto tempo per fotogramma (dopo un cambio di scheda non si "salta"). */
export const MAX_FRAME_SECONDS = 0.05;

/** Conto alla rovescia prima del VIA, in secondi (3, 2, 1). */
export const COUNTDOWN_SECONDS = 3;
