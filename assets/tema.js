/*
 * VERSIONE DELLA SALA GIOCHI
 *
 * Un solo sito con tre "vesti":
 * - "classica" (predefinita): Memory e flipper a tema Super Mario (platform 8-bit);
 * - "anime": Memory e flipper a tema anime (grimori, sigilli, cremisi e oro);
 * - "simpson": Memory e flipper a tema Simpson (Springfield, giallo e ciambelle).
 * Regole, turni e fisica sono gli stessi: cambia solo la grafica.
 *
 * Questo è uno script "classico" (non un modulo) caricato nel <head>:
 * così la versione viene applicata PRIMA che la pagina venga disegnata,
 * senza il lampeggio della grafica sbagliata.
 *
 * - La versione scelta sta sull'elemento <html> come data-theme="classica", "anime" o "simpson";
 *   i fogli di stile usano [data-theme='anime'] e [data-theme='simpson'] per cambiare grafica.
 * - La scelta viene ricordata dal browser (localStorage).
 * - Ogni pulsante con l'attributo data-theme-toggle apre il menu delle versioni
 *   (creato qui sotto, subito dopo il pulsante): si sceglie una delle tre.
 * - Quando la versione cambia, la pagina riceve l'evento "sala-tema" (per chi
 *   disegna con JavaScript, come il tavolo del flipper o le carte del Memory).
 *
 * MODALITÀ CHIARA / SCURA (indipendente dalla versione)
 * - Sta su <html> come data-mode="light" o "dark"; i CSS usano [data-mode='dark'].
 * - All'inizio segue il sistema (tema chiaro/scuro del computer o del telefono);
 *   dopo un clic sul pulsante [data-mode-toggle] vale la scelta, ricordata dal browser.
 * - Al cambio la pagina riceve l'evento "sala-modo".
 */

