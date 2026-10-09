/*
 * PROVA: disposizione del tavolo "alla Space Cadet" (vista dall'alto)
 *
 * Parte dal tavolo della sala (pinball/js/config/table-layout.js) e cambia
 * solo ciò che serve per ricordare 3D Pinball Space Cadet:
 * - una corsia curva a destra: il lancio la percorre fino in cima;
 * - una "tasca" a sinistra con tre bumper piccoli;
 * - tre bersagli sul lato destro del campo.
 * È una prova grafica: non è collegata alla sala.
 */

import * as base from '../../pinball/js/config/table-layout.js';

export const TABLE_WIDTH = base.TABLE_WIDTH;
export const TABLE_HEIGHT = base.TABLE_HEIGHT;

/** Punti lungo un arco di cerchio, da `fromDeg` a `toDeg` (0° = destra, 90° = giù). */
function arcPoints(cx, cy, radius, fromDeg, toDeg, steps) {
  return Array.from({ length: steps + 1 }, (_, i) => {
    const angle = ((fromDeg + ((toDeg - fromDeg) * i) / steps) * Math.PI) / 180;
    return [cx + radius * Math.cos(angle), cy + radius * Math.sin(angle)];
  });
}

export const WALLS = [
  ...base.WALLS,
  // Corsia curva a destra, parallela alla cupola. In fondo resta aperta verso il campo:
  // se arrivasse fino al tunnel di lancio, la pallina resterebbe chiusa contro il cancello.
  { id: 'orbit-guide', thickness: 12, points: arcPoints(300, 300, 240, 300, 345, 8) },
  // Parete destra della tasca dei bumper a sinistra
  { id: 'pocket-wall', thickness: 12, points: [[178, 540], [178, 670]] },
];

// I tre bumper in alto restano; quelli laterali diventano la tasca a sinistra
export const BUMPERS = [
  ...base.BUMPERS.slice(0, 3),
  { id: 3, x: 66, y: 575, radius: 18, points: 150 },
  { id: 4, x: 128, y: 600, radius: 18, points: 150 },
  { id: 5, x: 76, y: 640, radius: 18, points: 150 },
];

// Solo i paletti in alto: quelli in basso chiuderebbero il passaggio accanto alla tasca
export const POSTS = base.POSTS.slice(0, 2);

export const SLINGSHOTS = base.SLINGSHOTS;

// Tre bersagli sul lato destro, come i "booster" di Space Cadet
export const TARGETS = [330, 372, 414].map((x, id) => ({ id, x, y: 565, width: 30, height: 12, points: 250 }));

export const TOP_LANES = base.TOP_LANES;
export const OUTLANES = base.OUTLANES;
export const FLIPPERS = base.FLIPPERS;
export const SHOOTER = base.SHOOTER;
export const DRAIN = base.DRAIN;
