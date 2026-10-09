# File audio facoltativi

Memory e flipper generano da soli tutti i suoni (`assets/suoni.js`), diversi per ogni versione della sala:

- **classica**: suoni 8-bit;
- **anime**: suoni "magici" originali, come pagine di grimorio, fendenti, rintocchi e campanelle con eco.

Se hai file audio tuoi (per esempio per la versione anime), puoi usarli **al posto** di un suono generato.

## Come aggiungerli

1. Metti i file in questa cartella, una sottocartella per versione:
   ```
   assets/suoni/anime/bumper.mp3
   ```
   Vanno bene MP3, OGG o WAV, brevi (meno di un secondo per gli effetti).
2. Apri `assets/suoni.js` e scrivi il percorso in `FILE_AUDIO`, **relativo alla pagina del gioco**:
   ```js
   anime: {
     bumper: '../assets/suoni/anime/bumper.mp3',
   },
   ```
3. Ricarica la pagina. I suoni senza file restano quelli generati.

## Nomi dei suoni

| Nome | Quando suona |
| --- | --- |
| `flip`, `match`, `mismatch` | Memory: carta girata, coppia trovata, carte diverse |
| `turn`, `fanfare`, `toggleOn` | cambio turno, fine partita, audio acceso |
| `flipper`, `launch` | flipper: aletta, lancio della pallina |
| `bumper`, `slingshot`, `target`, `lane`, `outlane` | flipper: elementi colpiti |
| `targetBank`, `multiplier` | flipper: tutti i bersagli giù, moltiplicatore che sale |
| `drain`, `ballSave` | flipper: pallina persa, pallina salvata |

## Attenzione

Sigle, musiche e voci degli anime e dei videogiochi sono protette dal diritto d'autore. Come per le immagini (vedi `assets/personaggi/LEGGIMI.md`), un sito GitHub Pages è pubblico: se usi file non tuoi, tienili solo in locale e aggiungi al `.gitignore` la riga `assets/suoni/*/`.
