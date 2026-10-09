# Registro delle decisioni

Una voce per ogni scelta importante: cosa si è deciso e perché. Tutte le decisioni sono del 9 ottobre 2026.

## 1. JavaScript vanilla, ES modules, nessun build step

**Decisione:** niente framework (React, Vite…) e niente compilazione.
**Motivo:** il codice deve restare leggibile da studenti e funzionare su GitHub Pages copiando i file così come sono.

## 2. Logica separata dall'interfaccia

**Decisione:** `memory/js/game.js`, `pinball/js/rules.js` e `pinball/js/turns.js` non toccano mai il DOM né i timer.
**Motivo:** si leggono e si testano da soli con `node --test`.

## 3. Rimossi gli scaffold `FE/` e `BE/`

**Decisione:** cancellati lo scaffold Vite + React e quello Spring Boot, insieme ai file `.DS_Store`. Aggiunto un `.gitignore`.
**Motivo:** non contenevano codice del progetto e GitHub Pages li avrebbe pubblicati. Restano recuperabili dal primo commit (`b9bcf7d`).

## 4. Tema platform 8-bit per Memory e pagina iniziale

**Decisione:** cielo, mattoni, blocchi "?", monete, tubi verdi per i livelli, font pixel Press Start 2P.
**Motivo:** tema scelto dall'utente ("Super Mario").
**Aggiornamento:** all'inizio si era scelta la "sola ispirazione", senza nomi né personaggi Nintendo, perché il sito sarebbe stato pubblico. Poi l'utente ha deciso di usare i **personaggi reali**: il progetto è scolastico e senza scopo di lucro (vedi la decisione 10).

## 5. Font salvati nella repo

**Decisione:** Press Start 2P, Syne e Plus Jakarta Sans sono in `assets/fonts/`, con le loro licenze OFL, invece di essere caricati da Google Fonts.
**Motivo:** nessuna richiesta esterna, funzionamento offline, stesso aspetto ovunque.

## 6. Audio originale con la Web Audio API

**Decisione:** effetti e musichetta generati dal browser con l'audio spento all'avvio, prima solo nel Memory e poi in un modulo comune (`assets/suoni.js`) usato anche dal flipper. La versione anime ha suoni propri, originali e "in tema": pagine di grimorio, fendenti, rintocchi, campanelle e un tema epico in minore.
**Motivo:** musiche, sigle e voci originali di Super Mario e Black Clover sono protette. Così, in più, non servono file audio. Chi ha file propri può usarli tramite `FILE_AUDIO` (vedi `assets/suoni/LEGGIMI.md`).

## 7. Matter.js in locale per il flipper

**Decisione:** Matter.js 0.20.0 è salvato in `pinball/lib/` e caricato come script classico, esposto ai moduli da `js/matter.js`.
**Motivo:** niente CDN e funzionamento offline. È una libreria di fisica collaudata, invece di scriverne una da zero.

## 8. Fisica: passo fisso, velocità massima, alette ruotate a mano

**Decisione:** passo di 1/240 s, velocità massima 34, pareti spesse, alette come corpi statici ruotati a ogni passo.
**Motivo:** comportamento uguale a qualunque frame rate, nessuna pallina che attraversa le pareti (verificato con test automatici), colpo d'aletta reattivo e ripetibile.

## 9. Più rimbalzi e pallina salvata

**Decisione:** nel flipper sono stati aggiunti:
- 2 kicker in alto sui lati;
- 2 bumper e 4 paletti in più;
- gravità 0.85 e pareti più elastiche;
- alette lunghe 82;
- la pallina salvata entro 10 secondi dal lancio.

**Motivo:** l'utente ha notato che la pallina "finisce subito giù". Le misure con un giocatore automatico hanno mostrato la causa: dopo il lancio la pallina scendeva lungo la parete sinistra dritta nella corsia di uscita (mediana 2,6 s). I kicker la rispediscono verso i bumper (mediana circa 12 s). Una variante con deviatori più bassi è stata scartata perché intrappolava la pallina in un angolo. Ispirazione: *3D Pinball Space Cadet*.

## 10. Un solo sito con due "vesti"

**Decisione:** versione **classica** (Super Mario per Memory e flipper "Regno dei Funghi") e versione **anime** (Black Clover per Memory e flipper "Sfera Anti-Magia"). Stesso codice di gioco, cambia solo la grafica tramite `data-theme` e `assets/tema.js`.
**Motivo:** se si corregge un bug, vale per entrambe le versioni; per un gioco nuovo basta aggiungere gli stili della seconda versione.
**Dettagli:**
- **Pulsante**: fisso in basso a destra nella pagina iniziale ("Prova la versione anime"); nei giochi sta nella barra in alto, perché nel flipper in basso a destra c'è il pulsante Lancia.
- **Grafica della versione anime**: ricavata dalle schermate di Google Stitch (progetto "Black Clover Sala Giochi"). Non sono stati inclusi i dati inventati del mockup (tornei, record, mana, classifiche settimanali, timer) né le funzioni che il gioco non ha (tilt, sezione Ranks). L'emblema dei grimori è un trifoglio disegnato da zero.
- **Nomi**: il flipper anime si chiama "Sfera Anti-Magia", scelto dall'utente tra alcune proposte; "Profondità Zero" del mockup non era adatto all'anime.
- **Il flipper classico**: all'inizio era a tema abissi marini, poi l'utente ha scelto il tema Super Mario anche per lui. Il tema abissi resta pronto in `pinball/js/config/theme.js`.

## 11. Personaggi reali, immagini non incluse

**Decisione:** sulle carte del Memory ci sono i nomi dei personaggi reali, 18 per versione. Le immagini si possono aggiungere in `assets/personaggi/`, ma non sono nella repo.
**Motivo:** uso scolastico senza scopo di lucro, scelto dall'utente. Le immagini ufficiali restano dei loro autori e non vengono copiate nella repo.
**Attenzione:** un sito GitHub Pages è pubblico anche con la repo privata. Per tenere le immagini solo in locale c'è l'indicazione per il `.gitignore` in `assets/personaggi/LEGGIMI.md`.

## 12. Commit con autore Valelearn1

**Decisione:** i commit sono firmati Valelearn1, senza righe di co-autore, e il push lo fa l'utente.
**Motivo:** richiesta esplicita dell'utente: il lavoro va consegnato a suo nome.
