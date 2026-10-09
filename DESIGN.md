---
name: Sala giochi
description: Minigiochi "passa e gioca" nel browser, in tre versioni grafiche — classica (platform 8-bit), anime (grimori) e Simpson (Springfield a cartone).
colors:
  sky: "#5c94fc"
  ink: "#0b1238"
  ink-soft: "#1d2a66"
  panel: "#000000"
  panel-text: "#ffffff"
  panel-muted: "#c8d4ff"
  brick: "#c84c0c"
  brick-light: "#fc9838"
  brick-dark: "#6e2600"
  gold: "#f8b800"
  gold-light: "#ffe08a"
  gold-dark: "#b05800"
  pipe: "#00a800"
  pipe-light: "#8ce048"
  pipe-dark: "#004a00"
  used-block: "#b4581e"
  card-front: "#fff1cc"
  primary-hover: "#c8141e"
  player-0: "#e4202a"
  player-1: "#12a838"
  player-2: "#8a3ffc"
  player-3: "#ff7a00"
  underground-panel: "#10183c"
  underground-brick: "#1c6cb4"
  underground-brick-light: "#6cc4ff"
  underground-brick-dark: "#062a50"
  underground-score-border: "#34449a"
  g-bg: "#151218"
  g-surface-lowest: "#0f0d12"
  g-surface-low: "#1d1b20"
  g-surface: "#211f24"
  g-surface-high: "#2c292f"
  g-surface-highest: "#373439"
  g-text: "#e7e0e8"
  g-text-soft: "#e3bebd"
  g-muted: "#b99a99"
  g-line: "#5b4040"
  g-crimson: "#b3122e"
  g-crimson-hover: "#cf1a3a"
  g-crimson-soft: "#ffb3b3"
  g-gold: "#ecc246"
  g-gold-hover: "#ffd45e"
  g-gold-deep: "#cea62c"
  g-on-gold: "#241a00"
  g-emerald: "#4edf91"
  g-emerald-deep: "#00b56b"
  anime-player-0: "#ff5a6e"
  anime-player-1: "#4edf91"
  anime-player-2: "#ecc246"
  anime-player-3: "#b9a7ff"
typography:
  display:
    fontFamily: "'Press Start 2P', ui-monospace, monospace"
    fontSize: "clamp(2.25rem, 10vw, 4rem)"
    fontWeight: 400
    lineHeight: 1.15
    letterSpacing: "0"
  headline:
    fontFamily: "'Press Start 2P', ui-monospace, monospace"
    fontSize: "clamp(1.5rem, 7vw, 2.5rem)"
    fontWeight: 400
    lineHeight: 1.25
  title:
    fontFamily: "'Press Start 2P', ui-monospace, monospace"
    fontSize: "1.125rem"
    fontWeight: 400
    lineHeight: 1.3
  label:
    fontFamily: "'Press Start 2P', ui-monospace, monospace"
    fontSize: "0.75rem"
    fontWeight: 400
    lineHeight: 1.2
  body:
    fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"
    fontSize: "1rem"
    fontWeight: 600
    lineHeight: 1.45
  anime-display:
    fontFamily: "'Syne', 'Plus Jakarta Sans', system-ui, sans-serif"
    fontSize: "clamp(2.5rem, 11vw, 4.5rem)"
    fontWeight: 800
    lineHeight: 0.98
    letterSpacing: "0.01em"
  anime-title:
    fontFamily: "'Syne', 'Plus Jakarta Sans', system-ui, sans-serif"
    fontSize: "1.75rem"
    fontWeight: 800
    lineHeight: 1.15
  anime-button:
    fontFamily: "'Syne', 'Plus Jakarta Sans', system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 800
    lineHeight: 1.2
    letterSpacing: "0.04em"
  anime-body:
    fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, 'Segoe UI', sans-serif"
    fontSize: "1rem"
    fontWeight: 500
    lineHeight: 1.45
  anime-label:
    fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 800
    lineHeight: 1.2
    letterSpacing: "0.08em"
