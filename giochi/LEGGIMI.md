# Giochi dei compagni

Qui arrivano i giochi importati dalle sale dei compagni. Ogni gioco sta nella sua cartella, per esempio `giochi/tris-di-luca/`, ed è registrato in `giochi.json` (nella cartella principale) insieme alla **provenienza**: repository, commit e autore.

La pagina iniziale legge `giochi.json` e mostra da sola una scheda per ogni gioco, con scritto "Arriva da …".

## Come si importa un gioco

Con Claude Code, dalla cartella della repo:

> Clona il gioco di https://github.com/compagno/sala-giochi

Se ne occupa l'agente **bibliotecario** (`.claude/agents/bibliotecario.md`):

1. scarica la repo in una cartella temporanea, mai direttamente qui;
2. legge i file e cerca codice sospetto **prima** di eseguire qualunque cosa;
3. copia solo il gioco in `giochi/<nome>/` e aggiunge la voce in `giochi.json`;
4. lancia `node strumenti/verifica.js giochi/<nome>`. Se il gioco non passa, resta fuori e il bibliotecario dice perché;
5. se passa, fa il commit.

## Cosa deve rispettare un gioco

La verifica (`strumenti/verifica.js`) controlla che il gioco:

- abbia un `index.html` nella sua cartella e funzioni **senza build step**;
- non carichi niente da Internet (niente CDN: font e librerie vanno salvati nella cartella del gioco);
- usi solo percorsi interni alla sua cartella;
- non contenga codice sospetto (`eval`, invio di dati a siti esterni, cookie, cancellazione del `localStorage`…);
- contenga solo file di tipi ammessi (HTML, CSS, JS, JSON, immagini, audio, font) e pesi al massimo 15 MB;
- dichiari in `giochi.json` da quale repository arriva.

Per controllare tutta la sala: `node strumenti/verifica.js --tutti`.
