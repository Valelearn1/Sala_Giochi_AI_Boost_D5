/*
 * PERSONAGGI DELLE CARTE
 *
 * Due mazzi, uno per ogni versione della sala:
 * - "classica": personaggi del mondo di Super Mario (Nintendo);
 * - "anime": personaggi di Black Clover (Yuki Tabata / Shueisha).
 * I personaggi appartengono ai rispettivi autori: qui sono usati solo
 * per un progetto scolastico, senza scopo di lucro.
 *
 * Ogni personaggio ha:
 * - name:  il nome scritto sulla carta e letto dagli screen reader;
 * - emoji: il disegno di riserva, usato quando non c'è un'immagine;
 * - image: percorso di un'immagine (facoltativo). Le immagini NON sono
 *   nella repo: chi vuole le aggiunge in assets/personaggi/ e scrive qui
 *   il percorso, relativo alla cartella memory/ (es. '../assets/personaggi/classica/mario.png').
 *   Con image: null la carta mostra l'emoji, senza errori.
 *
 * Servono almeno 18 personaggi per mazzo (le coppie della griglia 6×6).
 */

export const CHARACTERS = {
  classica: [
    { name: 'Mario', emoji: '🧢', image: null },
    { name: 'Luigi', emoji: '🔦', image: null },
    { name: 'Peach', emoji: '👑', image: null },
    { name: 'Daisy', emoji: '🌼', image: null },
    { name: 'Rosalinda', emoji: '⭐', image: null },
    { name: 'Toad', emoji: '🍄', image: null },
    { name: 'Toadette', emoji: '🎀', image: null },
    { name: 'Yoshi', emoji: '🦖', image: null },
    { name: 'Bowser', emoji: '🔥', image: null },
    { name: 'Bowser Jr.', emoji: '🖌️', image: null },
    { name: 'Koopa Troopa', emoji: '🐢', image: null },
    { name: 'Goomba', emoji: '🌰', image: null },
    { name: 'Boo', emoji: '👻', image: null },
    { name: 'Lakitu', emoji: '☁️', image: null },
    { name: 'Tipo Timido', emoji: '🎭', image: null },
    { name: 'Wario', emoji: '💰', image: null },
    { name: 'Waluigi', emoji: '🎾', image: null },
    { name: 'Donkey Kong', emoji: '🦍', image: null },
  ],
  anime: [
    { name: 'Asta', emoji: '⚔️', image: null },
    { name: 'Yuno', emoji: '🌪️', image: null },
    { name: 'Noelle', emoji: '💧', image: null },
    { name: 'Yami', emoji: '🌑', image: null },
    { name: 'Luck', emoji: '⚡', image: null },
    { name: 'Vanessa', emoji: '🧶', image: null },
    { name: 'Magna', emoji: '🔥', image: null },
    { name: 'Finral', emoji: '🌀', image: null },
    { name: 'Charmy', emoji: '🍙', image: null },
    { name: 'Gauche', emoji: '🪞', image: null },
    { name: 'Grey', emoji: '🎭', image: null },
    { name: 'Zora', emoji: '🪤', image: null },
    { name: 'Mimosa', emoji: '🌸', image: null },
    { name: 'Klaus', emoji: '🛡️', image: null },
    { name: 'Julius', emoji: '⏳', image: null },
    { name: 'Nacht', emoji: '🦇', image: null },
    { name: 'Liebe', emoji: '😈', image: null },
    { name: 'Secre', emoji: '🕊️', image: null },
  ],
};

/** Il mazzo della versione indicata (se la versione non esiste, quello classico). */
export function getCharacters(theme) {
  return CHARACTERS[theme] ?? CHARACTERS.classica;
}
