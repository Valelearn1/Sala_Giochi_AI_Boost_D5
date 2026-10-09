# Sala giochi

Una raccolta di minigiochi per il browser, fatti in **HTML, CSS e JavaScript vanilla**: niente framework, niente dipendenze e nessun build step. Si pubblica su GitHub Pages così com'è. Progetto scolastico, senza scopo di lucro.

| Gioco | Versione classica | Versione anime |
| --- | --- | --- |
| 🃏 [Memory](memory/) | personaggi di Super Mario, stile 8-bit | personaggi di Black Clover, grimori |
| 🎯 [Flipper](pinball/) | "Regno dei Funghi" | "Sfera Anti-Magia" |

## Due versioni della stessa sala

Un solo sito con due "vesti": **classica** (predefinita, a tema Super Mario) e **anime** (a tema Black Clover, ricavata dalle schermate di Google Stitch). Regole, turni e fisica sono gli stessi: cambia solo la grafica.

- Nella pagina iniziale il pulsante fisso in basso a destra **"Prova la versione anime"** passa all'altra versione e, da lì, **"Torna alla versione classica"**.
- Nei giochi c'è un pulsante nella barra in alto (**Anime** / **Classica**), perché in basso a destra c'è già il pulsante Lancia del flipper.
- La scelta vale per tutte le pagine e il browser se la ricorda.

