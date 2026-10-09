/*
 * RECORD DEL DISPOSITIVO
 *
 * Il miglior risultato per ogni livello (4x4, 4x5, 6x6), salvato nel browser.
 * Vince il tempo più basso; a parità di tempo, meno mosse.
 *
 * updateRecord è "pura" (niente pagina, niente archivio) e ha i suoi test;
 * loadRecords e saveRecords leggono e scrivono localStorage.
 */

export const STORAGE_KEY = 'sala-record-memory';

/** Vero se `result` batte il record attuale (o se un record non c'è ancora). */
export function isBetter(result, record) {
  if (!record) return true;
  if (result.durationMs !== record.durationMs) return result.durationMs < record.durationMs;
  return result.moves < record.moves;
}

/**
 * Confronta una partita finita con i record e restituisce i record aggiornati.
 * @param {object} records - es. { '4x4': { name, durationMs, moves } }
 * @param {string} level - es. '4x4'
 * @param {{ name: string, durationMs: number, moves: number }} result
 * @returns {{ records: object, best: object, isNew: boolean }}
 */
export function updateRecord(records, level, result) {
  const current = records[level];
  if (!isBetter(result, current)) {
    return { records, best: current, isNew: false };
  }
  return { records: { ...records, [level]: result }, best: result, isNew: true };
}

/** Legge i record. Navigazione privata o archivio bloccato: nessun record, il gioco funziona lo stesso. */
export function loadRecords(storage = globalThis.localStorage) {
  try {
    const saved = JSON.parse(storage.getItem(STORAGE_KEY));
    return saved && typeof saved === 'object' ? saved : {};
  } catch {
    return {};
  }
}

export function saveRecords(records, storage = globalThis.localStorage) {
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch {
    // Archivio pieno o bloccato: il record vale solo per questa partita
  }
}
