# 🍄 Sala giochi 🍄

> ⚠️ **Disclaimer — progetto didattico, senza scopo di lucro.**
> Questa sala giochi è un esercizio scolastico del corso, realizzato solo per imparare e non per guadagnare. Super Mario e i suoi personaggi appartengono a **Nintendo**. Black Clover e i suoi personaggi appartengono a **Yuki Tabata / Shueisha**. Nella repo **non ci sono immagini, musiche o sprite ufficiali**: grafica, effetti sonori e melodie sono originali e generati da codice.

🧱🧱🧱🟨🧱🧱🧱🟨🧱🧱🧱🟨🧱🧱🧱

Minigiochi da fare con gli amici, nel browser, passandosi lo stesso telefono o computer. Tutto è scritto in **HTML, CSS e JavaScript vanilla**: niente framework, niente dipendenze e nessun build step. Si pubblica su GitHub Pages così com'è.

---

## 🗺️ Mappa del mondo

| Livello | Gioco | ⭐ Versione classica | ✨ Versione anime |
| --- | --- | --- | --- |
| 🟨 **1-1** | [Memory](memory/) | personaggi di Super Mario, blocchi "?" | personaggi di Black Clover, grimori |
| 🍄 **1-2** | [Flipper](pinball/) | "Regno dei Funghi": mattoni e Super Funghi | "Sfera Anti-Magia": sigilli e rune |
| 🟢 **1-3…** | [Giochi dei compagni](giochi/LEGGIMI.md) | arrivano dal tubo del bibliotecario | |

---

## ⭐ Power-up: due versioni della stessa sala

È un solo sito con due "vesti". Regole, turni e fisica sono gli stessi: cambia solo la grafica.

- ⭐ **Classica** (predefinita): platform a 8 bit a tema Super Mario.
- ✨ **Anime**: tema Black Clover, ricavato dalle schermate generate con Google Stitch. Ha fondo scuro, cremisi, oro, smeraldo e grimori con un trifoglio d'oro.

**Come si cambia versione**
- Nella pagina iniziale c'è il pulsante fisso in basso a destra **"Prova la versione anime"**, che poi diventa **"Torna alla versione classica"**.
- Nei giochi c'è il pulsante **Anime / Classica** nella barra in alto.
- La scelta vale per tutte le pagine e il browser se la ricorda.

🌙 **Livello sotterraneo**: nella versione classica, se il computer o il telefono è in **modalità scura**, pagina iniziale e Memory passano al sotterraneo, con fondo nero e mattoni blu. Per provarlo senza cambiare il sistema, in Chrome apri gli strumenti per sviluppatori, poi ⋮ → *More tools* → *Rendering* → *prefers-color-scheme: dark*.

🔧 **Come funziona**: `assets/tema.js` scrive la versione su `<html data-theme="classica|anime">` prima che la pagina venga disegnata, e i fogli di stile usano `[data-theme='anime']`. Il tavolo del flipper, disegnato con JavaScript, cambia tema tramite l'evento `sala-tema`.

---

## 🟨 Mondo 1-1 · Memory

Memory a turni, multiplayer "passa e gioca": da 2 a 4 persone sullo stesso dispositivo.

### 📜 Regole

1. 👥 Si sceglie il numero di giocatori (2, 3 o 4). I nomi sono facoltativi: chi non lo scrive diventa "Giocatore 1", "Giocatore 2", …
2. 🟢 Si sceglie il livello, un tubo (o un tomo) più alto per ogni livello:
   - **4 × 4**: facile, 8 coppie;
   - **4 × 5**: medio, 10 coppie;
   - **6 × 6**: difficile, 18 coppie.
3. 🔀 A ogni partita le carte vengono mescolate (algoritmo di Fisher-Yates).
4. 🟨 Al proprio turno si girano **due carte**:
   - se sono **uguali** restano scoperte, salta fuori una 🪙 moneta, si prende **1 punto** e si **gioca ancora**;
   - se sono **diverse** restano visibili per circa 1 secondo, poi si rigirano e tocca al giocatore successivo.
5. ⏳ Mentre si controllano due carte, i clic sulle altre vengono ignorati. Cliccare una carta già scoperta non fa nulla.
6. 🏁 Trovate tutte le coppie: classifica, vincitore o pareggio, e il pulsante **Rigioca**.

