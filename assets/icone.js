/*
 * ICONE DELLA VERSIONE ANIME
 *
 * Icone disegnate a mano in SVG, a linee, nello stile delle schermate di Stitch.
 * (Stitch usa il font "Material Symbols" di Google: qui niente font esterni.)
 *
 * Uso:
 * - nell'HTML: <span data-icona="bolt"></span> → assets/barre-anime.js mette l'icona;
 * - in JavaScript: import { icona } from '.../assets/icone.js'; elemento.innerHTML = icona('bolt');
 */

const PERCORSI = {
  libro: 'M3 5.5A1.5 1.5 0 0 1 4.5 4H10a2 2 0 0 1 2 2v14a2 2 0 0 0-2-2H3zM21 5.5A1.5 1.5 0 0 0 19.5 4H14a2 2 0 0 0-2 2v14a2 2 0 0 1 2-2h7z',
  carte: 'M4 7.5A1.5 1.5 0 0 1 5.5 6h7A1.5 1.5 0 0 1 14 7.5v12a1.5 1.5 0 0 1-1.5 1.5h-7A1.5 1.5 0 0 1 4 19.5zM10 3.5A1.5 1.5 0 0 1 11.5 2h7A1.5 1.5 0 0 1 20 3.5v12a1.5 1.5 0 0 1-1.5 1.5H17',
  gamepad: 'M7 7h10a5 5 0 0 1 0 10c-1.6 0-2.5-1-3.5-2h-3C9.5 16 8.6 17 7 17A5 5 0 0 1 7 7zM7.5 10v4M5.5 12h4M16 11h.01M18 13h.01',
  bacchetta: 'M4 20 15 9M14 4v3M12.5 5.5h3M19 9v2M18 10h2M18 3.5v1.5M17.25 4.25h1.5',
  fulmine: 'M13 2 4.5 13.5H11L10 22l8.5-11.5H12z',
  spunta: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM8 12.5l3 3 5-6',
  rigioca: 'M4.5 12a7.5 7.5 0 1 0 2.2-5.3M4 3.5V8h4.5',
  audio: 'M4 9h3.5L12 5.5v13L7.5 15H4zM15.5 9.5a3.5 3.5 0 0 1 0 5M18 7a7 7 0 0 1 0 10',
  muto: 'M4 9h3.5L12 5.5v13L7.5 15H4zM16 9.5l5 5M21 9.5l-5 5',
  persona: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4.5 20.5a7.5 7.5 0 0 1 15 0',
  scudo: 'M12 3 19.5 6v5.5c0 4.5-3.2 7.8-7.5 9.5-4.3-1.7-7.5-5-7.5-9.5V6z',
  luna: 'M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z',
  sole: 'M12 16.5a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9zM12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4',
  scintilla: 'M12 3l1.8 5.7L19.5 10.5l-5.7 1.8L12 18l-1.8-5.7L4.5 10.5l5.7-1.8zM19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8z',
  orologio: 'M12 21a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM12 9v4l2.5 2M9.5 2.5h5',
  mosse: 'M7 20V4M3.5 7.5 7 4l3.5 3.5M17 4v16M13.5 16.5 17 20l3.5-3.5',
  bersaglio: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 16.5a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9zM12 12h.01',
  trofeo: 'M8 4h8v5a4 4 0 0 1-8 0zM8 6H5a3 3 0 0 0 3 4.5M16 6h3a3 3 0 0 1-3 4.5M12 13v4M8.5 21h7M10 17h4',
  megafono: 'M3.5 10v4H6l7 4V6L6 10zM16.5 9a3.5 3.5 0 0 1 0 6',
  info: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 11v5M12 8h.01',
  freccia: 'M5 12h14M13 6l6 6-6 6',
  indietro: 'M19 12H5M11 6l-6 6 6 6',
  gruppo: 'M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM2.5 20a6.5 6.5 0 0 1 13 0M16 4.5a3.5 3.5 0 0 1 0 6.5M18.5 20a6.5 6.5 0 0 0-3-5.5',
  matita: 'M4 20h4L19 9l-4-4L4 16zM13.5 6.5l4 4',
  fiamma: 'M12 3c1 3.5 5 5.5 5 10a5 5 0 0 1-10 0c0-2.5 1.5-4 2.5-5 .5 2 1.5 3 2.5 3 0-3-1-5.5 0-8z',
};

/** Restituisce l'SVG di un'icona (stessa altezza del testo, colore del testo). */
export function icona(nome, misura = 20) {
  const percorso = PERCORSI[nome];
  if (!percorso) return '';
  return `<svg class="icona" viewBox="0 0 24 24" width="${misura}" height="${misura}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${percorso}"/></svg>`;
}

/** Riempie tutti gli elementi <span data-icona="nome" data-misura="18"> della pagina. */
export function riempiIcone(radice = document) {
  for (const elemento of radice.querySelectorAll('[data-icona]')) {
    elemento.innerHTML = icona(elemento.dataset.icona, Number(elemento.dataset.misura) || 20);
  }
}
