# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Compagni di corso e amici che giocano insieme nello stesso posto, passandosi un solo dispositivo (telefono o PC) a ogni turno. Colleghi del corso leggono e modificano il codice per imparare e per aggiungere nuovi minigiochi.

## Product Purpose

"Sala giochi": una raccolta di minigiochi da browser per un progetto di corso. Giochi: un Memory a turni da 2 a 4 giocatori e un flipper in tempo reale a turni, "Profondità Zero", da 1 a 4 giocatori. Successo: una partita si avvia in pochi secondi, si capisce sempre di chi è il turno e quando passare il dispositivo, e il codice resta comprensibile per uno studente.

## Positioning

Multiplayer locale "passa e gioca" senza account, server o installazione: si apre il link e si gioca sullo stesso dispositivo.

## Operating Context

Partite brevi dal vivo, spesso da telefono tenuto in mano e passato tra persone; anche da PC. Pubblicato su GitHub Pages; in locale si apre con un server statico (Live Server, `npx serve`).

## Capabilities and Constraints

- HTML, CSS e JavaScript vanilla (ES modules), nessun framework, nessun build step: deve funzionare così com'è su GitHub Pages.
- Nessuna dipendenza esterna a runtime; le carte usano emoji, nessuna immagine da scaricare. File statici serviti dalla repo (es. un font con licenza libera) sono ammessi.
- Logica di gioco (`memory/js/game.js`) separata dal DOM e testata con `node --test`.
- Codice, commenti e README in italiano, con funzioni piccole e nomi chiari.
- Ogni gioco vive nella sua cartella (`/memory/`, `/pinball/`) e la pagina iniziale li elenca.
- Il flipper usa Matter.js salvato in locale (`/pinball/lib/`), nessuna CDN.

## Brand Commitments

- Un solo sito con due versioni grafiche, scelte dall'utente: **classica** (predefinita, platform 8-bit a tema Super Mario per pagina iniziale, Memory e flipper "Regno dei Funghi") e **anime** (a tema Black Clover, dalle schermate Google Stitch: fondo scuro, cremisi, oro, smeraldo, grimori con trifoglio; flipper "Sfera Anti-Magia"). Si cambia con il pulsante fisso in basso a destra nella pagina iniziale o con il pulsante nella barra in alto dei giochi.
- Uso scolastico senza scopo di lucro: l'utente ha scelto di usare i nomi dei personaggi reali (Super Mario, Black Clover). Le immagini ufficiali non sono nella repo; si possono aggiungere in locale (`assets/personaggi/`). Le musiche originali non si usano: audio generato e originale.
- Il tema "abissi marini" del flipper resta disponibile in `pinball/js/config/theme.js` ma non è usato.
- Interfaccia in italiano.

## Evidence on Hand

Nessun asset grafico, logo o materiale di brand esistente oltre al codice. Non inventare punteggi, utenti o recensioni.

## Product Principles

1. Di chi è il turno deve essere evidente a colpo d'occhio, anche da un metro di distanza.
2. Si gioca con una mano sul telefono: bersagli grandi, niente passaggi inutili.
3. Il codice è materiale didattico: la chiarezza vince sull'astuzia.
4. Ogni gioco è autonomo; la sala giochi li tiene insieme con un'identità comune.

## Accessibility & Inclusion

Navigazione completa da tastiera (Tab + Invio/Spazio), aria-label che descrivono lo stato delle carte, annunci dei cambi turno per screen reader, rispetto di "riduci movimento".
