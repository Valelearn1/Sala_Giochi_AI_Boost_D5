# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Compagni di corso e amici che giocano insieme nello stesso posto, passandosi un solo dispositivo (telefono o PC) a ogni turno. Colleghi del corso leggono e modificano il codice per imparare e per aggiungere nuovi minigiochi.

## Product Purpose

"Sala giochi": una raccolta di minigiochi da browser per un progetto di corso. Il primo gioco è un Memory a turni da 2 a 4 giocatori; il secondo previsto è un pinball stile Peggle. Successo: una partita si avvia in pochi secondi, si capisce sempre di chi è il turno e quando passare il dispositivo, e il codice resta comprensibile per uno studente.

## Positioning

Multiplayer locale "passa e gioca" senza account, server o installazione: si apre il link e si gioca sullo stesso dispositivo.

## Operating Context

Partite brevi dal vivo, spesso da telefono tenuto in mano e passato tra persone; anche da PC. Pubblicato su GitHub Pages; in locale si apre con un server statico (Live Server, `npx serve`).

## Capabilities and Constraints

- HTML, CSS e JavaScript vanilla (ES modules), nessun framework, nessun build step: deve funzionare così com'è su GitHub Pages.
- Nessuna dipendenza esterna a runtime; le carte usano emoji, nessuna immagine da scaricare. File statici serviti dalla repo (es. un font con licenza libera) sono ammessi.
- Logica di gioco (`memory/js/game.js`) separata dal DOM e testata con `node --test`.
- Codice, commenti e README in italiano, con funzioni piccole e nomi chiari.
- Ogni gioco vive nella sua cartella (`/memory/`, poi `/peggle/`) e la pagina iniziale li elenca.

## Brand Commitments

- Tema visivo scelto dall'utente: mondo platform a 8 bit ispirato a Super Mario.
- Il sito è pubblico: solo ispirazione. Niente personaggi, loghi, nome "Super Mario", sprite o musiche Nintendo.
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