Il contatore **Mosse** conta quante volte sono state girate due carte, per tutti i giocatori.

### 🎨 Grafica, personaggi e audio

- 🧱 **Classica**: cielo con le nuvole, terreno di mattoni, carte come blocchi "?", tubi verdi per i livelli.
- 📖 **Anime**: carte come grimori con il trifoglio d'oro, livelli come "tomi".
- 👾 **Personaggi**: 18 per versione (`memory/js/characters.js`), con nome ed emoji. Le immagini si possono aggiungere in locale, vedi [`assets/personaggi/LEGGIMI.md`](assets/personaggi/LEGGIMI.md).
- 🔊 **Audio**: effetti e musichetta originali, generati dal browser (`assets/suoni.js`). Nella classica sono suoni 8-bit. Nell'anime sono pagine di grimorio, fendenti, rintocchi e un tema epico in Re minore. L'audio parte spento: si accende con **AUDIO** in alto.

### ♿ Accessibilità

- ⌨️ Le carte sono pulsanti: si raggiungono con **Tab** e si girano con **Invio** o **Spazio**.
- 🗣️ Ogni carta ha un'etichetta per gli screen reader ("Carta 3, coperta" oppure "Carta 3: Luigi"), e i messaggi come "Tocca a Giulia" vengono annunciati.
- 🐢 Con "riduci movimento" attivo nel sistema, le animazioni si spengono.

---

## 🍄 Mondo 1-2 · Flipper

