import { shuffle } from './shuffle.js';

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
 * I simboli delle carte, presi dal mondo dei giochi a piattaforme.
 * Il nome serve per l'accessibilità: uno screen reader leggerà "fungo"
 * invece del codice dell'emoji.
 * Ne servono almeno 18, cioè le coppie della griglia 6x6.
 */
export const SYMBOLS = [
  { emoji: '🍄', name: 'fungo' },
  { emoji: '⭐', name: 'stella' },
  { emoji: '🪙', name: 'moneta' },
  { emoji: '🐢', name: 'tartaruga' },
  { emoji: '👻', name: 'fantasma' },
  { emoji: '🔥', name: 'fuoco' },
  { emoji: '🏰', name: 'castello' },
  { emoji: '🚩', name: 'bandiera' },
  { emoji: '👑', name: 'corona' },
  { emoji: '🔑', name: 'chiave' },
  { emoji: '💣', name: 'bomba' },
  { emoji: '🌸', name: 'fiore' },
  { emoji: '☁️', name: 'nuvola' },
  { emoji: '🦖', name: 'dinosauro' },
  { emoji: '🐟', name: 'pesce' },
  { emoji: '🌋', name: 'vulcano' },
  { emoji: '💎', name: 'gemma' },
  { emoji: '🌵', name: 'cactus' },
];

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
 * Crea un mazzo mescolato con `pairCount` coppie.
 *
 * 1. sceglie a caso quali simboli usare (così ogni partita è diversa);
 * 2. crea due carte per ogni simbolo;
 * 3. mescola tutte le carte con Fisher-Yates.
 *
 * Ogni carta ha un `id` unico, che corrisponde alla sua posizione sul tavolo.
 */
export function createDeck(pairCount, random = Math.random) {
  if (pairCount > SYMBOLS.length) {
    throw new Error(`Servono ${pairCount} simboli, ma ce ne sono solo ${SYMBOLS.length}`);
  }

  const chosenSymbols = shuffle(SYMBOLS, random).slice(0, pairCount);
  const pairs = chosenSymbols.flatMap((symbol) => [symbol, symbol]);
  const shuffledPairs = shuffle(pairs, random);

  return shuffledPairs.map((symbol, index) => ({
    id: index,
    emoji: symbol.emoji,
    name: symbol.name,
    isFlipped: false,
    isMatched: false,
    matchedBy: null, // indice del giocatore che ha trovato la coppia
  }));
}
