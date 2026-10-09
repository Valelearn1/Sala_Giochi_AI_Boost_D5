/*
 * TEMI DEL TAVOLO
 *
 * Nome, colori e "stile" degli elementi disegnati sul Canvas.
 * Ce n'è uno per ogni versione della sala (vedi assets/tema.js):
 * - classica → "Regno dei Funghi" (platform 8-bit: cielo, mattoni, Super Funghi, monete);
 * - anime    → "Sfera Anti-Magia" (cerchi magici, scintille di mana, trifoglio).
 * C'è anche un terzo tema pronto, "abissi marini", non usato da nessuna versione:
 * si può collegare in THEMES per provarlo.
 * La disposizione degli elementi resta in table-layout.js: cambia solo l'aspetto.
 * Per un tema nuovo basta aggiungere qui un oggetto con la stessa forma.
 */

/** Tema alternativo pronto all'uso: abissi marini. */
export const THEME_ABISSI = {
  tableName: 'Profondità Zero',
  bumperStyle: 'jellyfish', // meduse
  decor: 'sonar', // cerchi del sonar attorno ai bumper
  particleColor: '124, 249, 255', // plancton (rosso, verde, blu)

  colors: {
    abyssTop: '#04163a', // fondo del tavolo, in alto
    abyssBottom: '#010614', // fondo del tavolo, in basso (più profondo)
    light: '124, 249, 255', // luce che filtra dall'alto
    wall: '#0c3c63',
    wallEdge: '#2fe3d3', // bordo luminoso delle pareti
    flipperLeft: '#2fe3d3',
    flipperRight: '#2fe3d3',
    flipperEdge: '#c8fffa',
    ball: '#eafcff',
    ballCore: '#ffffff',
    ballRim: '#8fc9df',
    ballGlow: 'rgba(124, 249, 255, 0.55)',
    plunger: '#1b6b8f',
    gate: '#2fe3d3',
    bumper: '#ff5fa2',
    bumperLight: '#ffc2dc',
    bumperDark: '#8a1f57',
    bumperGlow: 'rgba(255, 95, 162, 0.6)',
    trail: '124, 249, 255', // scia dietro la pallina (r, g, b)
    hitRing: '#ffffff', // onda d'urto dei bumper colpiti
    slingshot: '#7cf9ff',
    slingshotFillA: '#0b2e52',
    slingshotFillB: '#155a7e',
    target: '#ffd166',
    targetDown: '#3b4a5c',
    laneOff: '#173b5c',
    laneOn: '#7cf9ff',
    outlane: '#ff8c61',
    post: '#7cf9ff',
    paint: 'rgba(124, 249, 255, 0.14)', // nome del tavolo dipinto sul campo
  },
};

/** Versione classica: platform 8-bit nel Regno dei Funghi. */
export const THEME_PLATFORM = {
  tableName: 'Regno dei Funghi',
  bumperStyle: 'mushroom', // Super Funghi rossi a pois bianchi
  decor: 'platform', // nuvole e colline sullo sfondo
  wallPattern: 'bricks', // pareti di mattoni
  particleColor: '255, 255, 255', // piccole scintille bianche

  colors: {
    abyssTop: '#6b8cff', // cielo
    abyssBottom: '#4a7cf0',
    light: '255, 255, 255',
    wall: '#c84c0c',
    wallEdge: '#000000',
    flipperLeft: '#e4202a', // rosso come Mario
    flipperRight: '#12a838', // verde come Luigi
    flipperEdge: '#ffffff',
    ball: '#e8e8f0',
    ballCore: '#ffffff',
    ballRim: '#8a8aa0',
    ballGlow: 'rgba(0, 0, 0, 0.35)',
    plunger: '#00a800',
    gate: '#f8b800',
    bumper: '#e4202a',
    bumperLight: '#ff7a70',
    bumperDark: '#8a0a10',
    bumperGlow: 'rgba(255, 255, 255, 0.45)',
    trail: '255, 255, 255', // scia dietro la pallina (r, g, b)
    hitRing: '#ffffff', // onda d'urto dei bumper colpiti
    slingshot: '#ffffff',
    slingshotFillA: '#005800', // verde dei tubi
    slingshotFillB: '#00a800',
    target: '#f8b800', // monete d'oro
    targetDown: '#3c5cb8',
    laneOff: '#3c5cb8',
    laneOn: '#f8b800',
    outlane: '#e4202a',
    post: '#f8b800',
    paint: 'rgba(255, 255, 255, 0.28)',
  },
};

/** Versione classica in modalità scura: il livello sotterraneo (nero e mattoni blu). */
export const THEME_PLATFORM_DARK = {
  ...THEME_PLATFORM,
  decor: 'underground', // niente nuvole né colline sottoterra
  particleColor: '108, 196, 255',
  colors: {
    ...THEME_PLATFORM.colors,
    abyssTop: '#000000',
    abyssBottom: '#050a1a',
    light: '108, 196, 255',
    wall: '#1c6cb4', // mattoni blu
    brickLight: '#6cc4ff',
    brickMortar: '#000814',
    targetDown: '#1a2a4a',
    laneOff: '#1a2a4a',
    trail: '108, 196, 255',
    paint: 'rgba(108, 196, 255, 0.22)',
  },
};

