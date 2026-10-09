---
version: 1
slug: "memory-index-html"
primary_target: "memory/index.html"
related_targets: ["index.html"]
---

# Memory + Sala giochi — surface brief

Scope: memory/index.html (setup, partita, classifica) e /index.html (selezione giochi). Mode: Experience (il gioco è l'opera; i controlli restano pulsanti e campi standard).
Audience/job: 2–4 amici si passano un telefono; devono capire subito di chi è il turno e quando passare il dispositivo.
Constraints: vanilla, niente build, niente dipendenze runtime; font Press Start 2P (OFL) servito da /assets/fonts; solo ispirazione Nintendo, nessun personaggio, logo, nome o sprite. Logica in game.js intoccabile.

## Direction contract

THESIS: La partita è un livello di un platform a 8 bit: ogni carta è un blocco "?" da colpire. Rifiuta il tavolo di carte neutro con accento viola.

OWN-WORLD: Cielo azzurro NES pieno (#5c94fc) con nuvole pixel, striscia di mattoni come terreno; in tema scuro il livello sotterraneo (nero, mattoni blu). Blocchi oro con rivetti, blocco "usato" marrone, lettering Press Start 2P bianco con contorno scuro, box messaggi neri con bordo bianco. Giocatori come colori di cappello: rosso, verde, viola, arancio.

STORY: Si sceglie la squadra e un tubo (più alto = più difficile), si colpiscono blocchi, le coppie fanno saltar fuori una moneta, il livello finisce con la classifica.

FIRST VIEWPORT: Schermata titolo: "MEMORY" pixel grande in alto, sotto 2/3/4 come blocchi, nomi come campi d'inserimento, tre tubi verdi di altezza crescente per la difficoltà, pulsante INIZIA grande; terreno di mattoni in fondo. In partita: HUD in alto stile platform (nome, moneta × punti, marcatore sul giocatore di turno), griglia di blocchi al centro.

FORM: direzione fissata dall'utente ("tema: SuperMario"), nessun sorteggio; firma: blocco che sobbalza e ruota, moneta "+1" che salta fuori a ogni coppia; cambio turno come banda nera da intro di livello.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