rounded:
  none: "0"
  anime-tag: "2px"
  anime-control: "4px"
  anime-card: "8px"
  anime-surface: "8px"
  anime-pill: "12px"
spacing:
  xs: "6px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
components:
  button-primary:
    backgroundColor: "{colors.player-0}"
    textColor: "{colors.panel-text}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "12px 22px"
    height: "48px"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
  button-secondary:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.panel-text}"
    rounded: "{rounded.none}"
    padding: "12px 22px"
    height: "48px"
  button-primary-anime:
    backgroundColor: "{colors.g-gold}"
    textColor: "{colors.g-on-gold}"
    typography: "{typography.anime-button}"
    rounded: "{rounded.anime-control}"
    padding: "12px 22px"
    height: "48px"
  button-primary-anime-hover:
    backgroundColor: "{colors.g-gold-hover}"
  button-secondary-anime:
    backgroundColor: "{colors.g-surface-high}"
    textColor: "{colors.g-gold}"
    rounded: "{rounded.anime-control}"
  button-secondary-anime-hover:
    backgroundColor: "{colors.g-surface-highest}"
  button-start-anime:
    backgroundColor: "{colors.g-crimson}"
    textColor: "{colors.panel-text}"
    rounded: "{rounded.anime-control}"
    height: "64px"
  button-start-anime-hover:
    backgroundColor: "{colors.g-crimson-hover}"
  version-fab:
    backgroundColor: "{colors.player-0}"
    textColor: "{colors.panel-text}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "12px 18px"
    height: "52px"
  version-fab-anime:
    backgroundColor: "{colors.g-crimson}"
    textColor: "{colors.gold-light}"
    rounded: "{rounded.anime-pill}"
    padding: "12px 18px"
    height: "52px"
  message-panel:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.panel-text}"
    rounded: "{rounded.none}"
    padding: "10px 14px"
  message-panel-anime:
    backgroundColor: "{colors.g-surface}"
    textColor: "{colors.g-text}"
    rounded: "{rounded.anime-card}"
    padding: "10px 14px"
  name-field:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.panel-text}"
    rounded: "{rounded.none}"
    padding: "0 12px"
  name-field-anime:
    backgroundColor: "{colors.g-surface-lowest}"
    textColor: "{colors.g-text}"
    rounded: "{rounded.anime-control}"
    padding: "0 12px"
  score-chip:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.panel-text}"
    rounded: "{rounded.none}"
    padding: "8px 12px"
  score-chip-anime:
    backgroundColor: "{colors.g-surface-high}"
    textColor: "{colors.g-text}"
    rounded: "{rounded.anime-card}"
    padding: "8px 12px"
  score-chip-anime-current:
    backgroundColor: "{colors.g-surface-highest}"
  level-card-anime:
    backgroundColor: "{colors.g-surface}"
    textColor: "{colors.g-text}"
    rounded: "{rounded.anime-surface}"
    padding: "0 0 20px"
---

# Design System: Sala giochi

## Overview

**Creative North Star: "Una sala, due cartucce"**

La Sala giochi è un solo sito con la stessa impaginazione, lo stesso markup e la stessa logica, che si può "inserire" in due cartucce grafiche. La **versione classica** (predefinita) è un livello di un platform a 8 bit: cielo NES pieno, terreno di mattoni, blocchi "?" d'oro, tubi verdi, lettering pixel bianco con contorno nero, riquadri neri con bordo bianco, angoli vivi e smussi pixel. La **versione anime** è un'arena di grimori su fondo scuro a puntini: cremisi, oro e smeraldo, titoli larghi in Syne 800, superfici arrotondate a gradini tonali, grimori con un trifoglio d'oro disegnato a mano. Entrambe servono lo stesso scopo: si capisce a colpo d'occhio, anche da un metro, di chi è il turno.