/** Versione anime: arena dei grimori (cremisi, oro, smeraldo su fondo scuro). */
export const THEME_ANIME = {
  tableName: 'Sfera Anti-Magia',
  bumperStyle: 'sigil', // cerchi magici
  paintFont: { family: '"Syne", sans-serif', weight: 800 }, // font del nome dipinto sul tavolo
  decor: 'clover', // un grande trifoglio inciso sul tavolo
  particleColor: '236, 194, 70', // scintille di mana dorate

  colors: {
    abyssTop: '#211f24',
    abyssBottom: '#0f0d12',
    light: '236, 194, 70',
    wall: '#2c292f',
    wallEdge: '#ecc246',
    flipperLeft: '#b3122e', // aletta sinistra cremisi
    flipperRight: '#00b56b', // aletta destra smeraldo
    flipperEdge: '#ffe08e',
    ball: '#3b383e', // sfera scura con un cuore di luce
    ballCore: '#ffffff',
    ballRim: '#0f0d12',
    ballGlow: 'rgba(255, 255, 255, 0.45)',
    plunger: '#5b4040',
    gate: '#ecc246',
    bumper: '#b3122e',
    bumperLight: '#ffb3b3',
    bumperDark: '#410009',
    bumperGlow: 'rgba(236, 194, 70, 0.45)',
    trail: '236, 194, 70', // scia di mana dorata
    hitRing: '#ffe08e',
    slingshot: '#4edf91',
    slingshotFillA: '#1d1b20',
    slingshotFillB: '#373439',
    target: '#ecc246',
    targetDown: '#3b383e',
    laneOff: '#373439',
    laneOn: '#4edf91',
    outlane: '#ff5a6e',
    post: '#ecc246',
    paint: 'rgba(236, 194, 70, 0.12)',
  },
};

/** Versione Simpson: la centrale nucleare di Springfield (cielo, ciambelle e uranio). */
export const THEME_SIMPSON = {
  tableName: 'Centrale Nucleare',
  bumperStyle: 'donut', // ciambelle rosa con le codette
  paintFont: { family: '"Luckiest Guy", sans-serif', weight: 400 },
  decor: 'springfield', // nuvole e torri di raffreddamento sullo sfondo
  wallPattern: 'cartoon', // pareti piene con il contorno nero, senza alone
  particleColor: '124, 252, 0', // puntini radioattivi verdi

  colors: {
    abyssTop: '#7fcbff', // cielo di Springfield
    abyssBottom: '#4fb3f6',
    light: '255, 255, 255',
    wall: '#8e9aa6', // cemento della centrale
    wallEdge: '#1b1b1b',
    flipperLeft: '#f26b21', // arancio come la maglietta di Bart
    flipperRight: '#2b6fd6', // blu come i capelli di Marge
    flipperEdge: '#1b1b1b',
    ball: '#7cfc00', // una pallina di uranio, verde e luminosa
    ballCore: '#eaffd0',
    ballRim: '#2e7d32',
    ballGlow: 'rgba(124, 252, 0, 0.6)',
    plunger: '#5f6b73',
    gate: '#ffd90f',
    bumper: '#f48fb1', // glassa rosa
    bumperLight: '#ffd1e0',
    bumperDark: '#c2185b',
    bumperGlow: 'rgba(255, 255, 255, 0.45)',
    dough: '#f4b860', // impasto della ciambella
    trail: '124, 252, 0',
    hitRing: '#ffffff',
    slingshot: '#1b1b1b',
    slingshotFillA: '#ffd90f',
    slingshotFillB: '#f2c200',
    target: '#7cfc00', // barre di uranio
    targetDown: '#5f6b73',
    laneOff: '#9fb3c8',
    laneOn: '#ffd90f',
    outlane: '#f26b21',
    post: '#ffd90f',
    paint: 'rgba(27, 27, 27, 0.16)',
  },
};

/** Versione Simpson di notte: cielo blu scuro, la centrale illuminata. */
export const THEME_SIMPSON_DARK = {
  ...THEME_SIMPSON,
  colors: {
    ...THEME_SIMPSON.colors,
    abyssTop: '#1b2a52',
    abyssBottom: '#0f1a38',
    light: '124, 252, 0',
    wall: '#4d5866',
    wallEdge: '#070b1a',
    laneOff: '#33415f',
    targetDown: '#33415f',
    paint: 'rgba(255, 255, 255, 0.12)',
  },
};

/** Il tema del tavolo per ogni versione della sala. */
export const THEMES = {
  classica: THEME_PLATFORM,
  anime: THEME_ANIME,
  simpson: THEME_SIMPSON,
};

/**
 * Il tema del tavolo per una versione e una modalità (chiara/scura).
 * Il tavolo anime è sempre scuro; quello classico ha il suo "sotterraneo",
 * quello dei Simpson la sua Springfield di notte.
 */
export function getTheme(version, mode = 'light') {
  if (version === 'simpson') return mode === 'dark' ? THEME_SIMPSON_DARK : THEME_SIMPSON;
  if (version !== 'anime' && mode === 'dark') return THEME_PLATFORM_DARK;
  return THEMES[version] ?? THEME_PLATFORM;
}
