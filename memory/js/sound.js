/*
 * SUONI
 *
 * Effetti e musichetta in stile 8 bit, generati dal browser con la Web Audio API:
 * nessun file audio da scaricare. Melodie e suoni sono originali.
 *
 * Come funziona, in breve: un "oscillatore" produce un'onda a una certa
 * frequenza (la nota); un "gain" ne regola il volume. Per ogni nota creiamo
 * un oscillatore, lo facciamo suonare per un po' e poi lo fermiamo.
 *
 * L'audio parte spento. I browser permettono di avviarlo solo dopo un clic
 * o un tasto premuto dall'utente, quindi l'AudioContext viene creato al primo uso.
 */

const STORAGE_KEY = 'memory-audio';
const SFX_VOLUME = 0.12;
const MUSIC_VOLUME = 0.05;

let context = null; // l'AudioContext, creato al primo suono
let soundOn = readSavedPreference();
let musicTimer = null; // timer che programma il prossimo giro della musica
let musicGain = null; // volume della musica: abbassandolo a 0 la fermiamo

// --- Preferenza salvata ----------------------------------------------------

function readSavedPreference() {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'on';
  } catch {
    return false; // navigazione privata o archivio bloccato: audio spento
  }
}

export function isSoundOn() {
  return soundOn;
}

export function setSoundOn(value) {
  soundOn = value;
  try {
    localStorage.setItem(STORAGE_KEY, value ? 'on' : 'off');
  } catch {
    // Se non si può salvare, la scelta vale solo per questa visita.
  }
  if (!value) stopMusic();
}

// --- Note e strumenti ------------------------------------------------------

/** Frequenza (Hz) di una nota scritta come "C5", "F#4", "A3"… */
function noteToFrequency(note) {
  const names = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const name = note.slice(0, -1);
  const octave = Number(note.slice(-1));
  const semitonesFromA4 = names.indexOf(name) - 9 + (octave - 4) * 12;
  return 440 * 2 ** (semitonesFromA4 / 12);
}

function getContext() {
  if (!context) {
    context = new AudioContext();
  }
  if (context.state === 'suspended') {
    context.resume();
  }
  return context;
}

/**
 * Suona una nota.
 * @param {object} options
 * @param {number} options.frequency - in Hz
 * @param {number} options.start - quando inizia (secondi, sull'orologio dell'AudioContext)
 * @param {number} options.duration - quanto dura (secondi)
 * @param {OscillatorType} [options.wave] - 'square' (suono 8 bit), 'triangle' (più morbido)
 * @param {number} [options.volume]
 * @param {number} [options.slideTo] - frequenza finale, per un suono che scivola
 * @param {AudioNode} [options.output] - dove mandare il suono
 */
function playTone({ frequency, start, duration, wave = 'square', volume = SFX_VOLUME, slideTo, output }) {
  const ctx = getContext();
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();

  oscillator.type = wave;
  oscillator.frequency.setValueAtTime(frequency, start);
  if (slideTo) {
    oscillator.frequency.exponentialRampToValueAtTime(slideTo, start + duration);
  }

  // Attacco rapido e rilascio breve: evita i "clic" a inizio e fine nota
  gain.gain.setValueAtTime(0, start);
  gain.gain.linearRampToValueAtTime(volume, start + 0.01);
  gain.gain.setValueAtTime(volume, start + duration * 0.7);
  gain.gain.linearRampToValueAtTime(0, start + duration);

  oscillator.connect(gain).connect(output ?? ctx.destination);
  oscillator.start(start);
  oscillator.stop(start + duration + 0.02);
}

/** Suona una sequenza di note veloci, una dopo l'altra. */
function playNotes(notes, noteLength, { delay = 0, wave = 'square' } = {}) {
  if (!soundOn) return;
  const start = getContext().currentTime + delay;
  notes.forEach((note, index) => {
    playTone({ frequency: noteToFrequency(note), start: start + index * noteLength, duration: noteLength, wave });
  });
}

// --- Effetti sonori --------------------------------------------------------

