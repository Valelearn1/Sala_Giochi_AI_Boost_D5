/*
 * SUONI DELLA SALA GIOCHI (modulo comune a Memory e flipper)
 *
 * Tutti i suoni sono generati dal browser con la Web Audio API: nessun file da
 * scaricare, melodie ed effetti originali. Ogni versione della sala ha i suoi:
 * - "classica": suoni 8-bit (onde quadre, come le vecchie console);
 * - "anime":    suoni "magici" (campanelle con eco, fendenti, pagine di grimorio).
 *
 * Uso:   import * as suoni from '../../assets/suoni.js';
 *        suoni.play('bumper');            // effetto
 *        suoni.play('match', { delay: 0.3 });
 *        suoni.startMusic(); suoni.stopMusic();
 *
 * Chi ha file audio propri (es. per la versione anime) può usarli al posto dei
 * suoni generati: vedi FILE_AUDIO qui sotto e assets/suoni/LEGGIMI.md.
 *
 * L'audio parte spento. I browser permettono di avviarlo solo dopo un clic o
 * un tasto, quindi l'AudioContext viene creato al primo uso.
 */

const STORAGE_KEY = 'sala-audio';
const OLD_STORAGE_KEY = 'memory-audio'; // chiave usata in passato dal solo Memory
const SFX_VOLUME = 0.12;
const MUSIC_VOLUME = 0.05;
const VOLUME_KEY = 'sala-volume'; // volume generale scelto con lo slider, da 0 a 1

/*
 * File audio facoltativi, per versione e per nome del suono.
 * Percorso relativo alla pagina del gioco, es. '../assets/suoni/anime/bumper.mp3'.
 * Con null si usa il suono generato.
 */
export const FILE_AUDIO = {
  classica: {},
  anime: {
    // bumper: '../assets/suoni/anime/bumper.mp3',
  },
  simpson: {},
};

let context = null;
let soundOn = readSavedPreference();
let musicTimer = null;
let musicGain = null;
const decodedFiles = new Map(); // percorso → AudioBuffer già caricato
let masterGain = null; // tutti i suoni passano da qui: è la manopola del volume
let volume = readSavedVolume();

// --- Preferenza salvata ----------------------------------------------------

function readSavedPreference() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY) ?? localStorage.getItem(OLD_STORAGE_KEY);
    return saved === 'on';
  } catch {
    return false; // navigazione privata o archivio bloccato: audio spento
  }
}

function readSavedVolume() {
  try {
    const saved = Number(localStorage.getItem(VOLUME_KEY));
    return localStorage.getItem(VOLUME_KEY) !== null && saved >= 0 && saved <= 1 ? saved : 1;
  } catch {
    return 1;
  }
}

/** Volume generale, da 0 (muto) a 1 (pieno). */
export function getVolume() {
  return volume;
}

export function setVolume(value) {
  volume = Math.min(1, Math.max(0, value));
  // Una rampa brevissima: senza, cambiando volume si sentirebbe un "clic"
  if (masterGain) masterGain.gain.setTargetAtTime(volume, masterGain.context.currentTime, 0.02);
  try {
    localStorage.setItem(VOLUME_KEY, String(volume));
  } catch {
    // Se non si può salvare, il volume vale solo per questa visita
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
    // Se non si può salvare, la scelta vale solo per questa visita
  }
  if (!value) stopMusic();
}

/** La versione attiva della sala (vedi assets/tema.js). */
function currentVersion() {
  const version = window.SalaTema?.get();
  return version === 'anime' || version === 'simpson' ? version : 'classica';
}

// --- Strumenti di base -----------------------------------------------------

function getContext() {
  if (!context) {
    context = new AudioContext();
    masterGain = context.createGain();
    masterGain.gain.value = volume;
    masterGain.connect(context.destination);
  }
  if (context.state === 'suspended') context.resume();
  return context;
}

