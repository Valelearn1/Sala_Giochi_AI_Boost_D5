/*
 * VERIFICA DI UN GIOCO DELLA SALA
 *
 * Controlla che un gioco si possa mettere nella sala senza rischi e senza
 * rompere niente. NON esegue mai il codice del gioco: lo legge soltanto.
 *
 * Uso (dalla cartella principale della repo):
 *   node strumenti/verifica.js giochi/nome-gioco   → verifica un gioco importato
 *   node strumenti/verifica.js --tutti             → verifica tutti i giochi della sala
 *
 * Esce con codice 0 se tutto va bene, 1 se c'è almeno un errore.
 *
 * Regole (un gioco importato deve rispettarle tutte):
 *  1. ha un index.html nella sua cartella;
 *  2. contiene solo tipi di file ammessi, senza file troppo grandi;
 *  3. non carica niente da Internet (niente CDN, niente font o script esterni);
 *  4. i percorsi restano dentro la sua cartella;
 *  5. non contiene codice sospetto (eval, invio di dati verso l'esterno, ecc.);
 *  6. dichiara da quale repository arriva (in giochi.json).
 */

import { readFileSync, readdirSync, lstatSync, existsSync } from 'node:fs';
import { join, relative, resolve, extname, dirname, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

/** I giochi "di casa": possono usare i file comuni in assets/ (tema, font, suoni). */
const GIOCHI_INTERNI = ['memory', 'pinball', 'corsa'];

const ESTENSIONI_AMMESSE = new Set([
  '.html', '.css', '.js', '.mjs', '.json', '.md', '.txt',
  '.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.ico',
  '.mp3', '.ogg', '.wav', '.ttf', '.otf', '.woff', '.woff2',
]);
const MAX_FILE_BYTES = 5 * 1024 * 1024; // 5 MB per file
const MAX_TOTALE_BYTES = 15 * 1024 * 1024; // 15 MB per gioco
const CARTELLE_VIETATE = ['node_modules', '.git'];

/*
 * Codice sospetto: [espressione regolare, messaggio, gravità].
 * "errore" = il gioco resta fuori; "avviso" = va controllato a mano.
 */
const CODICE_SOSPETTO = [
  [/\beval\s*\(/, 'usa eval(): esegue testo come codice', 'errore'],
  [/\bnew\s+Function\s*\(/, 'usa new Function(): esegue testo come codice', 'errore'],
  [/\bset(?:Timeout|Interval)\s*\(\s*['"`]/, 'passa una stringa a setTimeout/setInterval (esegue testo come codice)', 'errore'],
  [/\bdocument\.cookie\b/, 'legge o scrive i cookie', 'errore'],
  [/\blocalStorage\.clear\s*\(/, 'cancella tutto il localStorage (anche le preferenze della sala)', 'errore'],
  [/\b(?:fetch|EventSource)\s*\(\s*['"`]https?:/, 'manda o chiede dati a un sito esterno', 'errore'],
  [/\bnew\s+WebSocket\s*\(/, 'apre una connessione WebSocket verso un server', 'errore'],
  [/\bXMLHttpRequest\b/, 'usa XMLHttpRequest (comunicazione con un server)', 'errore'],
  [/\bnavigator\.sendBeacon\s*\(/, 'manda dati a un server con sendBeacon', 'errore'],
  [/\bdocument\.write\s*\(/, 'usa document.write()', 'avviso'],
  [/\b(?:top|parent)\.location\b/, 'prova a cambiare la pagina che lo contiene', 'avviso'],
  [/\bwindow\.open\s*\(/, 'apre nuove finestre', 'avviso'],
  [/javascript:/i, 'contiene un link "javascript:"', 'avviso'],
  [/\batob\s*\(\s*['"`][A-Za-z0-9+/=]{200,}/, 'decodifica un lungo testo base64 (codice nascosto?)', 'avviso'],
];

// --- Funzioni di supporto --------------------------------------------------

/** Tutti i file della cartella (anche nelle sottocartelle), con percorso completo. */
function elencaFile(cartella, risultato = []) {
  for (const nome of readdirSync(cartella)) {
    const percorso = join(cartella, nome);
    const info = lstatSync(percorso);
    if (info.isSymbolicLink()) {
      risultato.push({ percorso, link: true, size: 0 });
    } else if (info.isDirectory()) {
      risultato.push({ percorso, cartella: true, size: 0 });
      elencaFile(percorso, risultato);
    } else {
      risultato.push({ percorso, size: info.size });
    }
  }
  return risultato;
}

/** Riferimenti a file dentro HTML, CSS e JavaScript: src, href, url(), import. */
function trovaRiferimenti(testo, estensione) {
  const riferimenti = [];
  const aggiungi = (regex, gruppo = 1) => {
    for (const match of testo.matchAll(regex)) riferimenti.push(match[gruppo].trim());
  };
  if (estensione === '.html') {
    aggiungi(/<(?:script|img|audio|video|source|iframe|embed)\b[^>]*\bsrc\s*=\s*["']([^"']+)["']/gi);
    aggiungi(/<link\b[^>]*\bhref\s*=\s*["']([^"']+)["']/gi);
    aggiungi(/<form\b[^>]*\baction\s*=\s*["']([^"']+)["']/gi);
  }
  if (estensione === '.css' || estensione === '.html') {
    aggiungi(/url\(\s*["']?([^"')]+)["']?\s*\)/gi);
    aggiungi(/@import\s+["']([^"']+)["']/gi);
  }
  if (estensione === '.js' || estensione === '.mjs' || estensione === '.html') {
    aggiungi(/\bimport\s+(?:[^'"`]*?\sfrom\s+)?["']([^"']+)["']/g);
    aggiungi(/\bimport\s*\(\s*["']([^"']+)["']\s*\)/g);
  }
  return riferimenti;
}

const eEsterno = (url) => /^(?:https?:)?\/\//i.test(url);
// Non sono file: dati in linea, ancore, moduli di Node (usati solo nei test), segnaposto nei template
const nonEUnFile = (url) => /^(?:data:|blob:|mailto:|tel:|#|about:|node:)/i.test(url) || url.includes('${');

// --- Verifica ------------------------------------------------------------

/**
 * Verifica la cartella di un gioco.
 * @param {string} cartella - percorso della cartella del gioco
 * @param {object} [opzioni]
 * @param {boolean} [opzioni.interno] - gioco "di casa": può usare ../assets/
 * @param {object|null} [opzioni.provenienza] - la voce di giochi.json (obbligatoria per i giochi importati)
 * @returns {{ ok: boolean, errori: string[], avvisi: string[] }}
 */
export function verificaGioco(cartella, { interno = false, provenienza = null } = {}) {
  const errori = [];
  const avvisi = [];
  const base = resolve(cartella);

  if (!existsSync(base) || !lstatSync(base).isDirectory()) {
    return { ok: false, errori: [`la cartella ${cartella} non esiste`], avvisi };
  }

  // 1. index.html
  if (!existsSync(join(base, 'index.html'))) {
    errori.push('manca index.html nella cartella del gioco');
    if (existsSync(join(base, 'package.json'))) {
      errori.push('c\'è un package.json: il gioco ha bisogno di un build step, che la sala non usa');
    }
  }

  // 2. Tipi e dimensioni dei file
  const file = elencaFile(base);
  let totale = 0;
  for (const voce of file) {
    const nome = relative(base, voce.percorso);
    const parti = nome.split(sep);
    if (voce.link) {
      errori.push(`${nome}: è un collegamento simbolico, non un file vero`);
      continue;
    }
    if (parti.some((parte) => CARTELLE_VIETATE.includes(parte))) {
      if (voce.cartella && CARTELLE_VIETATE.includes(parti.at(-1))) errori.push(`${nome}: cartella non ammessa`);
      continue;
    }
    if (voce.cartella) continue;
    if (!ESTENSIONI_AMMESSE.has(extname(nome).toLowerCase())) {
      errori.push(`${nome}: tipo di file non ammesso (${extname(nome) || 'senza estensione'})`);
    }
    if (voce.size > MAX_FILE_BYTES) errori.push(`${nome}: file troppo grande (${(voce.size / 1048576).toFixed(1)} MB, massimo 5)`);
    totale += voce.size;
  }
  if (totale > MAX_TOTALE_BYTES) errori.push(`il gioco pesa ${(totale / 1048576).toFixed(1)} MB (massimo 15)`);

  // 3-5. Contenuto di HTML, CSS e JavaScript
  for (const voce of file) {
    if (voce.cartella || voce.link) continue;
    const estensione = extname(voce.percorso).toLowerCase();
    if (!['.html', '.css', '.js', '.mjs'].includes(estensione)) continue;
    const nome = relative(base, voce.percorso);
    const testo = readFileSync(voce.percorso, 'utf8');

    for (const riferimento of trovaRiferimenti(testo, estensione)) {
      if (nonEUnFile(riferimento)) continue;
      if (eEsterno(riferimento)) {
        errori.push(`${nome}: carica "${riferimento}" da Internet (la sala non usa CDN né file esterni)`);
        continue;
      }
      const pulito = riferimento.split(/[?#]/)[0];
      if (!pulito) continue;
      if (pulito.startsWith('/')) {
        errori.push(`${nome}: il percorso "${riferimento}" comincia con "/" e su GitHub Pages punterebbe fuori dalla sala`);
        continue;
      }
      const destinazione = resolve(dirname(voce.percorso), pulito);
      const dentroIlGioco = destinazione.startsWith(base + sep) || destinazione === base;
      const dentroAssets = interno && destinazione.startsWith(join(REPO_ROOT, 'assets') + sep);
      if (!dentroIlGioco && !dentroAssets) {
        errori.push(`${nome}: il percorso "${riferimento}" esce dalla cartella del gioco`);
      } else if (!existsSync(destinazione)) {
        errori.push(`${nome}: il file "${riferimento}" non esiste`);
      }
    }

    for (const [regex, messaggio, gravita] of CODICE_SOSPETTO) {
      if (regex.test(testo)) (gravita === 'errore' ? errori : avvisi).push(`${nome}: ${messaggio}`);
    }

    if (testo.split('\n').some((riga) => riga.length > 1000)) {
      avvisi.push(`${nome}: righe lunghissime (codice minificato?), difficile da controllare a mano`);
    }
  }

  // 6. Provenienza (solo per i giochi importati)
  if (!interno) {
    if (!provenienza) {
      errori.push('manca la voce in giochi.json con la provenienza (repository di origine)');
    } else if (!/^https:\/\/github\.com\/[\w.-]+\/[\w.-]+/.test(provenienza.provenienza?.repository ?? '')) {
      errori.push('in giochi.json manca "provenienza.repository" con l\'indirizzo GitHub di origine');
    }
  }

  return { ok: errori.length === 0, errori, avvisi };
}

/** Legge giochi.json (l'elenco dei giochi importati). */
export function leggiCatalogo(percorso = join(REPO_ROOT, 'giochi.json')) {
  if (!existsSync(percorso)) return { giochi: [] };
  return JSON.parse(readFileSync(percorso, 'utf8'));
}

// --- Uso da riga di comando ------------------------------------------------

function stampa(nome, risultato) {
  console.log(`\n${risultato.ok ? '✔' : '✖'} ${nome}: ${risultato.ok ? 'passa la verifica' : 'NON passa la verifica'}`);
  for (const errore of risultato.errori) console.log(`   ✖ ${errore}`);
  for (const avviso of risultato.avvisi) console.log(`   ⚠ ${avviso}`);
}

function main(argomenti) {
  const catalogo = leggiCatalogo();
  const daVerificare = [];

  if (argomenti.includes('--tutti')) {
    for (const cartella of GIOCHI_INTERNI) daVerificare.push({ cartella, interno: true });
    for (const gioco of catalogo.giochi) daVerificare.push({ cartella: gioco.cartella, provenienza: gioco });
  } else if (argomenti[0]) {
    const cartella = relative(REPO_ROOT, resolve(argomenti[0]));
    const interno = GIOCHI_INTERNI.includes(cartella);
    const provenienza = catalogo.giochi.find((gioco) => resolve(REPO_ROOT, gioco.cartella) === resolve(REPO_ROOT, cartella)) ?? null;
    daVerificare.push({ cartella, interno, provenienza });
  } else {
    console.log('Uso: node strumenti/verifica.js giochi/nome-gioco   oppure   node strumenti/verifica.js --tutti');
    return 1;
  }

  let tuttiOk = true;
  for (const { cartella, interno, provenienza } of daVerificare) {
    const risultato = verificaGioco(join(REPO_ROOT, cartella), { interno, provenienza });
    stampa(cartella, risultato);
    tuttiOk &&= risultato.ok;
  }
  console.log(tuttiOk ? '\nTutto in ordine.' : '\nAlmeno un gioco non passa: resta fuori dalla sala finché non è sistemato.');
  return tuttiOk ? 0 : 1;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  process.exitCode = main(process.argv.slice(2));
}
