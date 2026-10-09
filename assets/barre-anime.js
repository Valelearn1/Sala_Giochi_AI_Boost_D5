/*
 * BARRE DELLA VERSIONE ANIME (come nelle schermate di Stitch)
 *
 * Aggiunge a ogni pagina, visibili solo nella versione anime (classe only-anime):
 * - in alto: logo, "SALA GIOCHI •" e il nome della pagina;
 * - in basso: la barra di navigazione Hub · Memory · Flipper.
 * Riempie anche le icone [data-icona] scritte nell'HTML.
 *
 * Ogni pagina dice chi è con due attributi sul <body>:
 *   data-pagina="hub|memory|flipper"   e   data-titolo-anime="Grimoire Memory"
 */

import { icona, riempiIcone } from './icone.js';

const radice = document.body.dataset.radice ?? '../'; // percorso della pagina iniziale
const pagina = document.body.dataset.pagina;

const VOCI = [
  { id: 'hub', testo: 'Hub', icona: 'libro', href: '' },
  { id: 'memory', testo: 'Memory', icona: 'carte', href: 'memory/' },
  { id: 'flipper', testo: 'Flipper', icona: 'gamepad', href: 'pinball/' },
];

/** Logo e titolo, come la parte sinistra della barra in alto di Stitch. */
function creaMarchio(titolo) {
  const link = document.createElement('a');
  link.className = 'appbar-brand only-anime';
  link.href = radice;
  link.setAttribute('aria-label', 'Sala giochi: torna all\'elenco dei giochi');
  link.innerHTML = `
    <span class="appbar-logo g-clover" aria-hidden="true"></span>
    <span class="appbar-texts">
      <span class="appbar-kicker">Sala giochi <span class="appbar-dot" aria-hidden="true"></span></span>
      <span class="appbar-title"></span>
    </span>`;
  link.querySelector('.appbar-title').textContent = titolo;
  return link;
}

/** Barra di navigazione in basso. */
function creaNavigazione() {
  const nav = document.createElement('nav');
  nav.className = 'anime-nav only-anime';
  nav.setAttribute('aria-label', 'Giochi della sala');
  nav.innerHTML = VOCI.map((voce) => `
    <a class="anime-nav-item${voce.id === pagina ? ' is-active' : ''}" href="${radice}${voce.href}"${voce.id === pagina ? ' aria-current="page"' : ''}>
      ${icona(voce.icona, 22)}
      <span>${voce.testo}</span>
    </a>`).join('');
  return nav;
}

function montaBarre() {
  const titolo = document.body.dataset.titoloAnime ?? 'Sala giochi';
  const barraGioco = document.querySelector('.topbar');

  if (barraGioco) {
    // Nei giochi: logo e titolo all'inizio della barra che c'è già (con i suoi pulsanti)
    barraGioco.prepend(creaMarchio(titolo));
  } else {
    // Nella pagina iniziale: una barra tutta nuova, con il pulsante chiaro/scuro
    const barra = document.createElement('header');
    barra.className = 'anime-appbar only-anime';
    barra.append(creaMarchio(titolo));
    const azioni = document.querySelector('.hub-actions .mode-toggle')?.cloneNode(true);
    if (azioni) barra.append(azioni);
    document.body.prepend(barra);
  }

  document.body.append(creaNavigazione());
  riempiIcone();
}

montaBarre();