/** Frequenza (Hz) di una nota scritta come "C5", "F#4", "Bb3"… */
function noteToFrequency(note) {
  const names = { C: 0, 'C#': 1, Db: 1, D: 2, 'D#': 3, Eb: 3, E: 4, F: 5, 'F#': 6, Gb: 6, G: 7, 'G#': 8, Ab: 8, A: 9, 'A#': 10, Bb: 10, B: 11 };
  const name = note.slice(0, -1);
  const octave = Number(note.slice(-1));
  return 440 * 2 ** ((names[name] - 9 + (octave - 4) * 12) / 12);
}

/**
 * Suona una nota. `wave`: 'square' (8-bit), 'triangle', 'sine' (morbido).
 * `slideTo`: frequenza finale per un suono che scivola. `output`: dove mandarlo.
 */
function tone({ frequency, start, duration, wave = 'square', volume = SFX_VOLUME, slideTo, output }) {
  const ctx = getContext();
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();
  oscillator.type = wave;
  oscillator.frequency.setValueAtTime(frequency, start);
  if (slideTo) oscillator.frequency.exponentialRampToValueAtTime(slideTo, start + duration);

  // Attacco rapido e rilascio breve: evita i "clic" a inizio e fine nota
  gain.gain.setValueAtTime(0, start);
  gain.gain.linearRampToValueAtTime(volume, start + 0.008);
  gain.gain.setValueAtTime(volume, start + duration * 0.6);
  gain.gain.linearRampToValueAtTime(0, start + duration);

  oscillator.connect(gain).connect(output ?? masterGain);
  oscillator.start(start);
  oscillator.stop(start + duration + 0.02);
}

