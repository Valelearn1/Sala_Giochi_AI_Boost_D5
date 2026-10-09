/*
 * PARAMETRI FISICI
 *
 * Tutti i numeri che cambiano "come si sente" il flipper stanno qui.
 * Per regolare il gioco basta modificare questo file.
 *
 * Unità di misura:
 * - distanze in "unità del tavolo" (il tavolo è largo 600 e alto 1100);
 * - velocità in unità per fotogramma di riferimento (1/60 di secondo),
 *   come le usa Matter.js;
 * - angoli in radianti (π radianti = 180°).
 */

export const PHYSICS = {
  /* --- Simulazione --- */
  stepMs: 1000 / 240, // passo fisso: 240 aggiornamenti al secondo, qualunque sia il frame rate
  maxFrameMs: 50, // se un fotogramma tarda (es. cambio scheda), non recuperiamo più di così

  /* --- Mondo --- */
  gravityY: 0.85, // inclinazione del tavolo: più alto = la pallina scende più in fretta

  /* --- Pallina --- */
  ballRadius: 11,
  ballRestitution: 0, // il rimbalzo lo decidono i singoli elementi (Matter usa il valore più alto)
  ballFrictionAir: 0.002,
  maxBallSpeed: 34, // limite di velocità: evita che la pallina attraversi pareti e alette
  // (a 240 passi/s la pallina si sposta al massimo di 8,5 unità per passo: meno di raggio + metà parete)

  /* --- Pareti --- */
  wallRestitution: 0.6, // quanto rimbalzano le pareti (0 = niente, 1 = rimbalzo perfetto)

  /* --- Alette (flipper) --- */
  flipperUpSpeed: 0.14, // radianti per passo quando si alzano (≈ 30 ms per tutta la corsa)
  flipperDownSpeed: 0.07, // radianti per passo quando tornano giù
  flipperRestitution: 0.25,

  /* --- Lanciatore --- */
  plungerChargeMs: 1200, // tempo per la carica massima
  launchMinSpeed: 14,
  launchMaxSpeed: 32,

  /* --- Elementi --- */
  bumperKick: 17, // velocità con cui il bumper respinge la pallina
  bumperRestitution: 0.6,
  slingshotKick: 15,
  slingshotRestitution: 0.6,
  targetRestitution: 0.6,
  postRestitution: 0.75, // paletti di rimbalzo

  /* --- Pallina incastrata --- */
  stuckSpeed: 0.15, // sotto questa velocità la pallina è "ferma"
  stuckMs: 4000, // dopo quanto tempo da ferma riceve una spinta
  stuckNudge: 4,
};