/** Blocco colpito: un "tump" che sale. */
export function playFlip() {
  if (!soundOn) return;
  playTone({ frequency: 260, slideTo: 620, start: getContext().currentTime, duration: 0.08 });
}

/** Coppia trovata: tre note che salgono, come una moneta raccolta. */
export function playCoin({ delay = 0 } = {}) {
  playNotes(['C6', 'E6', 'G6'], 0.06, { delay });
}

/** Carte diverse: due note che scendono. */
export function playMismatch({ delay = 0 } = {}) {
  playNotes(['D#4', 'A3'], 0.12, { delay, wave: 'triangle' });
}

/** Cambio turno: un piccolo richiamo. */
export function playTurn() {
  playNotes(['A5', 'D6'], 0.09);
}

/** Fine partita: fanfara breve. */
export function playFanfare() {
  playNotes(['C5', 'E5', 'G5', 'C6', 'G5', 'C6', 'E6'], 0.13);
}

/** Pulsante audio acceso: conferma che si sente. */
export function playToggleOn() {
  playNotes(['G5', 'C6'], 0.07);
}

// --- Musica di sottofondo --------------------------------------------------

// Melodia originale in Do maggiore, a crome (null = pausa)
const MELODY = [
  'C5', null, 'E5', 'G5', null, 'E5', 'A5', 'G5',
  'F5', null, 'D5', 'F5', null, 'A5', 'G5', null,
  'E5', null, 'G5', 'C6', null, 'B5', 'A5', 'G5',
  'F5', 'E5', 'D5', null, 'G4', null, null, null,
  'A4', null, 'C5', 'E5', null, 'C5', 'F5', 'E5',
  'D5', null, 'B4', 'D5', null, 'F5', 'E5', null,
  'C5', 'E5', 'G5', 'E5', 'F5', 'D5', 'B4', 'G4',
  'C5', null, null, null, null, null, null, null,
];

// Basso a semiminime (una nota ogni due crome della melodia)
const BASS = [
  'C3', 'G3', 'C3', 'G3', 'F2', 'C3', 'F2', 'C3',
  'C3', 'G3', 'E3', 'G3', 'G2', 'D3', 'G2', 'B2',
  'A2', 'E3', 'A2', 'E3', 'G2', 'D3', 'G2', 'D3',
  'C3', 'G3', 'F2', 'G2', 'C3', 'G2', 'C3', null,
];

const EIGHTH = 0.2; // durata di una croma in secondi (150 battiti al minuto)

export function startMusic() {
  if (!soundOn || musicTimer !== null) return;
  const ctx = getContext();
  musicGain = ctx.createGain();
  musicGain.gain.value = 1;
  musicGain.connect(ctx.destination);
  scheduleMusicLoop(ctx.currentTime + 0.1);
}

/** Programma un giro completo della musica e, poco prima che finisca, il giro dopo. */
function scheduleMusicLoop(start) {
  const output = musicGain;

  MELODY.forEach((note, index) => {
    if (note) {
      playTone({
        frequency: noteToFrequency(note),
        start: start + index * EIGHTH,
        duration: EIGHTH * 0.9,
        volume: MUSIC_VOLUME,
        output,
      });
    }
  });

  BASS.forEach((note, index) => {
    if (note) {
      playTone({
        frequency: noteToFrequency(note),
        start: start + index * EIGHTH * 2,
        duration: EIGHTH * 1.8,
        wave: 'triangle',
        volume: MUSIC_VOLUME * 1.6,
        output,
      });
    }
  });

  const loopLength = MELODY.length * EIGHTH;
  const msUntilNextLoop = (start + loopLength - context.currentTime - 0.3) * 1000;
  musicTimer = setTimeout(() => scheduleMusicLoop(start + loopLength), msUntilNextLoop);
}

export function stopMusic() {
  clearTimeout(musicTimer);
  musicTimer = null;
  if (musicGain) {
    // Le note già programmate restano in coda: azzeriamo il loro volume e scolleghiamo
    musicGain.gain.setValueAtTime(0, context.currentTime);
    musicGain.disconnect();
    musicGain = null;
  }
}
