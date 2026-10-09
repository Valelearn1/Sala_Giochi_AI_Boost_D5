/**
 * Mescola un array con l'algoritmo di Fisher-Yates.
 *
 * Si parte dall'ultima posizione e la si scambia con una posizione casuale
 * tra 0 e se stessa (inclusa), poi si passa alla penultima, e così via.
 * Ogni ordinamento possibile ha la stessa probabilità di uscire.
 *
 * Restituisce un NUOVO array: quello originale non viene modificato.
 *
 * @param {Array} items - gli elementi da mescolare
 * @param {() => number} random - funzione che restituisce un numero in [0, 1).
 *   Di default è Math.random; nei test si può passare una funzione prevedibile.
 * @returns {Array} una copia mescolata
 */
export function shuffle(items, random = Math.random) {
  const result = [...items];

  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
}