Come funziona: `assets/tema.js` scrive la versione su `<html data-theme="classica|anime">` prima che la pagina venga disegnata, e i fogli di stile usano `[data-theme='anime']`. Le parti comuni della versione anime (font Syne e Plus Jakarta Sans, colori, trifoglio d'oro) sono in `assets/temi.css`. Il tavolo del flipper, disegnato con JavaScript, cambia tema tramite l'evento `sala-tema`.

---

## 🃏 Memory

Memory a turni, multiplayer "passa e gioca": da 2 a 4 persone sullo stesso dispositivo, che si passano il telefono o il computer a ogni turno.

### Regole

1. Prima di iniziare si sceglie il numero di giocatori (2, 3 o 4). I nomi sono facoltativi: se un nome resta vuoto si usa "Giocatore 1", "Giocatore 2", …
2. Si sceglie la difficoltà:
   - **4 × 4** – facile, 8 coppie
   - **4 × 5** – medio, 10 coppie
   - **6 × 6** – difficile, 18 coppie
3. A ogni partita le carte vengono mescolate (algoritmo di Fisher-Yates).
4. Al proprio turno il giocatore gira **due carte**:
   - se sono **uguali** restano scoperte, il giocatore prende **1 punto** e **gioca di nuovo**;
   - se sono **diverse** restano visibili per circa 1 secondo, poi si rigirano e il turno passa al giocatore successivo.
5. Mentre si controllano due carte, i clic sulle altre vengono ignorati. Cliccare una carta già scoperta non fa nulla.
6. La partita finisce quando sono state trovate tutte le coppie. Vince chi ne ha trovate di più, e a parità di punti è pareggio.

Il contatore **Mosse** conta quante volte sono state girate due carte, sommando i turni di tutti i giocatori.

### Grafica, personaggi e audio

- **Versione classica**: un livello di un videogioco a piattaforme a 8 bit. Ci sono il cielo con le nuvole, il terreno di mattoni, le carte come blocchi "?", una moneta che salta fuori a ogni coppia e un tubo verde per ogni livello di difficoltà. Con il tema scuro del sistema si passa al "livello sotterraneo".
- **Versione anime**: fondo scuro, cremisi, oro e smeraldo. Le carte sono grimori con un trifoglio d'oro e i livelli sono "tomi".
- **Personaggi**: sulle carte ci sono i personaggi della versione scelta (18 per versione, in `memory/js/characters.js`), con nome ed emoji. Le immagini dei personaggi non sono incluse: per aggiungerle vedi `assets/personaggi/LEGGIMI.md`. I personaggi appartengono a Nintendo e a Yuki Tabata / Shueisha e sono usati solo per un progetto scolastico.
- **Audio**: gli effetti e la musichetta sono originali, generati dal browser con la Web Audio API (`memory/js/sound.js`), senza file audio. L'audio parte spento: si accende con il pulsante **AUDIO** in alto e il browser si ricorda la scelta.

### Accessibilità

- Le carte sono pulsanti: si raggiungono con **Tab** e si girano con **Invio** o **Spazio**.
- Ogni carta ha un'etichetta per gli screen reader ("Carta 3, coperta" oppure "Carta 3: Luigi").
- I messaggi ("Coppia trovata!", "Tocca a Giulia") vengono annunciati dagli screen reader.
- Se nel sistema è attivo "riduci movimento", le animazioni vengono disattivate.

---

## 🎯 Flipper: "Regno dei Funghi" / "Sfera Anti-Magia"

Flipper in tempo reale, multiplayer a turni: da 1 a 4 giocatori sullo stesso dispositivo. Nella versione classica il tavolo ha pareti di mattoni, Super Funghi e monete; nella versione anime ha cerchi magici, scintille di mana e un trifoglio inciso. La disposizione è originale, ispirata alla densità di tavoli come *3D Pinball Space Cadet*, ed è disegnata da codice su Canvas. La fisica è di [Matter.js](https://brm.io/matter-js/), salvato in locale in `pinball/lib/`, quindi funziona anche offline.

### Regole

1. Prima di iniziare si sceglie il numero di giocatori (da 1 a 4) con nomi facoltativi.
2. Ogni giocatore ha **3 palline**. Quando la pallina esce dal fondo, il turno passa al giocatore successivo, e compare la schermata **"Tocca a [nome] – premi per lanciare"** per passarsi il dispositivo.
3. Elementi del tavolo e punti base:
   - **5 bumper** (Super Funghi / cerchi magici): 100 punti, respingono la pallina;
   - **2 slingshot** sopra le alette e **2 kicker** in alto sui lati: 50 punti; i kicker rispediscono verso i bumper la pallina che scende lungo le pareti;
   - **4 paletti** di rimbalzo (senza punti);
   - **4 bersagli abbattibili** (le monete / le rune d'oro): 250 punti l'uno; abbatterli tutti dà un **bonus di 2.000** e li rialza;
   - **3 corsie superiori** con luci: 150 punti; accenderle tutte e tre fa salire il **moltiplicatore** (fino a ×5);
   - **corsie laterali di uscita**: 500 punti, ma portano verso lo scolo.
4. **Pallina salvata**: se la pallina cade entro 10 secondi dal lancio, torna sul lanciatore (una volta per pallina).
5. Il moltiplicatore vale su tutti i punti e si azzera a ogni pallina persa.
6. A fine pallina arriva un **bonus** in base agli elementi colpiti.
7. Finite le palline di tutti: classifica, vincitore o pareggio, e il pulsante **Rigioca**.

### Controlli

| Azione | Tastiera | Telefono / tablet |
| --- | --- | --- |
| Aletta sinistra | **Z** oppure **←** | tocca la metà sinistra del tavolo |
| Aletta destra | **M** oppure **→** | tocca la metà destra del tavolo |
| Lancio | tieni premuto **Spazio**: più a lungo = più forte | tieni premuto **Lancia** |
| Pausa | **P** | pulsante **Pausa** |

Il gioco va in pausa da solo se cambi scheda o blocchi il telefono.

### Com'è organizzato il codice

- `js/config/table-layout.js` (DATI): dove sta ogni elemento del tavolo. Fisica e disegno leggono da qui.
- `js/config/physics-config.js` (DATI): gravità, rimbalzi, forza di alette e bumper, velocità massima. Per regolare il gioco basta cambiare questi numeri.
- `js/config/rules-config.js` e `js/config/theme.js` (DATI): punteggi, bonus e pallina salvata; nome, colori e stile degli elementi di ogni tema (platform per la versione classica, grimori per quella anime, più un tema "abissi marini" pronto ma non usato).
- `js/physics.js`: costruisce il mondo di Matter.js e lo fa avanzare. Quando la pallina colpisce qualcosa avvisa con un evento (`{ type: 'bumper', id: 2 }`).
- `js/rules.js` e `js/turns.js`: logica pura, senza browser, con i test in `pinball/tests/`.
- `js/render.js`, `js/hud.js`, `js/input.js`: disegno del tavolo, pannello HTML, tastiera e touch.
- `js/main.js`: collega tutto e fa girare il ciclo di gioco.

Scelte di fisica, per chi vuole capirle:

- **Passo fisso**: la simulazione avanza sempre di 1/240 di secondo, indipendentemente dal frame rate dello schermo.
- **Niente pallina che attraversa le pareti**: la velocità è limitata, le pareti sono spesse e i passi sono piccoli, quindi in un passo la pallina si sposta meno di raggio + metà parete.
- **Alette a rotazione controllata**: a ogni passo ruotano di un angolo fisso attorno al perno, così il colpo è reattivo e sempre uguale.
- **Debug**: con `?debug` nell'indirizzo (`pinball/?debug`), fisica e stato sono raggiungibili dalla console del browser come `pinballDebug`.

---

## Struttura della repo

```
/
├── index.html          pagina iniziale con l'elenco dei giochi
├── style.css           stile della pagina iniziale
├── .nojekyll           dice a GitHub Pages di pubblicare i file così come sono
├── README.md
├── PRODUCT.md          contesto del progetto (usato dagli strumenti di design)
├── docs/               progettazione.md (come è fatto) e decisioni.md (perché è fatto così)
├── assets/
│   ├── tema.js         versione della sala (classica / anime) e pulsanti per cambiarla
│   ├── sala-giochi.css stile comune 8-bit: colori, font, cielo, terreno, pulsanti
│   ├── temi.css        stile comune della versione anime e del pulsante di cambio versione
│   ├── personaggi/     (facoltativo) immagini dei personaggi, vedi LEGGIMI.md
│   └── fonts/          Press Start 2P, Syne, Plus Jakarta Sans e le loro licenze OFL
├── pinball/            il flipper (vedi la sezione sopra)
│   ├── lib/            Matter.js 0.20.0 e la sua licenza
│   ├── js/config/      dati: tavolo, fisica, regole, tema
│   ├── js/             fisica, regole, turni, disegno, pannello, input
│   └── tests/
└── memory/
    ├── index.html      le tre schermate: impostazioni, partita, classifica
    ├── style.css       layout, carte con rotazione 3D, versione per telefono
    ├── js/
    │   ├── shuffle.js  mescolamento Fisher-Yates
    │   ├── cards.js    livelli di difficoltà, creazione del mazzo
    │   ├── characters.js personaggi delle due versioni (nome, emoji, immagine facoltativa)
    │   ├── game.js     LOGICA: stato della partita, regole, turni, classifica
    │   ├── ui.js       INTERFACCIA: tutto ciò che legge o modifica la pagina
    │   ├── sound.js    effetti e musica 8 bit con la Web Audio API
    │   └── main.js     collega interfaccia, logica e suoni (ed è l'unico file con timer)
    └── tests/
        └── game.test.js  test della logica
```

### Logica separata dall'interfaccia

`game.js` non usa mai `document` né `setTimeout`. Riceve azioni ("gira la carta 5") e aggiorna lo stato:

```
PLAYING ──(2ª carta diversa)──► CHECKING ──(endTurn)──► PLAYING
   │
   └──(ultima coppia trovata)──► FINISHED
```

`flipCard(game, id)` restituisce cosa è successo (`first-card`, `match`, `mismatch`, `game-over` oppure `ignored`). È `main.js` a decidere quando chiamare `endTurn(game)`, cioè dopo 1 secondo. Grazie a questa separazione la logica si può testare senza browser.

---

## Avviarlo in locale

Il codice usa gli **ES modules** (`<script type="module">` e `import`). I browser li bloccano se apri `index.html` con un doppio clic (indirizzo `file://`), quindi serve un piccolo server statico. Va bene uno qualsiasi di questi:

- **VS Code + Live Server**: installa l'estensione *Live Server*, apri la cartella della repo, poi clic destro su `index.html` → *Open with Live Server*.
- **Node.js**, dalla cartella della repo:
  ```bash
  npx serve .
  ```
  e apri l'indirizzo che compare (di solito http://localhost:3000).
- **Python**, dalla cartella della repo:
  ```bash
  python3 -m http.server 8000
  ```
  e apri http://localhost:8000.

### Eseguire i test

Serve Node.js 22 o successivo e non c'è niente da installare:

```bash
node --test memory/tests/*.test.js pinball/tests/*.test.js
```

---

## Pubblicare su GitHub Pages

1. Fai il push della repo su GitHub (branch `main`).
2. Su GitHub apri la repo, poi **Settings** → **Pages**.
3. In **Build and deployment** → **Source** scegli **Deploy from a branch**.
4. In **Branch** scegli `main` e la cartella `/ (root)`, poi **Save**.
5. Dopo uno o due minuti il sito è online all'indirizzo
   `https://<nome-utente>.github.io/<nome-repo>/`
   (l'indirizzo esatto compare in cima alla pagina **Settings → Pages**).

Ogni nuovo push su `main` aggiorna il sito in automatico. Tutti i percorsi nel codice sono relativi (`memory/`, `../`, `js/main.js`), quindi funzionano anche dentro la sottocartella `/<nome-repo>/`.

---

## Aggiungere un nuovo gioco

1. Crea una cartella, ad esempio `scacchi/`, con dentro il suo `index.html`, `style.css` e `js/`. Se vuoi lo stile 8-bit della sala, nell'HTML carica prima `../assets/sala-giochi.css` e poi il tuo `style.css`. Il flipper invece ha un tema tutto suo e usa solo il font pixel.
2. Nella pagina iniziale (`/index.html`) aggiungi un `<li>` con un link `<a class="level" href="scacchi/">`, copiando la struttura della scheda del Memory (numero di livello successivo, es. "1-3").
3. Nella pagina del gioco metti un link per tornare all'elenco: `<a href="../">← Tutti i giochi</a>`.
4. Per le due versioni della sala: nel `<head>` carica `<script src="../assets/tema.js"></script>` e `../assets/temi.css`, metti un pulsante `<button data-theme-toggle="short"><span data-theme-label></span></button>` nella barra in alto e scrivi gli stili della versione anime sotto `[data-theme='anime']`.

---

## Crediti

- Font **Press Start 2P** © 2012 The Press Start 2P Project Authors, rilasciato con licenza SIL Open Font License 1.1 (vedi `assets/fonts/OFL.txt`).
- **Matter.js** 0.20.0 © Liam Brummitt e contributori, licenza MIT (vedi `pinball/lib/LICENSE-matter.txt`).
- Font **Syne** © 2017 The Syne Project Authors e **Plus Jakarta Sans** © 2020 The Plus Jakarta Sans Project Authors, licenza SIL Open Font License 1.1 (vedi `assets/fonts/OFL-*.txt`).
- Disposizione e disegno dei tavoli del flipper, trifoglio, grafica pixel, melodie ed effetti sonori sono originali di questo progetto.
- Personaggi di **Super Mario** © Nintendo; personaggi di **Black Clover** © Yuki Tabata / Shueisha. Usati solo a scopo didattico, senza scopo di lucro; nessuna immagine ufficiale è inclusa nella repo.
- La grafica della versione anime è ricavata dalle schermate generate con Google Stitch (progetto "Black Clover Sala Giochi").
- Grafica pixel (nuvole, mattoni, moneta, icone), melodie ed effetti sonori sono originali di questo progetto.