(function () {
  var STORAGE_KEY = 'sala-versione';
  var THEMES = ['classica', 'anime', 'simpson'];
  // Nome nel pulsante e nel menu, piccola descrizione e nome completo per gli screen reader
  var THEME_INFO = {
    classica: { name: 'Classica', detail: 'Super Mario · 8-bit', long: 'versione classica' },
    anime: { name: 'Anime', detail: 'Black Clover · grimori', long: 'versione anime' },
    simpson: { name: 'Simpson', detail: 'Springfield · ciambelle', long: 'versione Simpson' },
  };

  var MODE_KEY = 'sala-modo';
  var MODES = ['light', 'dark'];
  // Testo del pulsante: dice a quale modalità si passa
  var MODE_TEXT = { light: 'Scuro', dark: 'Chiaro' };
  var MODE_NAME = { light: 'modalità chiara', dark: 'modalità scura' };
  var systemDark = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;

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

  /** Passa alla versione successiva (classica → anime → simpson → classica). */
  function toggleTheme() {
    setTheme(THEMES[(THEMES.indexOf(getTheme()) + 1) % THEMES.length]);
  }

  /** Aggiorna testo e stato dei pulsanti di cambio versione e dei loro menu. */
  function updateButtons(theme) {
    var info = THEME_INFO[theme];
    var buttons = document.querySelectorAll('[data-theme-toggle]');
    for (var i = 0; i < buttons.length; i++) {
      var isShort = buttons[i].dataset.themeToggle === 'short';
      var label = buttons[i].querySelector('[data-theme-label]');
      if (label) label.textContent = isShort ? info.name : 'Versione: ' + info.name;
      buttons[i].setAttribute('aria-label', 'Cambia versione della sala (ora: ' + info.long + ')');
    }
    // Nel menu la versione attiva è "premuta"
    var options = document.querySelectorAll('[data-theme-choice]');
    for (var j = 0; j < options.length; j++) {
      options[j].setAttribute('aria-pressed', String(options[j].dataset.themeChoice === theme));
    }
  }

  // --- Menu delle versioni ----------------------------------------------

  /** Crea il menu (nascosto) subito dopo ogni pulsante [data-theme-toggle]. */
  function createMenus() {
    var buttons = document.querySelectorAll('[data-theme-toggle]');
    for (var i = 0; i < buttons.length; i++) {
      var menu = document.createElement('div');
      menu.className = 'version-menu';
      menu.id = 'version-menu-' + i;
      menu.hidden = true;
      menu.setAttribute('role', 'group');
      menu.setAttribute('aria-label', 'Scegli la versione della sala');
      var html = '<p class="version-menu-title" aria-hidden="true">Scegli la versione</p>';
      for (var j = 0; j < THEMES.length; j++) {
        var info = THEME_INFO[THEMES[j]];
        html +=
          '<button type="button" class="version-option" data-theme-choice="' + THEMES[j] + '" aria-pressed="false">' +
          '<span class="version-swatch version-swatch--' + THEMES[j] + '" aria-hidden="true"></span>' +
          '<span class="version-option-texts"><span class="version-option-name">' + info.name + '</span>' +
          '<span class="version-option-detail">' + info.detail + '</span></span></button>';
      }
      menu.innerHTML = html;
      buttons[i].setAttribute('aria-expanded', 'false');
      buttons[i].setAttribute('aria-controls', menu.id);
      buttons[i].after(menu);
    }
  }

  function closeMenus(returnFocusTo) {
    var buttons = document.querySelectorAll('[data-theme-toggle]');
    for (var i = 0; i < buttons.length; i++) {
      buttons[i].setAttribute('aria-expanded', 'false');
      var menu = document.getElementById(buttons[i].getAttribute('aria-controls'));
      if (menu) menu.hidden = true;
    }
    if (returnFocusTo) returnFocusTo.focus();
  }

  function toggleMenu(button) {
    var menu = document.getElementById(button.getAttribute('aria-controls'));
    var wasOpen = menu && !menu.hidden;
    closeMenus();
    if (!menu || wasOpen) return;
    menu.hidden = false;
    button.setAttribute('aria-expanded', 'true');
    // Il focus va sulla versione attiva, così da tastiera si sceglie subito
    var current = menu.querySelector('[aria-pressed="true"]') || menu.querySelector('button');
    if (current) current.focus();
  }

  // --- Modalità chiara / scura ------------------------------------------

  function readSavedMode() {
    try {
      var saved = localStorage.getItem(MODE_KEY);
      if (MODES.indexOf(saved) >= 0) return saved;
    } catch (error) {
      // archivio bloccato: seguiamo il sistema
    }
    return systemDark && systemDark.matches ? 'dark' : 'light';
  }

  function hasSavedMode() {
    try {
      return MODES.indexOf(localStorage.getItem(MODE_KEY)) >= 0;
    } catch (error) {
      return false;
    }
  }

  function getMode() {
    return document.documentElement.dataset.mode || 'light';
  }

  function applyMode(mode) {
    document.documentElement.dataset.mode = mode;
    updateModeButtons(mode);
  }

  function setMode(mode, remember) {
    applyMode(mode);
    if (remember !== false) {
      try {
        localStorage.setItem(MODE_KEY, mode);
      } catch (error) {
        // Se non si può salvare, la scelta vale solo per questa visita
      }
    }
    window.dispatchEvent(new CustomEvent('sala-modo', { detail: { mode: mode } }));
  }

  function toggleMode() {
    setMode(getMode() === 'dark' ? 'light' : 'dark');
  }

  function updateModeButtons(mode) {
    var buttons = document.querySelectorAll('[data-mode-toggle]');
    for (var i = 0; i < buttons.length; i++) {
      var label = buttons[i].querySelector('[data-mode-label]');
      if (label) label.textContent = MODE_TEXT[mode];
      var next = mode === 'dark' ? 'light' : 'dark';
      buttons[i].setAttribute('aria-label', 'Passa alla ' + MODE_NAME[next] + ' (ora: ' + MODE_NAME[mode] + ')');
      buttons[i].setAttribute('aria-pressed', String(mode === 'dark'));
    }
  }

  // Finché l'utente non sceglie, se il sistema cambia tema la sala lo segue
  if (systemDark && systemDark.addEventListener) {
    systemDark.addEventListener('change', function (event) {
      if (!hasSavedMode()) setMode(event.matches ? 'dark' : 'light', false);
    });
  }

  // Subito, prima del disegno della pagina
  apply(readSaved());
  applyMode(readSavedMode());

  // Quando i pulsanti esistono, li colleghiamo
  document.addEventListener('DOMContentLoaded', function () {
    createMenus();
    updateButtons(getTheme());
    updateModeButtons(getMode());
    document.addEventListener('click', function (event) {
      var toggle = event.target.closest('[data-theme-toggle]');
      var choice = event.target.closest('[data-theme-choice]');
      if (toggle) {
        toggleMenu(toggle);
      } else if (choice) {
        var menu = choice.closest('.version-menu');
        var owner = menu && document.querySelector('[aria-controls="' + menu.id + '"]');
        if (choice.dataset.themeChoice !== getTheme()) setTheme(choice.dataset.themeChoice);
        closeMenus(owner);
      } else if (!event.target.closest('.version-menu')) {
        closeMenus(); // clic fuori dal menu
      }
      if (event.target.closest('[data-mode-toggle]')) toggleMode();
    });
    document.addEventListener('keydown', function (event) {
      if (event.key !== 'Escape') return;
      var open = document.querySelector('[data-theme-toggle][aria-expanded="true"]');
      if (open) closeMenus(open);
    });
  });

  // Se la versione cambia in un'altra scheda della sala, ci adeguiamo anche qui
  window.addEventListener('storage', function (event) {
    if (event.key === STORAGE_KEY && THEMES.indexOf(event.newValue) >= 0) {
      apply(event.newValue);
      window.dispatchEvent(new CustomEvent('sala-tema', { detail: { theme: event.newValue } }));
    }
    if (event.key === MODE_KEY && MODES.indexOf(event.newValue) >= 0) {
      applyMode(event.newValue);
      window.dispatchEvent(new CustomEvent('sala-modo', { detail: { mode: event.newValue } }));
    }
  });

  window.SalaTema = {
    get: getTheme,
    set: setTheme,
    toggle: toggleTheme,
    getMode: getMode,
    setMode: setMode,
    toggleMode: toggleMode,
  };
})();
