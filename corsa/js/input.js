/*
 * COMANDI
 *
 * Tastiera: ↑ o W = gas, ↓ o S = freno/retromarcia, ← → o A D = sterzo, P = pausa.
 * Touch (e mouse): i pulsanti con data-control="left|right|gas|brake", da tenere premuti.
 * Più dita insieme vanno bene (es. gas e sterzo).
 */

const KEYS = {
  ArrowUp: 'gas', KeyW: 'gas',
  ArrowDown: 'brake', KeyS: 'brake',
  ArrowLeft: 'left', KeyA: 'left',
  ArrowRight: 'right', KeyD: 'right',
};

export function createInput({ buttons, onPause }) {
  const controls = { gas: false, brake: false, left: false, right: false };
  const pressedKeys = new Set();
  const pointers = new Map(); // dito → comando
  let enabled = false;

  /** Un comando è attivo se lo tiene premuto un tasto o almeno un dito. */
  function refresh() {
    for (const name of Object.keys(controls)) {
      controls[name] = enabled && ([...pressedKeys].some((key) => KEYS[key] === name) || [...pointers.values()].includes(name));
    }
    for (const button of buttons) button.classList.toggle('is-pressed', controls[button.dataset.control]);
  }

  window.addEventListener('keydown', (event) => {
    if (event.target instanceof HTMLInputElement) return; // si sta scrivendo un nome
    if (event.code === 'KeyP') {
      onPause();
      return;
    }
    if (!KEYS[event.code]) return;
    event.preventDefault(); // niente scorrimento della pagina con le frecce
    pressedKeys.add(event.code);
    refresh();
  });

  window.addEventListener('keyup', (event) => {
    pressedKeys.delete(event.code);
    refresh();
  });

  for (const button of buttons) {
    button.addEventListener('pointerdown', (event) => {
      event.preventDefault();
      pointers.set(event.pointerId, button.dataset.control);
      try {
        button.setPointerCapture(event.pointerId);
      } catch {
        // dito già alzato: niente da catturare
      }
      refresh();
    });
    const release = (event) => {
      pointers.delete(event.pointerId);
      refresh();
    };
    button.addEventListener('pointerup', release);
    button.addEventListener('pointercancel', release);
  }

  // Finestra che perde il focus: si lascia tutto, altrimenti l'auto resterebbe col gas premuto
  window.addEventListener('blur', () => {
    pressedKeys.clear();
    pointers.clear();
    refresh();
  });

  return {
    controls,
    setEnabled(value) {
      enabled = value;
      refresh();
    },
  };
}
