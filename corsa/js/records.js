/*
 * RECORD DEL DISPOSITIVO
 * Il tempo totale più basso mai fatto con questo browser, salvato in localStorage.
 * updateRecord è "pura" e ha i suoi test.
 */

export const STORAGE_KEY = 'sala-record-corsa';

/**
 * @param {{ name: string, totalTime: number } | null} record
 * @param {{ name: string, totalTime: number }} result
 */
export function updateRecord(record, result) {
  if (record && result.totalTime >= record.totalTime) return { best: record, isNew: false };
  return { best: result, isNew: true };
}

export function loadRecord(storage = globalThis.localStorage) {
  try {
    const saved = JSON.parse(storage.getItem(STORAGE_KEY));
    return saved && typeof saved.totalTime === 'number' ? saved : null;
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
