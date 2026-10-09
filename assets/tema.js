/*
 * VERSIONE DELLA SALA GIOCHI
 *
 * Un solo sito con due "vesti":
 * - "classica" (predefinita): Memory e flipper a tema Super Mario (platform 8-bit);
 * - "anime": Memory e flipper a tema anime (grimori, sigilli, cremisi e oro).
 * Regole, turni e fisica sono gli stessi: cambia solo la grafica.
 *
 * Questo è uno script "classico" (non un modulo) caricato nel <head>:
 * così la versione viene applicata PRIMA che la pagina venga disegnata,
 * senza il lampeggio della grafica sbagliata.
 *
 * - La versione scelta sta sull'elemento <html> come data-theme="classica" o "anime";
 *   i fogli di stile usano [data-theme='anime'] per cambiare grafica.
 * - La scelta viene ricordata dal browser (localStorage).
 * - Ogni pulsante con l'attributo data-theme-toggle cambia versione al clic.
 * - Quando la versione cambia, la pagina riceve l'evento "sala-tema" (per chi
 *   disegna con JavaScript, come il tavolo del flipper o le carte del Memory).
 */

(function () {
  var STORAGE_KEY = 'sala-versione';
  var THEMES = ['classica', 'anime'];
  // Testo del pulsante: dice dove si va, non dove si è
  var BUTTON_TEXT = {
    classica: 'Prova la versione anime',
    anime: 'Torna alla versione classica',
  };
  // Testo corto per i pulsanti nella barra in alto dei giochi (data-theme-toggle="short")
  var SHORT_TEXT = { classica: 'Anime', anime: 'Classica' };
  var LONG_NAME = { classica: 'versione classica', anime: 'versione anime' };

  function readSaved() {
    try {
      var saved = localStorage.getItem(STORAGE_KEY);
      return THEMES.indexOf(saved) >= 0 ? saved : 'classica';
    } catch (error) {
      return 'classica'; // navigazione privata o archivio bloccato
    }
  }

  function getTheme() {
    return document.documentElement.dataset.theme || 'classica';
  }

  function apply(theme) {
    document.documentElement.dataset.theme = theme;
    updateButtons(theme);
  }

  function setTheme(theme) {
    apply(theme);
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch (error) {
      // Se non si può salvare, la scelta vale solo per questa visita
    }
    window.dispatchEvent(new CustomEvent('sala-tema', { detail: { theme: theme } }));
  }

  function toggleTheme() {
    setTheme(getTheme() === 'anime' ? 'classica' : 'anime');
  }

  /** Aggiorna testo e stato di tutti i pulsanti di cambio versione. */
  function updateButtons(theme) {
    var buttons = document.querySelectorAll('[data-theme-toggle]');
    for (var i = 0; i < buttons.length; i++) {
      var isShort = buttons[i].dataset.themeToggle === 'short';
      var label = buttons[i].querySelector('[data-theme-label]');
      if (label) label.textContent = isShort ? SHORT_TEXT[theme] : BUTTON_TEXT[theme];
      // Il pulsante corto ha bisogno di un nome completo per gli screen reader
      if (isShort) buttons[i].setAttribute('aria-label', BUTTON_TEXT[theme] + ' (ora: ' + LONG_NAME[theme] + ')');
      buttons[i].setAttribute('aria-pressed', String(theme === 'anime'));
    }
  }

  // Subito, prima del disegno della pagina
  apply(readSaved());

  // Quando i pulsanti esistono, li colleghiamo
  document.addEventListener('DOMContentLoaded', function () {
    updateButtons(getTheme());
    document.addEventListener('click', function (event) {
      if (event.target.closest('[data-theme-toggle]')) toggleTheme();
    });
  });

  // Se la versione cambia in un'altra scheda della sala, ci adeguiamo anche qui
  window.addEventListener('storage', function (event) {
    if (event.key === STORAGE_KEY && THEMES.indexOf(event.newValue) >= 0) {
      apply(event.newValue);
      window.dispatchEvent(new CustomEvent('sala-tema', { detail: { theme: event.newValue } }));
    }
  });

  window.SalaTema = { get: getTheme, set: setTheme, toggle: toggleTheme };
})();
