import { shuffle } from './shuffle.js';
import { getCharacters } from './characters.js';

/**
 * Livelli di difficoltà: colonne × righe della griglia.
 * Il numero di coppie è sempre (colonne × righe) / 2.
 */
export const DIFFICULTIES = {
  '4x4': { label: 'Facile', columns: 4, rows: 4 },
  '4x5': { label: 'Medio', columns: 4, rows: 5 },
  '6x6': { label: 'Difficile', columns: 6, rows: 6 },
};

/**
 * Il mazzo predefinito: i personaggi della versione classica.
 * Gli altri mazzi sono in characters.js.
 */
export const SYMBOLS = getCharacters('classica');

/**
 * Restituisce quante coppie servono per una difficoltà (es. '4x4' → 8).
 */
export function getPairCount(difficultyKey) {
  const difficulty = DIFFICULTIES[difficultyKey];
  if (!difficulty) {
    throw new Error(`Difficoltà sconosciuta: ${difficultyKey}`);
  }
  return (difficulty.columns * difficulty.rows) / 2;
}

/**
 * Crea un mazzo mescolato con `pairCount` coppie, prese da `symbols`
 * (di solito i personaggi della versione scelta).
 *
 * 1. sceglie a caso quali simboli usare (così ogni partita è diversa);
 * 2. crea due carte per ogni simbolo;
 * 3. mescola tutte le carte con Fisher-Yates.
 *
 * Ogni carta ha un `id` unico, che corrisponde alla sua posizione sul tavolo.
 */
export function createDeck(pairCount, random = Math.random, symbols = SYMBOLS) {
  if (pairCount > symbols.length) {
    throw new Error(`Servono ${pairCount} simboli, ma ce ne sono solo ${symbols.length}`);
  }

  const chosenSymbols = shuffle(symbols, random).slice(0, pairCount);
  const pairs = chosenSymbols.flatMap((symbol) => [symbol, symbol]);
  const shuffledPairs = shuffle(pairs, random);

  return shuffledPairs.map((symbol, index) => ({
    id: index,
    emoji: symbol.emoji,
    name: symbol.name,
    image: symbol.image ?? null,
    isFlipped: false,
    isMatched: false,
    matchedBy: null, // indice del giocatore che ha trovato la coppia
  }));
}
