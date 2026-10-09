/*
 * LA PISTA (solo dati)
 *
 * Un circuito chiuso visto dall'alto, in "unità del tavolo" (600 × 900):
 * il disegno si adatta allo schermo, i numeri restano questi.
 *
 * La pista è una linea centrale (punti di controllo, poi ammorbidita in curve)
 * con una larghezza: un'auto è "in pista" se sta a meno di metà larghezza dalla linea.
 * Il primo punto è il traguardo; si gira in senso orario.
 */

export const TRACK_WIDTH = 600;
export const TRACK_HEIGHT = 900;

/** Larghezza della strada. */
export const ROAD_WIDTH = 84;

/** Punti di controllo della linea centrale (la curva passa per tutti). */
export const CONTROL_POINTS = [
  [240, 800], // traguardo, sul rettilineo in basso
  [380, 805],
  [490, 770],
  [528, 680],
  [515, 575],
  [440, 500],
  [330, 478],
  [258, 425],
  [244, 335],
  [300, 262],
  [425, 245],
  [505, 180],
  [490, 95],
  [370, 62],
  [210, 72],
  [105, 140],
  [80, 290],
  [118, 455],
  [82, 610],
  [118, 740],
  [160, 792], // prima del traguardo: così si parte su un rettilineo
];

/** Quante volte si gira. */
export const LAPS = 3;

/**
 * Traguardi intermedi, come frazione del giro (0 = traguardo).
 * Vanno passati in ordine: così non si può tagliare la pista o girare al contrario.
 */
export const CHECKPOINTS = [0.25, 0.5, 0.75];
