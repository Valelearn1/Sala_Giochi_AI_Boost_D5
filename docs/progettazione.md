# Progettazione della Sala giochi

## Obiettivo

Una raccolta di minigiochi da browser per un progetto di corso, da giocare in 1–4 persone sullo stesso dispositivo ("passa e gioca"). Oggi contiene due giochi:

- **Memory** a turni (2–4 giocatori);
- **Flipper** in tempo reale a turni (1–4 giocatori, 3 palline a testa).

## Vincoli

- HTML, CSS e JavaScript vanilla con ES modules: niente framework e niente build step.
- Deve funzionare su GitHub Pages così com'è. In locale basta un server statico, perché gli ES modules non partono da `file://`.
- Nessuna richiesta a server esterni: font, Matter.js e grafica stanno nella repo o sono disegnati da codice.
- Codice, commenti e documentazione in italiano, leggibili da studenti: funzioni piccole e nomi chiari.

## Struttura della repo

```
/
├── index.html, style.css     pagina iniziale (elenco dei giochi, pulsante di cambio versione)
├── assets/
│   ├── tema.js               versione della sala: classica / anime
│   ├── sala-giochi.css       stile 8-bit comune (cielo, mattoni, pulsanti, font pixel)
│   ├── temi.css              stile comune della versione anime + pulsante di cambio versione
│   ├── fonts/                Press Start 2P, Syne, Plus Jakarta Sans (licenza OFL)
│   └── personaggi/           immagini facoltative dei personaggi (non incluse)
├── memory/                   il Memory
├── pinball/                  il flipper
└── docs/                     questa documentazione
```

Ogni gioco è autonomo nella sua cartella. Usa `assets/` solo per stile, font e versione.

## Memory

| File | Ruolo |
| --- | --- |
| `js/game.js` | **Logica pura**: stato della partita, regole, turni, classifica. Non usa né il DOM né timer. |
| `js/cards.js`, `js/shuffle.js` | Livelli (4×4, 4×5, 6×6), creazione del mazzo e mescolamento Fisher-Yates. |
| `js/characters.js` | I 18 personaggi di ogni versione: nome, emoji di riserva, immagine facoltativa. |
| `js/ui.js` | Tutto ciò che legge o modifica la pagina. |
| `js/sound.js` | Effetti e musichetta originali con la Web Audio API. |
| `js/main.js` | Collega logica, interfaccia e suoni. È l'unico file con timer. |

La partita è una piccola macchina a stati:

```
PLAYING ──(2ª carta diversa)──► CHECKING ──(endTurn, dopo ~1 s)──► PLAYING
   │
   └──(ultima coppia trovata)──► FINISHED
```

`flipCard(game, id)` restituisce un esito: `first-card`, `match`, `mismatch`, `game-over` oppure `ignored`. È `main.js` a decidere quando chiamare `endTurn`. Durante `CHECKING` ogni clic è ignorato.

## Flipper

| File | Ruolo |
| --- | --- |
| `js/config/table-layout.js` | **Dati** del tavolo (600×1100 unità): pareti, alette, bumper, slingshot e kicker, paletti, bersagli, corsie, lanciatore, scolo. |
| `js/config/physics-config.js` | **Dati** della fisica: gravità, rimbalzi, forze, velocità massima, passo. |
| `js/config/rules-config.js` | **Dati** delle regole: palline, moltiplicatore, bonus, pallina salvata. |
| `js/config/theme.js` | **Dati** dei temi del tavolo: platform (classica), grimori (anime), abissi (pronto, non usato). |
| `js/physics.js` | Costruisce il mondo di Matter.js e lo fa avanzare. Segnala gli urti con eventi `{ type, id, points }`. |
| `js/rules.js`, `js/turns.js` | **Logica pura**: punti e missioni della pallina; giocatori, palline rimaste, classifica. |
| `js/render.js` | Disegno su Canvas, con uno strato statico preparato una volta sola e il tema cambiabile al volo. |
| `js/hud.js`, `js/input.js` | Pannello HTML e sovrapposizioni; tastiera e touch. |
| `js/main.js` | Ciclo di gioco e fasi: `setup → turn → playing ⇄ paused → between → results`. |

Scelte di fisica:

- **Passo fisso** di 1/240 s, con accumulatore e limite di 50 ms per fotogramma.
- **Anti-attraversamento**: la velocità massima (34) dà al massimo 8,5 unità per passo, meno di raggio della pallina + metà parete. Le pareti sono rettangoli spessi con cerchi negli angoli.
- **Alette a rotazione controllata**: corpi statici ruotati a ogni passo attorno al perno con `Body.setAngle(…, true)` e `Body.setPosition(…, true)`, così Matter trasmette la velocità alla pallina.
- **Kicker in alto sui lati**: senza, dopo il lancio la pallina scendeva lungo la parete sinistra dritta nella corsia di uscita.

## Due versioni della sala

Un solo sito con due "vesti":

- **classica** (predefinita): Super Mario;
- **anime**: Black Clover, dalle schermate di Google Stitch.

`assets/tema.js` è uno script classico nel `<head>` di ogni pagina, e funziona così:

1. Legge la versione salvata (`localStorage`, chiave `sala-versione`) e la scrive su `<html data-theme="…">` prima che la pagina venga disegnata.
2. Collega ogni pulsante `[data-theme-toggle]`: il pulsante fisso in basso a destra nella pagina iniziale e il pulsante corto (`="short"`) nella barra dei giochi.
3. Al cambio di versione lancia l'evento `sala-tema`. Il flipper lo usa per ridisegnare il tavolo, il Memory per avvisare che i nuovi personaggi arrivano con la partita successiva.

Il CSS di ogni pagina ha una sezione `[data-theme='anime']`. Il flipper ridefinisce anche le proprie variabili (`--panel`, `--text`, `--pixel`…) per ciascuna versione.

## Come si testa

- **Logica**: `node --test memory/tests/*.test.js pinball/tests/*.test.js` (30 test, nessuna dipendenza).
- **Browser**: `pinball/?debug` espone `window.pinballDebug` per far avanzare la fisica a mano. Con questo sono stati verificati:
  - nessun attraversamento con migliaia di tiri alla velocità massima;
  - la durata delle palline con un "giocatore automatico" (mediana da 2,6 s a circa 12 s dopo i kicker);
  - il flusso completo di turni, pausa e classifica;
  - la console senza errori, su desktop e a 360–375 px di larghezza.
