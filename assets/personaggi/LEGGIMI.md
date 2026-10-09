# Immagini dei personaggi (facoltative)

Il Memory mostra sulle carte i personaggi della versione scelta:

- **versione classica**: Super Mario (Mario, Luigi, Peach, …);
- **versione anime**: Black Clover (Asta, Yuno, Noelle, …).

Senza immagini, ogni carta mostra il **nome** del personaggio e un'**emoji**. Le immagini non sono incluse nella repo, perché appartengono ai rispettivi autori (Nintendo; Yuki Tabata / Shueisha).

## Come aggiungerle

1. Metti le immagini in questa cartella, una sottocartella per versione:
   ```
   assets/personaggi/classica/mario.png
   assets/personaggi/anime/asta.png
   ```
   Vanno bene immagini quadrate di circa 256×256 pixel, in PNG, JPG o WebP.
2. Apri `memory/js/characters.js` e, accanto al personaggio, scrivi il percorso **relativo alla cartella `memory/`**:
   ```js
   { name: 'Mario', emoji: '🧢', image: '../assets/personaggi/classica/mario.png' },
   ```
3. Ricarica la pagina. I personaggi senza `image` continuano a mostrare l'emoji.

## Attenzione: GitHub Pages è pubblico

Un sito su GitHub Pages è visibile a chiunque abbia il link, anche se la repo è privata. Se le immagini devono restare solo per uso scolastico in locale, non metterle nel commit: aggiungi questa riga al file `.gitignore` nella cartella principale:

```
assets/personaggi/*/
```
