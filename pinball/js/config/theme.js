/*
 * TEMA "ABISSI MARINI"
 *
 * Nome del tavolo, colori e testi. Per cambiare tema (es. spazio, giungla)
 * basta creare un altro file con la stessa forma e importarlo in main.js.
 * La disposizione degli elementi resta in table-layout.js.
 */

export const THEME = {
  tableName: 'Profondità Zero',

  colors: {
    abyssTop: '#04163a', // fondo del tavolo, in alto
    abyssBottom: '#010614', // fondo del tavolo, in basso (più profondo)
    wall: '#0c3c63',
    wallEdge: '#2fe3d3', // bordo luminoso delle pareti
    flipper: '#2fe3d3',
    flipperEdge: '#c8fffa',
    ball: '#eafcff',
    ballGlow: 'rgba(124, 249, 255, 0.55)',
    plunger: '#1b6b8f',
    gate: '#2fe3d3',
    bumper: '#ff5fa2', // meduse
    bumperGlow: 'rgba(255, 95, 162, 0.6)',
    slingshot: '#7cf9ff',
    target: '#ffd166', // esche luminose
    targetDown: '#3b4a5c',
    laneOff: '#173b5c',
    laneOn: '#7cf9ff',
    outlane: '#ff8c61',
    text: '#d8f6ff',
  },
};
