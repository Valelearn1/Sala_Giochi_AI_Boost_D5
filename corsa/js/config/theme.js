/*
 * TEMI DELLA PISTA (solo dati)
 * Uno per versione della sala: cambiano colori, decorazioni e veicolo, non la pista.
 */

/** Versione classica: un circuito nel Regno dei Funghi, con i kart. */
export const THEME_FUNGHI = {
  name: 'Circuito dei Funghi',
  decor: 'funghi', // blocchi "?" e Super Funghi sul prato
  vehicle: 'kart',
  colors: {
    ground: '#3fbf48', // prato
    groundStripe: '#37ad40',
    road: '#6d6d78',
    curbA: '#e4202a', // cordoli bianchi e rossi
    curbB: '#ffffff',
    centerLine: 'rgba(255, 255, 255, 0.55)',
    edgeGlow: null,
    car: '#e4202a',
    carDetail: '#ffffff',
    trail: '255, 255, 255',
  },
};

/** Versione classica di notte: il circuito sotterraneo. */
export const THEME_FUNGHI_DARK = {
  ...THEME_FUNGHI,
  colors: {
    ...THEME_FUNGHI.colors,
    ground: '#0b1a3a',
    groundStripe: '#0f2148',
    road: '#2c3550',
    curbA: '#1c6cb4',
    curbB: '#6cc4ff',
    trail: '108, 196, 255',
  },
};

/** Versione anime: i Cavalieri Magici corrono sulle scope, sopra un sentiero di rune. */
export const THEME_RUNE = {
  name: 'Corsa dei Cavalieri Magici',
  decor: 'rune', // stelle e cerchi magici
  vehicle: 'broom',
  colors: {
    ground: '#151218',
    groundStripe: '#1d1b20',
    road: '#2c292f',
    curbA: '#ecc246', // bordo d'oro luminoso
    curbB: '#ecc246',
    centerLine: 'rgba(236, 194, 70, 0.35)',
    edgeGlow: 'rgba(236, 194, 70, 0.7)',
    car: '#b3122e', // mantello cremisi
    carDetail: '#ecc246',
    trail: '236, 194, 70',
  },
};

/** Versione Simpson: le strade di Springfield, con l'auto rosa di famiglia. */
export const THEME_SPRINGFIELD = {
  name: 'Gran Premio di Springfield',
  decor: 'springfield', // casette, alberi e ciambelle giganti
  vehicle: 'sedan',
  colors: {
    ground: '#57c052',
    groundStripe: '#4cb247',
    road: '#5b5f6b',
    curbA: '#d8dbe2', // marciapiede
    curbB: '#d8dbe2',
    centerLine: 'rgba(255, 217, 15, 0.9)', // riga gialla
    edgeGlow: null,
    outline: '#1b1b1b',
    car: '#f48fb1',
    carDetail: '#bfe6ff',
    trail: '255, 255, 255',
  },
};

/** Springfield di notte. */
export const THEME_SPRINGFIELD_DARK = {
  ...THEME_SPRINGFIELD,
  colors: {
    ...THEME_SPRINGFIELD.colors,
    ground: '#21532c',
    groundStripe: '#1d4a27',
    road: '#3a3f4d',
    curbA: '#8b93a7',
    curbB: '#8b93a7',
  },
};

export function getTheme(version, mode = 'light') {
  if (version === 'anime') return THEME_RUNE; // il sentiero di rune è sempre di notte
  if (version === 'simpson') return mode === 'dark' ? THEME_SPRINGFIELD_DARK : THEME_SPRINGFIELD;
  return mode === 'dark' ? THEME_FUNGHI_DARK : THEME_FUNGHI;
}