/** Campanella: nota con coda lunga che sfuma (per i suoni magici). */
function bell({ frequency, start, duration = 0.6, volume = SFX_VOLUME, output }) {
  const ctx = getContext();
  for (const [ratio, level] of [[1, 1], [2.76, 0.35]]) {
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(frequency * ratio, start);
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(volume * level, start + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    oscillator.connect(gain).connect(output ?? withEcho());
    oscillator.start(start);
    oscillator.stop(start + duration + 0.05);
  }
}

/** Rumore filtrato: fruscii, fendenti, colpi. `from`/`to`: frequenza del filtro che si sposta. */
function noise({ start, duration, from = 2000, to = from, volume = SFX_VOLUME, type = 'bandpass', output }) {
  const ctx = getContext();
  const length = Math.ceil(ctx.sampleRate * duration);
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1;

  const source = ctx.createBufferSource();
  source.buffer = buffer;
  const filter = ctx.createBiquadFilter();
  filter.type = type;
  filter.Q.value = 1.2;
  filter.frequency.setValueAtTime(from, start);
  filter.frequency.exponentialRampToValueAtTime(to, start + duration);
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(volume, start);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

  source.connect(filter).connect(gain).connect(output ?? masterGain);
  source.start(start);
}

/** Un'eco leggera (per dare "spazio" ai suoni magici). Una sola, condivisa da tutti i suoni. */
let echoInput = null;
function withEcho() {
  if (echoInput) return echoInput;
  const ctx = getContext();
  echoInput = ctx.createGain();
  const delay = ctx.createDelay();
  const feedback = ctx.createGain();
  delay.delayTime.value = 0.13;
  feedback.gain.value = 0.3;
  echoInput.connect(masterGain);
  echoInput.connect(delay);
  delay.connect(feedback).connect(delay);
  delay.connect(masterGain);
  return echoInput;
}

/** Sequenza di note veloci. */
function notes(list, length, start, options = {}) {
  list.forEach((note, i) => {
    if (note) tone({ frequency: noteToFrequency(note), start: start + i * length, duration: length, ...options });
  });
}

/** Sequenza di campanelle. */
function bells(list, gap, start, duration = 0.5) {
  list.forEach((note, i) => bell({ frequency: noteToFrequency(note), start: start + i * gap, duration }));
}

// --- Ricette dei suoni: versione classica (8-bit) ----------------------------

const CLASSICA = {
  // Memory
  flip: (t) => tone({ frequency: 260, slideTo: 620, start: t, duration: 0.08 }),
  match: (t) => notes(['C6', 'E6', 'G6'], 0.06, t),
  mismatch: (t) => notes(['D#4', 'A3'], 0.12, t, { wave: 'triangle' }),
  turn: (t) => notes(['A5', 'D6'], 0.09, t),
  fanfare: (t) => notes(['C5', 'E5', 'G5', 'C6', 'G5', 'C6', 'E6'], 0.13, t),
  toggleOn: (t) => notes(['G5', 'C6'], 0.07, t),
  // Flipper
  flipper: (t) => tone({ frequency: 180, slideTo: 90, start: t, duration: 0.04, volume: 0.08 }),
  bumper: (t) => tone({ frequency: 620, slideTo: 300, start: t, duration: 0.09 }),
  slingshot: (t) => tone({ frequency: 900, slideTo: 450, start: t, duration: 0.05 }),
  target: (t) => notes(['E6', 'B6'], 0.05, t),
  targetBank: (t) => notes(['C5', 'E5', 'G5', 'C6', 'E6', 'G6'], 0.06, t),
  lane: (t) => tone({ frequency: noteToFrequency('D6'), start: t, duration: 0.06 }),
  multiplier: (t) => notes(['G5', 'B5', 'D6', 'G6', 'D6', 'G6'], 0.07, t),
  outlane: (t) => notes(['E5', 'C5', 'A4'], 0.08, t, { wave: 'triangle' }),
  launch: (t) => tone({ frequency: 200, slideTo: 1000, start: t, duration: 0.25, volume: 0.09 }),
  drain: (t) => notes(['G4', 'E4', 'C4', 'G3'], 0.14, t, { wave: 'triangle' }),
  ballSave: (t) => notes(['A5', 'C#6', 'E6', 'A6'], 0.07, t),
  // Corsa
  countdown: (t) => tone({ frequency: noteToFrequency('A4'), start: t, duration: 0.15 }),
  go: (t) => tone({ frequency: noteToFrequency('A5'), start: t, duration: 0.45 }),
  lap: (t) => notes(['E6', 'G6', 'E7'], 0.06, t),
};

// --- Ricette dei suoni: versione anime (magia) -------------------------------

const ANIME = {
  // Memory: una pagina del grimorio che si gira, rune che si accendono
  flip: (t) => noise({ start: t, duration: 0.09, from: 3500, to: 1200, volume: 0.1 }),
  match: (t) => bells(['E6', 'G#6', 'B6'], 0.07, t, 0.6),
  mismatch: (t) => {
    tone({ frequency: noteToFrequency('A3'), start: t, duration: 0.25, wave: 'triangle', volume: 0.08 });
    tone({ frequency: noteToFrequency('Bb3'), start: t, duration: 0.25, wave: 'triangle', volume: 0.08 });
  },
  turn: (t) => {
    noise({ start: t, duration: 0.14, from: 7000, to: 1800, type: 'highpass', volume: 0.09 }); // fendente
    bells(['A5', 'E6'], 0.12, t + 0.12, 0.9); // rintocco
  },
  fanfare: (t) => {
    bells(['D5', 'F5', 'A5', 'D6'], 0.14, t, 0.7);
    bells(['A5', 'C#6', 'E6', 'A6'], 0.1, t + 0.7, 1.2);
  },
  toggleOn: (t) => bells(['B6', 'E7'], 0.06, t, 0.4),
  // Flipper: le alette sono spade, i bumper sigilli magici
  flipper: (t) => noise({ start: t, duration: 0.07, from: 6000, to: 2500, type: 'highpass', volume: 0.07 }), // fendente
  bumper: (t) => {
    noise({ start: t, duration: 0.04, from: 1500, volume: 0.08 });
    bell({ frequency: noteToFrequency('E5'), start: t, duration: 0.4, volume: 0.09 });
  },
  slingshot: (t) => noise({ start: t, duration: 0.06, from: 4000, to: 1500, volume: 0.09 }),
  target: (t) => bell({ frequency: noteToFrequency('B6'), start: t, duration: 0.35 }), // cristallo
  targetBank: (t) => {
    tone({ frequency: 300, slideTo: 1200, start: t, duration: 0.35, wave: 'sine', volume: 0.08 });
    bells(['E6', 'G#6', 'B6', 'E7'], 0.06, t + 0.25, 0.8);
  },
  lane: (t) => bell({ frequency: noteToFrequency('E6'), start: t, duration: 0.3, volume: 0.08 }), // runa
  multiplier: (t) => {
    tone({ frequency: 220, slideTo: 880, start: t, duration: 0.4, wave: 'sawtooth', volume: 0.04 });
    bells(['A5', 'C#6', 'E6', 'A6'], 0.08, t + 0.3, 0.9);
  },
  outlane: (t) => noise({ start: t, duration: 0.3, from: 1200, to: 200, volume: 0.09 }),
  launch: (t) => noise({ start: t, duration: 0.35, from: 400, to: 3000, volume: 0.1 }), // la sfera parte
  drain: (t) => tone({ frequency: 110, slideTo: 45, start: t, duration: 0.5, wave: 'sine', volume: 0.16 }), // colpo cupo
  ballSave: (t) => bells(['D6', 'F#6', 'A6'], 0.07, t, 0.7), // scudo
  // Corsa
  countdown: (t) => bell({ frequency: noteToFrequency('A5'), start: t, duration: 0.4 }),
  go: (t) => {
    noise({ start: t, duration: 0.3, from: 600, to: 4000, volume: 0.1 }); // la scopa parte
    bells(['A5', 'E6', 'A6'], 0.05, t, 0.8);
  },
  lap: (t) => bells(['E6', 'B6'], 0.08, t, 0.6),
};

// --- Ricette dei suoni: versione Simpson (cartone animato) -----------------
// Xilofono, fischietti a scorrimento e "boing": i classici effetti dei cartoni.
// Tutti originali: nessuna sigla né voce della serie.

/** Nota di xilofono: breve, tonda, che si spegne subito. */
function xylophone(list, gap, start) {
  notes(list, gap, start, { wave: 'sine' });
}

const SIMPSON = {
  // Memory
  flip: (t) => tone({ frequency: 500, slideTo: 950, start: t, duration: 0.09, wave: 'sine' }), // fischietto
  match: (t) => xylophone(['C6', 'E6', 'G6', 'C7'], 0.06, t),
  mismatch: (t) => notes(['G4', 'F#4', 'F4'], 0.16, t, { wave: 'triangle' }), // "uà-uà-uà"
  turn: (t) => xylophone(['G5', 'C6'], 0.1, t),
  fanfare: (t) => notes(['C5', 'E5', 'G5', 'C6', 'A5', 'C6', 'E6'], 0.12, t, { wave: 'triangle' }),
  toggleOn: (t) => xylophone(['E6', 'G6'], 0.07, t),
  // Flipper
  flipper: (t) => tone({ frequency: 240, slideTo: 140, start: t, duration: 0.04, wave: 'triangle', volume: 0.09 }),
  bumper: (t) => tone({ frequency: 250, slideTo: 760, start: t, duration: 0.14, wave: 'sine', volume: 0.16 }), // boing!
  slingshot: (t) => tone({ frequency: 820, slideTo: 420, start: t, duration: 0.06, wave: 'triangle' }),
  target: (t) => xylophone(['A6', 'E7'], 0.05, t),
  targetBank: (t) => xylophone(['C6', 'D6', 'E6', 'G6', 'A6', 'C7'], 0.05, t),
  lane: (t) => tone({ frequency: noteToFrequency('D6'), start: t, duration: 0.07, wave: 'sine' }),
  multiplier: (t) => notes(['C6', 'E6', 'G6', 'C7', 'G6', 'C7'], 0.07, t, { wave: 'triangle' }),
  outlane: (t) => tone({ frequency: 900, slideTo: 250, start: t, duration: 0.35, wave: 'sine' }), // fischio che scende
  launch: (t) => tone({ frequency: 300, slideTo: 1400, start: t, duration: 0.3, wave: 'sine', volume: 0.12 }), // fischio che sale
  drain: (t) => {
    tone({ frequency: 330, slideTo: 110, start: t, duration: 0.45, wave: 'triangle', volume: 0.16 });
    tone({ frequency: noteToFrequency('C3'), start: t + 0.45, duration: 0.2, wave: 'triangle', volume: 0.14 });
  },
  ballSave: (t) => xylophone(['C6', 'E6', 'G6', 'E7'], 0.07, t),
  // Corsa
  countdown: (t) => tone({ frequency: noteToFrequency('G5'), start: t, duration: 0.14, wave: 'sine', volume: 0.14 }),
  go: (t) => {
    tone({ frequency: 200, slideTo: 520, start: t, duration: 0.35, wave: 'triangle', volume: 0.14 }); // brum!
    xylophone(['C6', 'G6'], 0.08, t);
  },
  lap: (t) => xylophone(['G6', 'C7'], 0.07, t),
};

const RECIPES = { classica: CLASSICA, anime: ANIME, simpson: SIMPSON };

/**
 * Suona un effetto per nome (es. 'bumper'), con la grafica sonora della versione attiva.
 * `delay`: secondi di attesa prima del suono.
 */
export function play(name, { delay = 0 } = {}) {
  if (!soundOn) return;
  const version = currentVersion();
  const start = getContext().currentTime + delay;

  const file = FILE_AUDIO[version]?.[name];
  if (file) {
    playFile(file, start);
    return;
  }
  RECIPES[version][name]?.(start);
}

/** Suona un file audio (caricato una volta sola e poi tenuto in memoria). */
async function playFile(path, start) {
  const ctx = getContext();
  try {
    if (!decodedFiles.has(path)) {
      const response = await fetch(path);
      decodedFiles.set(path, await ctx.decodeAudioData(await response.arrayBuffer()));
    }
    const source = ctx.createBufferSource();
    source.buffer = decodedFiles.get(path);
    const gain = ctx.createGain();
    gain.gain.value = 0.6;
    source.connect(gain).connect(masterGain);
    source.start(Math.max(start, ctx.currentTime));
  } catch {
    // File mancante o non valido: nessun suono, il gioco continua
  }
}

// --- Musica di sottofondo --------------------------------------------------

// Versione classica: melodia allegra in Do maggiore, a crome (null = pausa)
const MUSIC = {
  classica: {
    eighth: 0.2,
    lead: 'square',
    melody: [
      'C5', null, 'E5', 'G5', null, 'E5', 'A5', 'G5',
      'F5', null, 'D5', 'F5', null, 'A5', 'G5', null,
      'E5', null, 'G5', 'C6', null, 'B5', 'A5', 'G5',
      'F5', 'E5', 'D5', null, 'G4', null, null, null,
      'A4', null, 'C5', 'E5', null, 'C5', 'F5', 'E5',
      'D5', null, 'B4', 'D5', null, 'F5', 'E5', null,
      'C5', 'E5', 'G5', 'E5', 'F5', 'D5', 'B4', 'G4',
      'C5', null, null, null, null, null, null, null,
    ],
    bass: [
      'C3', 'G3', 'C3', 'G3', 'F2', 'C3', 'F2', 'C3',
      'C3', 'G3', 'E3', 'G3', 'G2', 'D3', 'G2', 'B2',
      'A2', 'E3', 'A2', 'E3', 'G2', 'D3', 'G2', 'D3',
      'C3', 'G3', 'F2', 'G2', 'C3', 'G2', 'C3', null,
    ],
  },
  // Versione anime: tema epico originale in Re minore
  anime: {
    eighth: 0.22,
    lead: 'triangle',
    melody: [
      'D5', null, 'A4', 'D5', 'E5', 'F5', null, 'E5',
      'D5', null, 'C5', 'A4', null, null, 'A4', null,
      'Bb4', null, 'D5', 'F5', 'G5', 'A5', null, 'G5',
      'F5', 'E5', 'D5', 'E5', null, null, null, null,
      'D5', null, 'A4', 'D5', 'E5', 'F5', null, 'A5',
      'G5', null, 'F5', 'E5', null, 'C5', 'D5', 'E5',
      'F5', null, 'E5', 'D5', 'C#5', null, 'E5', null,
      'D5', null, null, null, null, null, null, null,
    ],
    bass: [
      'D3', 'A3', 'D3', 'A3', 'Bb2', 'F3', 'Bb2', 'F3',
      'C3', 'G3', 'C3', 'G3', 'A2', 'E3', 'A2', 'C#3',
      'D3', 'A3', 'D3', 'A3', 'G2', 'D3', 'G2', 'D3',
      'Bb2', 'F3', 'A2', 'E3', 'D3', 'A2', 'D3', null,
    ],
  },
};

// Versione Simpson: motivetto saltellante originale in Fa maggiore (non è la sigla della serie)
MUSIC.simpson = {
  eighth: 0.17,
  lead: 'triangle',
  melody: [
    'F5', null, 'A5', 'C6', null, 'A5', 'Bb5', 'A5',
    'G5', null, 'E5', 'G5', null, 'C6', 'A5', null,
    'F5', null, 'A5', 'C6', null, 'D6', 'C6', 'Bb5',
    'A5', 'G5', 'F5', null, 'C5', null, null, null,
    'D5', null, 'F5', 'A5', null, 'F5', 'G5', 'A5',
    'Bb5', null, 'G5', 'Bb5', null, 'D6', 'C6', null,
    'A5', 'C6', 'Bb5', 'G5', 'A5', 'F5', 'E5', 'G5',
    'F5', null, null, null, null, null, null, null,
  ],
  bass: [
    'F2', 'C3', 'F2', 'C3', 'Bb2', 'F3', 'Bb2', 'F3',
    'C3', 'G3', 'C3', 'G3', 'F2', 'C3', 'A2', 'C3',
    'D3', 'A3', 'D3', 'A3', 'G2', 'D3', 'C3', 'G3',
    'F2', 'C3', 'Bb2', 'C3', 'F2', 'C3', 'F2', null,
  ],
};

let musicVersion = null;

export function startMusic() {
  if (!soundOn || musicTimer !== null) return;
  const ctx = getContext();
  musicVersion = currentVersion();
  musicGain = ctx.createGain();
  musicGain.gain.value = 1;
  musicGain.connect(masterGain);
  scheduleMusicLoop(ctx.currentTime + 0.1);
}

/** Programma un giro completo della musica e, poco prima che finisca, il giro dopo. */
function scheduleMusicLoop(start) {
  const song = MUSIC[musicVersion];
  const output = musicGain;

  song.melody.forEach((note, i) => {
    if (note) {
      tone({ frequency: noteToFrequency(note), start: start + i * song.eighth, duration: song.eighth * 0.9, wave: song.lead, volume: MUSIC_VOLUME, output });
    }
  });
  song.bass.forEach((note, i) => {
    if (note) {
      tone({ frequency: noteToFrequency(note), start: start + i * song.eighth * 2, duration: song.eighth * 1.8, wave: 'triangle', volume: MUSIC_VOLUME * 1.6, output });
    }
  });

  const loopLength = song.melody.length * song.eighth;
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

// Se si cambia versione mentre suona la musica, si passa alla musica dell'altra versione
window.addEventListener('sala-tema', () => {
  if (musicTimer !== null) {
    stopMusic();
    startMusic();
  }
});
