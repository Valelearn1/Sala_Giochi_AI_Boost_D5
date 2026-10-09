/*
 * Matter.js è distribuito come script "classico" (non come ES module):
 * index.html lo carica con <script src="lib/matter.min.js"> e lui crea la
 * variabile globale window.Matter. Qui la esportiamo, così gli altri file
 * possono scrivere: import { Matter } from './matter.js';
 */

if (!window.Matter) {
  throw new Error('Matter.js non è stato caricato: controlla lib/matter.min.js in index.html');
}

export const Matter = window.Matter;
