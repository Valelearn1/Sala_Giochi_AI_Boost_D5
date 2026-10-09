/*
 * RECORD DEL DISPOSITIVO
 *
 * Il punteggio più alto mai fatto con questo browser, salvato in localStorage.
 * updateRecord è "pura" e ha i suoi test; loadRecord e saveRecord usano l'archivio.
 */

export const STORAGE_KEY = 'sala-record-flipper';

/**
 * @param {{ name: string, score: number } | null} record - il record attuale
 * @param {{ name: string, score: number }} result - il migliore della partita appena finita
 * @returns {{ best: object, isNew: boolean }}
 */
export function updateRecord(record, result) {
  if (record && result.score <= record.score) return { best: record, isNew: false };
  if (result.score <= 0) return { best: record, isNew: false }; // zero punti non è un record
  return { best: result, isNew: true };
}

export function loadRecord(storage = globalThis.localStorage) {
  try {
    const saved = JSON.parse(storage.getItem(STORAGE_KEY));
    return saved && typeof saved.score === 'number' ? saved : null;
  } catch {
    return null; // navigazione privata o archivio bloccato
  }
}

export function saveRecord(record, storage = globalThis.localStorage) {
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(record));
  } catch {
    // Archivio pieno o bloccato: il record vale solo per questa partita
  }
}