Flipper in tempo reale, multiplayer a turni: da 1 a 4 giocatori, **3 palline a testa**. La disposizione è originale, ispirata alla densità di tavoli come *3D Pinball Space Cadet*. La fisica è di [Matter.js](https://brm.io/matter-js/), salvato in locale in `pinball/lib/`, quindi funziona anche offline.

### 📜 Regole

1. 👥 Si sceglie il numero di giocatori (da 1 a 4).
2. 🔁 Quando la pallina cade dal fondo tocca al giocatore successivo, con la schermata **"Tocca a [nome] – premi per lanciare"** per passarsi il dispositivo.
3. 🎯 Elementi e punti:
   - 🍄 **5 bumper** (Super Funghi / cerchi magici): 100 punti;
   - ⚡ **2 slingshot** sopra le alette e **2 kicker** in alto sui lati: 50 punti;
   - 📍 **4 paletti** di rimbalzo e **2 deviatori** sopra le corsie di uscita, che rimandano la pallina verso le alette;
   - 🪙 **4 bersagli abbattibili**: 250 punti l'uno; abbatterli tutti dà un **bonus di 2.000** e li rialza;
   - 💡 **3 corsie in alto** con le luci: 150 punti; accenderle tutte e tre fa salire il **moltiplicatore** (fino a ×5);
   - 🕳️ **corsie laterali di uscita**: 500 punti, ma portano verso lo scolo.
4. 🛡️ **Pallina salvata**: se cade entro 10 secondi dal lancio torna sul lanciatore, una volta per pallina.
5. ✖️ Il moltiplicatore si azzera a ogni pallina persa. A fine pallina arriva un **bonus** per gli elementi colpiti.
6. 🏆 Finite le palline: classifica, vincitore o pareggio, **Rigioca**.

### 🎮 Controlli

| Azione | ⌨️ Tastiera | 📱 Telefono / tablet |
| --- | --- | --- |
| Aletta sinistra | **Z** oppure **←** | tocca la metà sinistra del tavolo |
| Aletta destra | **M** oppure **→** | tocca la metà destra del tavolo |
| Lancio | tieni premuto **Spazio** (più a lungo = più forte) | tieni premuto **Lancia** |
| Pausa | **P** | pulsante **Pausa** |

⏸️ Il gioco va in pausa da solo se cambi scheda o blocchi il telefono. 📱 In orizzontale il pannello si sposta di lato, ma il tavolo è più grande in verticale.

### 🔧 Com'è fatto

- 📐 `js/config/` (solo **dati**): `table-layout.js` dice dove sta ogni elemento, `physics-config.js` contiene gravità, rimbalzi e forze, `rules-config.js` punti e bonus, `theme.js` i temi del tavolo.
- ⚙️ `js/physics.js`: costruisce il mondo di Matter.js e segnala gli urti con eventi (`{ type: 'bumper', id: 2 }`).
- 🧠 `js/rules.js` e `js/turns.js`: **logica pura**, testata in `pinball/tests/`.
- 🖌️ `js/render.js`, `js/hud.js`, `js/input.js`: disegno del tavolo, pannello, tastiera e touch. `js/main.js` collega tutto.

**Scelte di fisica**, per chi vuole capirle:
- ⏱️ **passo fisso** di 1/240 s, uguale a qualunque frame rate;
- 🧱 **la pallina non attraversa le pareti**: in un passo si sposta meno di raggio + metà parete;
- 🦾 **alette a rotazione controllata**, così il colpo è sempre uguale;
- 🐞 con `pinball/?debug` lo stato si raggiunge dalla console come `pinballDebug`.

---

## 🟢 Mondo 1-3 · Il tubo dei compagni

I giochi dei compagni entrano nella sala dal tubo verde, portati dall'agente **bibliotecario** (`.claude/agents/bibliotecario.md`). Con Claude Code basta scrivere:

> Clona il gioco di https://github.com/compagno/sala-giochi

Il bibliotecario:
1. 📦 scarica la repo in una **cartella temporanea**, mai direttamente nella sala;
2. 🔍 legge i file e cerca **codice sospetto** prima di eseguire qualunque cosa;
3. 📂 copia solo il gioco in `giochi/<nome>/` e registra in [`giochi.json`](giochi.json) **da quale repository arriva**;
4. ✅ lancia la verifica: se il gioco non passa, resta fuori e il bibliotecario dice perché;
5. 💾 se passa, fa il commit. La pagina iniziale trova il gioco da sola e mostra "Arriva da …".

La verifica è `node strumenti/verifica.js giochi/<nome>`, oppure `--tutti` per tutta la sala. Controlla che il gioco:
- abbia un `index.html` e funzioni senza build step;
- non carichi niente da Internet;
- usi solo percorsi interni;
- non contenga `eval`, invio di dati all'esterno o lettura dei cookie;
- usi solo tipi di file ammessi;
- dichiari da dove arriva.

Dettagli in [`giochi/LEGGIMI.md`](giochi/LEGGIMI.md).

---

## 🚀 Livelli segreti (prove)

- 🖼️ **Schermate Stitch originali** (`prove/stitch/`): le 6 schermate generate da Google Stitch, da aprire in locale per confrontarle con la versione anime. Restano fuori dai commit (vedi `.gitignore`) perché usano CDN e immagini dell'anime.

---

## 🏰 Com'è costruito il castello

```
/
├── index.html, style.css   pagina iniziale (mappa dei livelli)
├── giochi.json             catalogo dei giochi dei compagni, con la provenienza
├── README.md, PRODUCT.md, DESIGN.md
├── docs/                   progettazione.md (come è fatto) e decisioni.md (perché è fatto così)
├── .claude/agents/         l'agente bibliotecario
├── strumenti/              verifica.js (controllo dei giochi) e i suoi test
├── assets/
│   ├── tema.js             versione della sala (classica / anime)
│   ├── sala.js             mostra nella pagina iniziale i giochi di giochi.json
│   ├── sala-giochi.css     stile 8-bit comune
│   ├── temi.css            stile della versione anime, pulsanti versione e audio
│   ├── suoni.js            effetti e musica, diversi per versione
│   ├── suoni/, personaggi/ file facoltativi (vedi i LEGGIMI.md)
│   └── fonts/              Press Start 2P, Syne, Plus Jakarta Sans (licenze OFL)
├── memory/                 🟨 il Memory
│   ├── js/game.js          LOGICA: stato, regole, turni, classifica (senza DOM né timer)
│   ├── js/ui.js, main.js   interfaccia e collegamenti
│   └── tests/
├── pinball/                🍄 il flipper
│   ├── lib/                Matter.js 0.20.0
│   ├── js/config/          dati: tavolo, fisica, regole, temi
│   └── tests/
├── giochi/                 🟢 giochi importati dai compagni
└── prove/                  🚀 prove (schermate Stitch, solo in locale)
```

🧠 **Logica separata dall'interfaccia**: `memory/js/game.js` riceve azioni ("gira la carta 5") e aggiorna lo stato, senza mai toccare la pagina:

```
PLAYING ──(2ª carta diversa)──► CHECKING ──(endTurn)──► PLAYING
   │
   └──(ultima coppia trovata)──► FINISHED
```

---

## 🎮 Premi START: avviarlo in locale

Il codice usa gli **ES modules**, che i browser bloccano se apri `index.html` con un doppio clic (`file://`). Serve un piccolo server statico:

- 🧩 **VS Code + Live Server**: clic destro su `index.html` → *Open with Live Server*;
- 🟩 **Node.js**: `npx serve .` e apri l'indirizzo che compare (di solito http://localhost:3000);
- 🐍 **Python**: `python3 -m http.server 8000` e apri http://localhost:8000.

### 🧪 Test

Serve Node.js 22 o successivo e non c'è niente da installare:

```bash
node --test memory/tests/*.test.js pinball/tests/*.test.js strumenti/tests/*.test.js
node strumenti/verifica.js --tutti
```

---

## 🚩 Bandiera finale: pubblicare su GitHub Pages

1. Fai il push della repo su GitHub (branch `main`).
2. Su GitHub: **Settings** → **Pages** → **Deploy from a branch** → `main` / `(root)` → **Save**.
3. Dopo un paio di minuti il sito è su `https://<nome-utente>.github.io/<nome-repo>/`.

Ogni push su `main` aggiorna il sito. Tutti i percorsi sono relativi, quindi funzionano anche dentro `/<nome-repo>/`.

⚠️ Un sito GitHub Pages è **pubblico**, anche se la repo è privata: le immagini e i suoni dei personaggi, se li aggiungi, tienili solo in locale (vedi i `LEGGIMI.md` in `assets/`).

---

## 🔨 Costruisci un nuovo livello

1. 📁 Crea una cartella, per esempio `scacchi/`, con `index.html`, `style.css` e `js/`. Per lo stile 8-bit carica prima `../assets/sala-giochi.css`.
2. 🗺️ Nella pagina iniziale aggiungi un `<li>` con `<a class="level" href="scacchi/">`, copiando la scheda del Memory (livello "1-3").
3. ↩️ Metti il link per tornare all'elenco: `<a href="../">‹ Tutti i giochi</a>`.
4. ✨ Per le due versioni: nel `<head>` carica `../assets/tema.js` e `../assets/temi.css`, metti un pulsante `<button data-theme-toggle="short"><span data-theme-label></span></button>` e scrivi gli stili anime sotto `[data-theme='anime']`.
5. ✅ Aggiungi `'scacchi'` all'elenco `GIOCHI_INTERNI` in `strumenti/verifica.js` (così può usare `assets/` e non serve la provenienza), poi controlla con `node strumenti/verifica.js scacchi`.

---

## 🪙 Crediti

- 🔤 Font **Press Start 2P** © 2012 The Press Start 2P Project Authors; **Syne** © 2017 The Syne Project Authors; **Plus Jakarta Sans** © 2020 The Plus Jakarta Sans Project Authors. Tutti con licenza SIL Open Font License 1.1 (vedi `assets/fonts/OFL*.txt`).
- ⚙️ **Matter.js** 0.20.0 © Liam Brummitt e contributori, licenza MIT (vedi `pinball/lib/LICENSE-matter.txt`).
- 🍄 Personaggi di **Super Mario** © Nintendo · 📖 personaggi di **Black Clover** © Yuki Tabata / Shueisha. Usati solo a scopo didattico, senza scopo di lucro, e senza immagini ufficiali nella repo.
- 🖼️ La grafica della versione anime è ricavata dalle schermate generate con Google Stitch (progetto "Black Clover Sala Giochi").
- 🎨 Disposizione e disegno dei tavoli del flipper, trifoglio, grafica pixel, melodie ed effetti sonori sono originali di questo progetto.

🧱🧱🧱🟨🧱🧱🧱🟨🧱🧱🧱🟨🧱🧱🧱
