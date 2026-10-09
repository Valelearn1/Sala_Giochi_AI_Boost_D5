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

/** Il tema del tavolo per ogni versione della sala. */
export const THEMES = {
  classica: THEME_PLATFORM,
  anime: THEME_ANIME,
};

export function getTheme(version) {
  return THEMES[version] ?? THEME_PLATFORM;
}