La versione attiva vive su `<html data-theme="classica|anime">`, scritta da `assets/tema.js` prima del primo disegno e ricordata in `localStorage` (`sala-versione`). Ogni regola anime è un override dietro `[data-theme='anime']`; la classica è la base senza selettore. I testi che cambiano tra le versioni usano coppie `.only-classica` / `.only-anime`. Il flipper riceve l'evento `sala-tema` e ridisegna il tavolo con un tema canvas diverso (`THEME_PLATFORM` "Regno dei Funghi", `THEME_ANIME` "Sfera Anti-Magia").

La densità è da gioco su telefono tenuto in mano: bersagli da almeno 40–48px, pochi elementi per schermata, il tavolo/la griglia sempre interi nell'altezza dello schermo. Tutti i disegni (nuvole, mattoni, moneta, trifoglio, sigillo) sono SVG scritti a mano nei CSS o disegnati sul canvas: nessuna immagine da scaricare.

**Key Characteristics:**
- Tre vesti sullo stesso markup, scelte dall'utente da un menu e persistite; classica predefinita.
- Simpson: cielo azzurro con nuvole soffici (di notte blu con stelle), cartoncini bianchi con contorno nero 3px, ombre nette 4px, angoli 16px e pulsanti a pastiglia; giallo #ffd90f, arancio #f26b21, rosa ciambella #f48fb1; Luckiest Guy per i titoli (gialli con contorno nero), Nunito per i testi.
- Classica: angoli vivi, bordi 3px, smussi inset al posto delle ombre, Press Start 2P con contorno nero.
- Anime: fondo #151218 a puntini dorati, scala di superfici tonali, raggi 4–8px con ombre nette spostate (come le schermate di Stitch), barra in alto e barra di navigazione fisse, icone a linee in SVG, Syne + Plus Jakarta Sans.
- Colore del giocatore come segnale principale del turno, in entrambe le versioni.
- Tutto vettoriale e locale; font self-hosted in `assets/fonts` (OFL).
- "Riduci movimento" rispettato ovunque.

## Colors

Due tavolozze separate: la classica è primaria satura NES su cielo azzurro, l'anime è un fondo quasi nero con tre accenti gioiello.

### Primary
- **Rosso Cappello** (player-0): pulsante principale classico, CTA "Gioca" nella pagina iniziale, pulsante fisso di versione, primo giocatore, aletta sinistra del flipper classico. Hover più scuro (primary-hover).
- **Oro Grimorio** (g-gold): azione principale anime (pulsanti primari, "Lancia", CTA delle schede), bordo della selezione e del giocatore di turno, punti, trifoglio e sigillo. Il testo sopra l'oro è sempre g-on-gold, mai bianco.

