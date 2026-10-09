/*
 * DISPOSIZIONE DEL TAVOLO "PROFONDITÀ ZERO"
 *
 * Questo file contiene solo DATI: dove si trova ogni elemento del tavolo.
 * Fisica (physics.js) e disegno (render.js) leggono da qui, quindi ciò che
 * si vede coincide con ciò che urta la pallina.
 *
 * Sistema di coordinate: il tavolo è largo 600 e alto 1100 unità.
 * x cresce verso destra, y cresce verso il BASSO (come nel Canvas).
 *
 * Le pareti sono "polilinee": elenchi di punti uniti da segmenti spessi.
 * Le coordinate indicano il CENTRO della linea; lo spessore si allarga
 * per metà da una parte e per metà dall'altra.
 */

export const TABLE_WIDTH = 600;
export const TABLE_HEIGHT = 1100;

/** Asse centrale del campo di gioco (a sinistra della corsia di lancio). */
const CENTER_X = 276;

/** Restituisce la x simmetrica rispetto all'asse centrale del campo. */
function mirrorX(x) {
  return 2 * CENTER_X - x;
}

/** Punti lungo un arco di cerchio, da `fromDeg` a `toDeg` (0° = destra, 90° = giù). */
function arcPoints(cx, cy, radius, fromDeg, toDeg, steps) {
  const points = [];
  for (let i = 0; i <= steps; i++) {
    const angle = ((fromDeg + ((toDeg - fromDeg) * i) / steps) * Math.PI) / 180;
    points.push([cx + radius * Math.cos(angle), cy + radius * Math.sin(angle)]);
  }
  return points;
}

/* --- Pareti --------------------------------------------------------------- */

export const WALLS = [
  // Bordo esterno: sinistra, cupola in alto, destra
  {
    id: 'outer',
    thickness: 40,
    points: [
      [0, 1100],
      ...arcPoints(300, 300, 300, 180, 360, 24),
      [600, 1100],
    ],
  },
  // Separatore della corsia di lancio (a destra)
  { id: 'shooter-wall', thickness: 16, points: [[540, 1100], [540, 300]] },

  // Guide basse a sinistra: separano la corsia di uscita (esterna) da quella di rientro
  // e portano la pallina sull'aletta
  { id: 'left-guide', thickness: 16, points: [[60, 740], [60, 900], [178, 956]] },
  { id: 'right-guide', thickness: 16, points: [[mirrorX(60), 740], [mirrorX(60), 900], [mirrorX(178), 956]] },

  // Guide delle tre corsie superiori
  { id: 'lane-guide-1', thickness: 12, points: [[186, 105], [186, 165]] },
  { id: 'lane-guide-2', thickness: 12, points: [[246, 105], [246, 165]] },
  { id: 'lane-guide-3', thickness: 12, points: [[306, 105], [306, 165]] },
  { id: 'lane-guide-4', thickness: 12, points: [[366, 105], [366, 165]] },
];

/* --- Alette --------------------------------------------------------------- */

// restAngle / upAngle: angolo dell'aletta a riposo e alzata (radianti, positivo = senso orario)
export const FLIPPERS = [
// Lunghezza 82: tra le punte a riposo resta uno spazio appena più largo della pallina
  { id: 'left', pivot: [186, 960], length: 82, baseRadius: 13, tipRadius: 7, restAngle: 0.52, upAngle: -0.5 },
  { id: 'right', pivot: [mirrorX(186), 960], length: 82, baseRadius: 13, tipRadius: 7, restAngle: Math.PI - 0.52, upAngle: Math.PI + 0.5 },
];

/* --- Bumper (respingenti rotondi) ----------------------------------------- */

export const BUMPERS = [
  { id: 0, x: 216, y: 300, radius: 32, points: 100 },
  { id: 1, x: 336, y: 300, radius: 32, points: 100 },
  { id: 2, x: 276, y: 395, radius: 32, points: 100 },
  // Due bumper a metà campo, uno per lato: tengono la pallina in alto più a lungo
  { id: 3, x: 128, y: 500, radius: 26, points: 100 },
  { id: 4, x: mirrorX(128), y: 500, radius: 26, points: 100 },
];

/* --- Paletti di rimbalzo (non danno punti) -------------------------------- */

export const POSTS = [
  { x: 120, y: 330, radius: 9 },
  { x: mirrorX(120), y: 330, radius: 9 },
  { x: 205, y: 660, radius: 8 },
  { x: mirrorX(205), y: 660, radius: 8 },
];

/* --- Slingshot (triangoli sopra le alette) -------------------------------- */

// Il lato "attivo" che respinge la pallina è quello da `a` a `c` (rivolto verso il centro)
export const SLINGSHOTS = [
  { id: 'left', a: [110, 770], b: [110, 880], c: [165, 905], points: 50 },
  { id: 'right', a: [mirrorX(110), 770], b: [mirrorX(110), 880], c: [mirrorX(165), 905], points: 50 },
  // Kicker in alto sui lati: la pallina che scende lungo le pareti viene rispedita verso i bumper
  // (senza, dopo il lancio cadeva dritta nella corsia di uscita sinistra)
  { id: 'upper-left', a: [20, 330], b: [20, 430], c: [78, 430], points: 50 },
  { id: 'upper-right', a: [mirrorX(20), 330], b: [mirrorX(20), 430], c: [mirrorX(78), 430], points: 50 },
];

/* --- Bersagli abbattibili ------------------------------------------------- */

export const TARGETS = [216, 256, 296, 336].map((x, id) => ({
  id,
  x,
  y: 600,
  width: 30,
  height: 12,
  points: 250,
}));

/* --- Corsie superiori con luci (rollover) --------------------------------- */

export const TOP_LANES = [216, 276, 336].map((x, id) => ({
  id,
  x,
  y: 140,
  width: 36,
  height: 30,
  points: 150,
}));

/* --- Corsie laterali di uscita (outlane) ---------------------------------- */

export const OUTLANES = [
  { id: 'left', x: 36, y: 820, width: 26, height: 40, points: 500 },
  { id: 'right', x: mirrorX(36), y: 820, width: 26, height: 40, points: 500 },
];

/* --- Lanciatore e scolo --------------------------------------------------- */

export const SHOOTER = {
  laneX: 564, // centro della corsia di lancio
  laneLeft: 548,
  laneRight: 580,
  ballStartY: 1040, // dove appare la pallina nuova
  plungerTopY: 1052, // superficie del pistone
  gateY: 290, // in alto: dopo il lancio si chiude, così la pallina non rientra
};

// Sensore in fondo: quando la pallina lo tocca, è persa
export const DRAIN = { x: 276, y: 1092, width: 540, height: 16 };
