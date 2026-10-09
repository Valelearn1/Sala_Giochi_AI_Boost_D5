/*
 * PANNELLO AUDIO
 *
 * Il pulsante "Audio" nella barra in alto apre un piccolo pannello con:
 * - l'interruttore che accende e spegne suoni e musica;
 * - lo slider del volume (salvato nel browser da assets/suoni.js, vale per tutti i giochi).
 *
 * Uso, in un gioco:
 *   const pannello = createAudioPanel({ button: pulsanteAudio, onToggle: accendiOSpegni });
 *   pannello.render(sound.isSoundOn());   // dopo ogni cambio
 */

import { getVolume, setVolume, play } from './suoni.js';

export function createAudioPanel({ button, onToggle }) {
  const panel = document.createElement('div');
  panel.className = 'audio-panel';
  panel.id = 'audio-panel';
  panel.hidden = true;
  panel.setAttribute('role', 'group');
  panel.setAttribute('aria-label', 'Audio');
  panel.innerHTML = `
    <button type="button" class="audio-switch" role="switch" aria-checked="false">
      <span class="audio-switch-text">Suoni e musica</span>
      <span class="audio-switch-track" aria-hidden="true"><span class="audio-switch-thumb"></span></span>
    </button>
    <label class="audio-volume">
      <span class="audio-volume-label">Volume <output class="audio-volume-value"></output></span>
      <input type="range" class="audio-volume-slider" min="0" max="100" step="5" />
    </label>`;
  button.after(panel);
  button.setAttribute('aria-expanded', 'false');
  button.setAttribute('aria-controls', panel.id);

  const audioSwitch = panel.querySelector('.audio-switch');
  const slider = panel.querySelector('.audio-volume-slider');
  const valueText = panel.querySelector('.audio-volume-value');

  function showVolume() {
    slider.value = Math.round(getVolume() * 100);
    valueText.textContent = `${slider.value}%`;
  }
  showVolume();

  slider.addEventListener('input', () => {
    setVolume(Number(slider.value) / 100);
    valueText.textContent = `${slider.value}%`;
  });
  // Lasciando lo slider si sente un suono di prova, al volume appena scelto
  slider.addEventListener('change', () => play('toggleOn'));
  audioSwitch.addEventListener('click', onToggle);

  function open() {
    showVolume(); // potrebbe essere cambiato in un'altra pagina
    panel.hidden = false;
    button.setAttribute('aria-expanded', 'true');
    audioSwitch.focus();
  }

  function close({ returnFocus = false } = {}) {
    panel.hidden = true;
    button.setAttribute('aria-expanded', 'false');
    if (returnFocus) button.focus();
  }

  button.addEventListener('click', () => (panel.hidden ? open() : close()));

  // Si chiude toccando fuori dal pannello o con Esc
  document.addEventListener('pointerdown', (event) => {
    if (!panel.hidden && !panel.contains(event.target) && !button.contains(event.target)) close();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !panel.hidden) close({ returnFocus: true });
  });

  return {
    /** Mostra se l'audio è acceso: icona del pulsante e interruttore. */
    render(isOn) {
      button.dataset.on = String(isOn);
      audioSwitch.setAttribute('aria-checked', String(isOn));
    },
    close,
  };
}