### Secondary
- **Oro Moneta** (gold, con gold-light e gold-dark): blocchi "?", monete, blocco scelto, vincitore della classifica (con testo nero), indicatore sul tubo scelto, bersagli e paletti del flipper classico.
- **Cremisi** (g-crimson): impegno e selezione nella versione anime — numero di giocatori scelto, pulsante INIZIA del Memory, pillola "Tocca a te", pulsante fisso di versione, aletta sinistra e bumper del flipper anime, sfumatura della banda di turno (#3a0711).

### Tertiary
- **Verde Tubo** (pipe, pipe-light, pipe-dark): tubi della difficoltà nel Memory, stantuffo e fionde del flipper classico.
- **Smeraldo** (g-emerald, g-emerald-deep): stati vivi e positivi nella versione anime — audio acceso, contatore mosse, messaggi del flipper, corsie accese, aletta destra.
- **Mattone** (brick, brick-light, brick-dark): terreno in fondo alla pagina, blocchi di scelta non selezionati, pareti del tavolo classico, ombra spostata dei titoli grandi.

### Neutral
- **Cielo NES** (sky): fondo di ogni pagina classica e, schiarito, del tavolo classico (#6b8cff → #4a7cf0).
- **Inchiostro Notte** (ink, ink-soft): testo direttamente sul cielo (sottotitoli, link "indietro", indicazioni).
- **Riquadro Nero** (panel, panel-text, panel-muted): box messaggi, punteggi, campi nome, classifica; testo bianco e testo secondario lavanda.
- **Fondo Tomo** (g-bg) e la scala **g-surface-lowest → g-surface-highest**: ogni superficie anime; a riposo high, selezionata o di turno highest, campi d'inserimento lowest.
- **Testo Pergamena** (g-text, g-text-soft, g-muted): testo principale, sottotitoli e descrizioni rosati, etichette e placeholder.
- **Filo Bruno** (g-line): unico bordo a riposo (1px) dei campi nome anime e del contorno del canvas.

### Colori dei giocatori
Quattro colori per indice (`data-player="N"` → `--player`): classica rosso, verde, viola, arancio (player-0…3); anime corallo, smeraldo, oro, lilla (anime-player-0…3, che nel codice ridefiniscono `--player-0…3` sotto `[data-theme='anime']`).

### Variante "sotterraneo" (classica, tema scuro di sistema)
Con `prefers-color-scheme: dark` la classica di pagina iniziale e Memory diventa il livello sotterraneo: cielo nero, mattoni blu (underground-brick, -light, -dark), riquadri underground-panel, fila di mattoni come soffitto, bordo dei punteggi underground-score-border perché il nero non si stacca dal fondo; il focus diventa oro. La versione anime ignora questa variante (è sempre scura, `color-scheme: dark`).

### Named Rules
**The Player Color Rule.** Il colore del giocatore è il segnale del turno e della proprietà: riempie il punteggio di turno (classica), colora il pallino/cappello, il bordo del campo nome a fuoco, la fascia del nome sulle coppie trovate e il bordo della banda "Tocca a …". Non va usato come decorazione generica.

**The Gold Ink Rule.** Nella versione anime il testo su oro è g-on-gold (#241a00) e su cremisi è bianco; l'oro come colore del testo è riservato a punti, selezione e titoli d'accento ("giochi" nel titolo della sala).

**The One Hook Rule.** Ogni differenza visiva tra le versioni passa da `[data-theme='anime']` sugli stessi elementi; i colori anime si leggono solo dalle variabili `--g-*` di `assets/temi.css`.

## Typography

**Display Font (classica):** Press Start 2P (con ui-monospace, monospace)
**Body Font (classica):** system-ui (con -apple-system, Segoe UI, Roboto, sans-serif)
**Display Font (anime):** Syne 800 (con Plus Jakarta Sans, system-ui)
**Body Font (anime):** Plus Jakarta Sans (con system-ui)

**Character:** Nella classica il pixel font fa i titoli, i numeri e le etichette dei pulsanti, sempre maiuscolo, mentre il testo corrente resta in un sans di sistema semibold per essere leggibile. Nell'anime Syne pesantissimo fa titoli, pulsanti e numeri (spesso maiuscoli, con leggero tracking), Plus Jakarta Sans fa il resto. Nel flipper anime `--pixel` viene rimappato su Syne, così gli stessi selettori cambiano carattere.

### Hierarchy
- **Display** (Press Start 2P 400, clamp(2.25rem, 10vw, 4rem), 1–1.15): titolo della sala e del Memory; bianco con contorno nero 3px e ombra spostata mattone 6px. Anime: Syne 800, clamp(2.5rem, 11–12vw, 4.5rem), 0.98, maiuscolo.
- **Headline** (Press Start 2P 400, clamp(1.5rem, 7vw, 2.5rem), 1.25): titolo della classifica; banda di turno clamp(1.125rem, 5.5vw, 2.25rem). Anime: Syne 800, banda clamp(1.75rem, 8vw, 3rem) con il nome in oro sottolineato cremisi 5px.
- **Title** (Press Start 2P 400, 1.125rem, 1.3): titoli delle schede gioco; numero di livello "1-1" in oro. Anime: Syne 800, 1.75rem, non maiuscolo.
- **Body** (system-ui 600, ~1–1.1rem, 1.45): sottotitoli (max 34–40ch), stati, nomi. Anime: Plus Jakarta Sans 500.
- **Label** (Press Start 2P 400, 0.75–0.875rem, maiuscolo): pulsanti, punteggi, toggle. Anime: Plus Jakarta Sans 800, 0.75rem, tracking 0.08em, maiuscolo, colore g-muted (es. "Punti").

### Named Rules
**The Pixel Outline Rule.** Press Start 2P su sfondo libero è sempre bianco, maiuscolo, con contorno nero su quattro lati più un'ombra spostata (`.pixel-text`); non si usa per paragrafi.

**The Weight Is the Voice Rule.** Nella versione anime titoli grandi e pulsanti stanno a 800, titoli delle schede a 700. **Eccezione: i numeri** (punti, mosse, punteggio del flipper) stanno a 700, perché a 800 le cifre di Syne ("1", "0") diventano quasi illeggibili.

## Layout

Colonna unica centrata: pagina iniziale fino a 680px, Memory fino a 760px, schermate di impostazione e classifica fino a 560px, padding laterale 16px. La pagina è un flex verticale alto `100dvh` con il terreno di mattoni (48px, 32px su telefono) spinto in fondo. Ritmo degli spazi su 6 / 8 / 12 / 16 / 24px; bordi 3px nella classica.

Il tavolo del Memory si dimensiona da solo: larghezza = minimo tra 100%, colonne × 108px e (altezza schermo − `--board-offset`) × colonne / righe, così tutte le righe stanno nello schermo. Il canvas del flipper è dimensionato da JavaScript dentro l'area libera.

**Desktop:** Memory con HUD sopra la griglia; flipper con tavolo a sinistra e pannello HUD di 280px a destra. Nuvole pixel decorative nei margini solo da 1100px in su e solo di giorno.

**Telefono in verticale (≤ 480px):** barra in alto compatta (la parola "Audio" resta solo per gli screen reader, toggle a 0.6875rem, nome del tavolo nascosto nel flipper); Memory con punteggi su due colonne, e con 3–4 giocatori su una sola riga di 3 o 4 riquadri compatti (nell'anime sparisce la scritta "Punti"); "Tocca a te" nascosto, basta il riquadro colorato. Il pulsante INIZIA si allarga a tutta la riga. Flipper (≤ 760px): pannello sopra il tavolo, in griglia compatta (giocatore, moltiplicatore, pausa / punteggi / una riga di messaggio sempre riservata).

**Telefono in orizzontale (max-height 520px):** in entrambi i giochi l'HUD va di lato e il tavolo occupa tutta l'altezza; il Memory nasconde il terreno e mette punteggi a sinistra (2 colonne) e carte a destra (max 60vw); il flipper mette il pannello a destra (200–260px, scorrevole) e mostra il suggerimento di rotazione.

**Pulsante fisso di versione:** in basso a destra della pagina iniziale, rispettando le safe area, con 96px di spazio in fondo alla pagina perché non copra l'ultima scheda; su telefono resta su una riga.

## Elevation & Depth

La classica è piatta e dà profondità con smussi pixel interni: luce in alto a sinistra, ombra in basso a destra, nessuna sfocatura. Gli elementi "sollevati" si spostano in su di 4–6px invece di proiettare ombre. L'anime è a strati tonali: la profondità viene dalla scala g-surface e da ombre ampie e morbide solo per elementi selezionati o fluttuanti.

### Shadow Vocabulary
- **Smusso pulsante** (`box-shadow: inset 3px 3px 0 rgb(255 255 255 / 0.45), inset -3px -3px 0 rgb(0 0 0 / 0.35)`): pulsanti primari e CTA classici; alla pressione si inverte e il pulsante scende di 3px.
- **Smusso blocco** (`box-shadow: inset 4px 4px 0 var(--gold-light), inset -4px -4px 0 var(--gold-dark)`): blocchi "?", blocco scelto, vincitore; varianti per il blocco usato (#e08848 / #6e2a00) e il fronte della carta (bianco / #e2bf7c).
- **Fluttuante classico** (`box-shadow: …smusso…, 0 8px 20px rgb(0 0 0 / 0.35)`): solo il pulsante fisso di versione; il canvas usa `0 0 0 3px #000, 0 12px 30px rgb(0 0 0 / 0.3)`.
- **Bagliore cremisi** (`box-shadow: 0 8px 22px rgb(179 18 46 / 0.4)`): scelta del numero di giocatori nell'anime.
- **Alone di turno** (`box-shadow: 0 0 0 4px rgb(236 194 70 / 0.12)`): punteggio del giocatore di turno nell'anime.
- **Coppia trovata** (`box-shadow: 0 0 18px color-mix(in srgb, var(--player) 35%, transparent)`): carta abbinata nell'anime.
- **Ombra netta anime** (`--g-shadow: 3px 3px 0 #0d0b10`, in modalità chiara `rgb(29 20 24 / 0.18)`): tutte le schede, i riquadri e il canvas, come nelle schermate di Stitch; i pulsanti d'azione (CTA d'oro, FLIPPER SX/DX, pulsante fisso) usano `4px 4px 0` e quando si premono si spostano di 2px verso l'ombra.
- **Scheda di turno anime** (`0 0 0 1px rgb(179 18 46 / 0.6), 0 24px 60px rgb(0 0 0 / 0.7)`): cambio turno del Memory e "Tocca a…" del flipper.

### Named Rules
**The Bevel Not Blur Rule.** Nella classica la profondità è uno smusso inset o uno spostamento verticale; le ombre sfocate restano limitate al pulsante fisso e alla cornice del canvas.

**The Tonal Ladder Rule.** Nell'anime una superficie selezionata o di turno sale di un gradino nella scala g-surface e prende l'alone oro; a riposo è g-surface senza bordo visibile.

**La cornice delle schermate Stitch (anime).** Ogni pagina ha una barra fissa in alto alta 80px (logo col trifoglio, "SALA GIOCHI •" in oro e il nome della pagina, pulsanti-icona da 44px) e una barra di navigazione fissa in basso alta 64px (Hub · Memory · Flipper, la voce attiva con il filo d'oro in alto). Le crea `assets/barre-anime.js`; le icone a linee sono in `assets/icone.js`. Con il telefono in orizzontale la barra in alto scende a 52px e quella in basso sparisce, per lasciare spazio ai giochi.

## Shapes

Classica: angoli sempre vivi (`border-radius: 0`, `--radius: 0` nel flipper), bordi pieni da 3px — neri su blocchi e pulsanti colorati, bianchi su riquadri neri; il focus è un contorno tratteggiato 3px bianco (oro nel sotterraneo). Le forme ricorrenti sono quadrati: blocchi 64px con quattro rivetti negli angoli, cappello del giocatore 14px, tubi con bordo superiore più largo. Tutti i disegni sono pixel con `shape-rendering: crispEdges` / `image-rendering: pixelated`.

Anime (dalle schermate di Stitch): angoli piccoli — 2px per contatori e badge ("Facile", "Mosse"), 4px (`--g-radius-sm`) per pulsanti, campi, carte e riquadri interni, 8px (`--g-radius`) per schede e pannelli, 12px per le pastiglie ("Tocca a te!", "Cambio turno"). I pallini del giocatore diventano cerchi. Il focus è un contorno pieno 3px oro. I grimori della pagina iniziale hanno dorso asimmetrico (6px 14px 14px 6px) e sono ruotati di −5°.

## Components

### Buttons
- **Shape:** classica a spigolo vivo con bordo nero 3px; anime arrotondati (12px) senza bordo.
- **Primary:** classica rosso cappello, Press Start 2P 0.875rem maiuscolo, minimo 48px, padding 12px 22px, smusso inset, testo con ombra 2px; anime oro con testo g-on-gold, Syne 800 tracking 0.04em.
- **Hover / Active:** classica hover più scuro, pressione con discesa di 3px e smusso invertito (80ms a scatti, `steps(2)`); anime hover oro chiaro, pressione `scale(0.98)` (100ms ease).
- **Secondary / Ghost:** classica riquadro nero con bordo bianco senza smusso; anime g-surface-high con testo oro, hover g-surface-highest.
- **Inizia (Memory, anime):** cremisi, testo bianco, 64px di altezza, 1.125rem.
- **Taglie:** large 56–60px, small 38–40px.

### Theme toggle e audio
Due pulsanti gemelli nella barra in alto dei giochi (40px). Classica: nero, bordo bianco 3px, pixel 0.75rem; l'audio acceso ha bordo e stato "on" in oro, spento "off" lavanda, con altoparlante pixel (onde o X). Anime: g-surface-high, raggio 12px, Syne 800; toggle versione in oro, audio acceso in smeraldo. Il toggle di versione dice dove si va ("Anime" / "Classica") e porta un aria-label completo.

### Pulsante fisso di versione (pagina iniziale)
Classica: blocco rosso con bordo bianco, icona scintilla in oro, testo "Prova la versione anime". Anime: pillola cremisi con bordo oro 2px e testo oro chiaro, "Torna alla versione classica". Hover: sale di 3px.

### Cards / Containers
- **Riquadro messaggi (classica):** nero, bordo bianco 3px, testo bianco semibold centrato, min 48px. Anime: g-surface, raggio 14px, senza bordo. Nel flipper il messaggio è una riga velata (bianco 8%), nell'anime g-surface-lowest con testo smeraldo.
- **Scheda gioco (pagina iniziale):** classica riquadro nero orizzontale con blocco 64px (blocco "?" d'oro per il Memory, blocco cielo col Super Fungo per il flipper), titolo pixel con numero di livello "1-1"/"1-2" in oro, CTA rossa "Gioca"; hover: sale di 4px e il blocco sobbalza. Anime: scheda verticale g-surface raggio 16px con copertina 16:7 (grimorio cremisi o smeraldo col trifoglio, alone colorato), titolo Syne 1.75rem, CTA oro a tutta larghezza ("Apri il grimorio", "Lancia la sfera"); hover: il grimorio si raddrizza e sale.
- **Overlay del flipper:** velo nero 55%, scheda centrale fino a 380px con titolo pixel e ombra del colore del giocatore; anime velo g-surface-lowest 78% e scheda con sfumatura cremisi → g-surface.

### Inputs / Fields
- **Campo nome:** classica nero con bordo bianco 3px, cappello del giocatore a sinistra, testo bianco; anime g-surface-lowest, bordo 1px g-line, raggio 12px, pallino rotondo.
- **Focus:** il bordo prende il colore del giocatore; nella classica più contorno tratteggiato bianco.
- **Scelte (radio nascosti, raggiungibili da tastiera):** numero di giocatori come blocchi di mattoni che, scelti, diventano blocchi d'oro sollevati di 6px; anime tasti g-surface-high che, scelti, diventano cremisi con bagliore. Difficoltà del Memory come tre tubi verdi di altezza crescente (26/52/78px) su una fila di mattoni, quello scelto a colori pieni con freccia oro che oscilla; anime tre "tomi" con trifoglio, quello scelto con bordo oro.

### Navigation
Barra in alto dei giochi: link "indietro" in inchiostro (anime g-text-soft) con sottolineatura 2px all'hover, a destra toggle di versione e audio. La pagina iniziale non ha barra: le schede sono la navigazione.

### HUD e punteggi
Riquadri per giocatore con cappello, nome e moneta × punti (pixel). Il giocatore di turno: classica riempimento del suo colore, bordo bianco, sollevato di 4px; anime bordo oro, g-surface-highest, alone oro, pillola cremisi "Tocca a te", punti in Syne 1.5rem oro preceduti da "Punti". Il moltiplicatore del flipper è un numero pixel oro (anime: targhetta oro). Quando un giocatore segna, i punti fanno un piccolo balzo.

### Carta del Memory (componente firma)
Classica: il dorso è un blocco "?" d'oro con rivetti e smusso, il fronte crema con emoji o ritratto e fascia nera col nome in basso (nascosta sotto i 64px). Girarla è una rotazione 3D di 420ms con sobbalzo del blocco; a coppia trovata il blocco diventa "usato" (marrone) con fascia del colore di chi l'ha trovata e una moneta pixel salta fuori. Anime: dorso scuro con trifoglio d'oro al centro, fronte con bordo oro e alone radiale, coppia trovata con bordo 3px e bagliore del colore del giocatore, al posto della moneta salta fuori un trifoglio.

### Banda "Tocca a …"
Banda a tutta larghezza al 40% dell'altezza, si apre in verticale e sparisce in 1.5s, senza bloccare i clic. Classica: nera con bordi superiori e inferiori 6px del colore del giocatore, nome pixel con ombra del suo colore. Anime: sfumatura cremisi scuro → g-surface-low, nome in oro sottolineato cremisi.

### Classifica
Righe come i riquadri messaggi; il vincitore (anche a pari merito) è un blocco d'oro con testo nero (classica) o g-surface-highest con bordo oro e numeri oro (anime, con " pt" al posto della moneta).

### Tavolo del flipper (canvas)
Lo stesso tracciato con due temi in `pinball/js/config/theme.js`. "Regno dei Funghi": cielo, colline e nuvole, pareti di mattoni con bordo nero, bumper Super Fungo, aletta sinistra rossa e destra verde, monete come bersagli, scintille bianche. "Sfera Anti-Magia": fondo scuro a puntini con grande trifoglio inciso, pareti g-surface-high con bordo oro, bumper a sigillo cremisi, aletta sinistra cremisi e destra smeraldo, scintille di mana dorate. Il nome del tavolo è dipinto sul campo in trasparenza. Il pulsante "Lancia" sta sopra la corsia di lancio: blocco oro (classica) o pulsante oro raggio 12px (anime).

### Movimento
Classica a scatti (`steps()`, 80–150ms) con sobbalzo dei blocchi (260ms); anime transizioni morbide (`ease`, 100–200ms). Con "riduci movimento" spariscono sobbalzi, monete e transizioni dei pulsanti, la rotazione delle carte diventa istantanea e la banda di turno appare e sparisce solo in dissolvenza.

## Do's and Don'ts

### Do:
- **Do** costruire ogni nuova schermata sul markup comune e aggiungere la versione anime solo con override `[data-theme='anime']` e variabili `--g-*`.
- **Do** coprire entrambe le versioni a ogni modifica, con le coppie `.only-classica` / `.only-anime` quando cambia il testo.
- **Do** segnalare il turno con il colore del giocatore (riempimento + bordo bianco + sollevamento nella classica; bordo oro + g-surface-highest nell'anime).
- **Do** usare angoli vivi, bordi 3px e smussi inset nella classica; raggi 12/14/16px e la scala tonale nell'anime.
- **Do** disegnare le nuove icone e decorazioni come SVG in pixel (crispEdges) nella classica, o come disegni originali a linea d'oro nell'anime, inline nel CSS o sul canvas.
- **Do** mettere testo g-on-gold sull'oro anime e testo nero sull'oro del vincitore classico.
- **Do** tenere i bersagli tattili ad almeno 40–48px e il tavolo sempre intero nello schermo, verificando telefono in verticale, in orizzontale (max-height 520px) e desktop.
- **Do** dare a ogni animazione la sua alternativa con `prefers-reduced-motion: reduce`.

### Don't:
- **Don't** arrotondare gli angoli o aggiungere ombre sfocate agli elementi della versione classica.
- **Don't** usare Press Start 2P per paragrafi o testo lungo, né senza il contorno nero su fondo libero.
- **Don't** mettere testo bianco direttamente sull'oro (#ecc246 o #f8b800): sopra l'oro il testo è scuro (#1d0f00 nella classica, g-on-gold nell'anime), come nel pulsante Lancia e nel numero di giocatori scelto.
- **Don't** introdurre colori fuori dalle due tavolozze; i colori anime vanno presi dalle variabili `--g-*`.
- **Don't** aggiungere immagini ufficiali, loghi o raster scaricati alla repo; trifoglio e sigillo sono disegni originali.
