/*
 * INPUT
 *
 * Trasforma tastiera e tocchi in azioni del flipper:
 * - aletta sinistra / destra (tenute premute);
 * - carica del lanciatore (tenuta premuta) e lancio al rilascio;
 * - pausa.
 *
 * Tastiera: Z o ← = aletta sinistra, M o → = aletta destra,
 *           Spazio tenuto = carica, P = pausa.
 * Touch: metà sinistra / destra del tavolo = alette, pulsante "Lancia", pulsante pausa.
 * Versione anime: anche i pulsanti "Flipper SX / DX" sotto il tavolo ([data-flipper]).
 */

const LEFT_KEYS = ['KeyZ', 'ArrowLeft'];
const RIGHT_KEYS = ['KeyM', 'ArrowRight'];

/**
 * @param {object} options
 * @param {HTMLElement} options.touchArea - zona dove i tocchi azionano le alette
 * @param {HTMLElement} options.launchButton
 * @param {HTMLElement} [options.pauseButton]
 * @param {Iterable<HTMLElement>} [options.flipperButtons] - pulsanti con data-flipper="left|right"
 * @param {() => void} options.onLaunchStart - inizio della carica
 * @param {() => void} options.onLaunchRelease - rilascio: lancio
 * @param {() => void} options.onPause
 */
export function createInput({ touchArea, launchButton, pauseButton, flipperButtons = [], onLaunchStart, onLaunchRelease, onPause }) {
  // Lo stato che legge la fisica a ogni passo
  const controls = { left: false, right: false };
  let enabled = false;
  let charging = false;

  // Per il touch: ogni dito sa quale aletta sta tenendo premuta
  const activePointers = new Map();

  function startCharge() {
    if (!enabled || charging) return;
    charging = true;
    onLaunchStart();
  }

  function releaseCharge() {
    if (!charging) return;
    charging = false;
    onLaunchRelease();
  }

  // --- Tastiera ----------------------------------------------------------

  window.addEventListener('keydown', (event) => {
    if (isTyping(event)) return;

    if (event.code === 'KeyP') {
      onPause();
      return;
    }
    if (!enabled) return;

    if (LEFT_KEYS.includes(event.code)) controls.left = true;
    else if (RIGHT_KEYS.includes(event.code)) controls.right = true;
    else if (event.code === 'Space') {
      if (!event.repeat) startCharge();
    } else return;

    event.preventDefault(); // niente scroll della pagina con Spazio o frecce
  });

  window.addEventListener('keyup', (event) => {
    if (LEFT_KEYS.includes(event.code)) controls.left = false;
    else if (RIGHT_KEYS.includes(event.code)) controls.right = false;
    else if (event.code === 'Space') releaseCharge();
  });

  // Se la finestra perde il focus, rilasciamo tutto (altrimenti un'aletta resterebbe alzata)
  window.addEventListener('blur', releaseAll);

  // --- Touch e mouse sul tavolo -----------------------------------------

  touchArea.addEventListener('pointerdown', (event) => {
    if (!enabled) return;
    const box = touchArea.getBoundingClientRect();
    const side = event.clientX < box.left + box.width / 2 ? 'left' : 'right';
    activePointers.set(event.pointerId, side);
    controls[side] = true;
    capturePointer(touchArea, event.pointerId);
  });

  const releasePointer = (event) => {
    const side = activePointers.get(event.pointerId);
    if (!side) return;
    activePointers.delete(event.pointerId);
    // L'aletta si abbassa solo se nessun altro dito la sta tenendo
    controls[side] = [...activePointers.values()].includes(side);
  };
  touchArea.addEventListener('pointerup', releasePointer);
  touchArea.addEventListener('pointercancel', releasePointer);

  // Pulsanti "Flipper SX / DX": come un dito sulla metà del tavolo
  for (const button of flipperButtons) {
    const side = button.dataset.flipper;
    button.addEventListener('pointerdown', (event) => {
      if (!enabled) return;
      event.preventDefault(); // niente zoom o selezione con tocchi veloci
      activePointers.set(event.pointerId, side);
      controls[side] = true;
      capturePointer(button, event.pointerId);
    });
    button.addEventListener('pointerup', releasePointer);
    button.addEventListener('pointercancel', releasePointer);
  }

  // --- Pulsanti ------------------------------------------------------------

  launchButton.addEventListener('pointerdown', (event) => {
    event.preventDefault();
    event.stopPropagation(); // il pulsante sta sopra il tavolo: non deve azionare un'aletta
    capturePointer(launchButton, event.pointerId);
    startCharge();
  });
  launchButton.addEventListener('pointerup', releaseCharge);
  launchButton.addEventListener('pointercancel', releaseCharge);
  // Da tastiera il pulsante funziona con Invio (lancio a metà carica)
  launchButton.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && !event.repeat) {
      startCharge();
    }
  });
  launchButton.addEventListener('keyup', (event) => {
    if (event.key === 'Enter') releaseCharge();
  });

  pauseButton?.addEventListener('click', onPause);

  function releaseAll() {
    controls.left = false;
    controls.right = false;
    activePointers.clear();
    releaseCharge();
  }

  return {
    controls,
    isCharging: () => charging,
    /** Abilita o disabilita i comandi di gioco (es. durante le schermate tra un turno e l'altro). */
    setEnabled(value) {
      enabled = value;
      if (!value) releaseAll();
    },
  };
}

/**
 * "Cattura" il dito: anche se scivola fuori dall'elemento, il rilascio arriva qui.
 * Se il dito è già stato alzato il browser lancia un errore: in quel caso non serve catturarlo.
 */
function capturePointer(element, pointerId) {
  try {
    element.setPointerCapture(pointerId);
  } catch {
    // Puntatore già rilasciato: niente da fare
  }
}

/** Vero se l'utente sta scrivendo in un campo di testo: in quel caso ignoriamo i tasti. */
function isTyping(event) {
  return event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement;
}
