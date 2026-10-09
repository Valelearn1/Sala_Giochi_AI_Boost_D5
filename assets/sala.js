/*
 * GIOCHI IMPORTATI NELLA SALA
 *
 * La pagina iniziale elenca i giochi "di casa" direttamente nell'HTML.
 * Questo modulo aggiunge in fondo all'elenco i giochi importati dalle sale
 * dei compagni (con l'agente bibliotecario), leggendoli da giochi.json:
 * così basta aggiungere una voce lì e la sala trova il gioco da sola.
 *
 * Ogni scheda dice da quale repository arriva il gioco.
 */

const CATALOGO = 'giochi.json';

async function caricaCatalogo() {
  try {
    const risposta = await fetch(CATALOGO, { cache: 'no-cache' });
    if (!risposta.ok) return [];
    const dati = await risposta.json();
    return Array.isArray(dati.giochi) ? dati.giochi : [];
  } catch {
    return []; // pagina aperta senza server o file mancante: solo i giochi di casa
  }
}

/** "https://github.com/compagna/sala-giochi" → "compagna/sala-giochi" */
function nomeRepository(indirizzo) {
  return indirizzo.replace(/^https:\/\/github\.com\//, '').replace(/\.git$/, '');
}

/** Crea un elemento con classe e testo (textContent: i testi del catalogo non diventano mai HTML). */
function elemento(tag, classe, testo) {
  const nodo = document.createElement(tag);
  if (classe) nodo.className = classe;
  if (testo !== undefined) nodo.textContent = testo;
  return nodo;
}

/** Icona pixel: un tubo verde, "arriva da un'altra sala". */
function iconaTubo() {
  const blocco = elemento('span', 'level-block level-block--pipe only-classica');
  blocco.setAttribute('aria-hidden', 'true');
  blocco.innerHTML = `
    <svg class="pixel-icon" viewBox="0 0 10 10" width="36" height="36">
      <path fill="#004a00" d="M0 0h10v3H0zM1 3h8v7H1z" />
      <path fill="#00a800" d="M1 1h8v1H1zM2 3h6v7H2z" />
      <path fill="#8ce048" d="M2 1h2v1H2zM3 3h1v7H3z" />
    </svg>`;
  return blocco;
}

function copertinaAnime() {
  const copertina = elemento('span', 'grimoire-cover grimoire-cover--crimson only-anime');
  copertina.setAttribute('aria-hidden', 'true');
  copertina.innerHTML = '<span class="grimoire-book"><span class="g-clover"></span></span>';
  return copertina;
}

/** La scheda di un gioco importato, con la stessa struttura di quelle di casa. */
function creaScheda(gioco, numero) {
  const voce = document.createElement('li');
  const link = elemento('a', 'level level--imported');
  link.href = `${gioco.cartella.replace(/\/?$/, '/')}`;

  const testi = elemento('span', 'level-text');
  const tags = elemento('span', 'level-meta only-anime');
  tags.append(elemento('span', 'anime-kicker', 'Da un compagno'));
  if (gioco.giocatori) tags.append(elemento('span', 'level-players', `${gioco.giocatori} giocatori`));

  const titolo = elemento('span', 'level-title');
  const numeroLivello = elemento('span', 'level-world only-classica', `1-${numero}`);
  titolo.append(numeroLivello, ` ${gioco.titolo}`);

  const descrizione = elemento('span', 'level-desc', gioco.descrizione ?? '');
  const repository = gioco.provenienza?.repository ?? '';
  const origine = elemento('span', 'level-source', `Arriva da ${nomeRepository(repository)}`);
  if (gioco.provenienza?.autore) origine.textContent += ` · di ${gioco.provenienza.autore}`;

  testi.append(tags, titolo, descrizione, origine);

  const invito = elemento('span', 'level-cta');
  invito.setAttribute('aria-hidden', 'true');
  invito.append(elemento('span', 'only-classica', 'Gioca'), elemento('span', 'only-anime', '▷ Apri grimorio'));

  link.append(copertinaAnime(), iconaTubo(), testi, invito);
  voce.append(link);
  return voce;
}

async function mostraGiochiImportati() {
  const elenco = document.querySelector('.levels');
  if (!elenco) return;
  const giochi = await caricaCatalogo();
  const giaPresenti = elenco.children.length;
  giochi.forEach((gioco, indice) => {
    if (gioco.titolo && gioco.cartella) elenco.append(creaScheda(gioco, giaPresenti + indice + 1));
  });
  // Versione anime: "N nel tomo" sopra l'elenco
  const conta = document.querySelector('[data-conta-giochi]');
  if (conta) conta.textContent = elenco.children.length;
}

mostraGiochiImportati();
