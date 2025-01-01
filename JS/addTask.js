/**
 * Lädt eine HTML-Datei und fügt deren Inhalt in ein Element ein.
 *
 * @param {string} selector - Der CSS-Selektor des Ziel-Elements.
 * @param {string} file - Der Pfad zur HTML-Datei.
 * @param {Function} [callback] - Eine optionale Callback-Funktion, die nach dem Laden ausgeführt wird.
 */
function includeHTML(selector, file, callback) {
  const element = document.querySelector(selector);
  if (element) {
    fetch(file)
      .then((response) => {
        if (!response.ok) {
          throw new Error("HTTP error " + response.status);
        }
        return response.text();
      })
      .then((data) => {
        element.innerHTML = data;
        if (typeof callback === "function") {
          callback(); // Führe die Callback-Funktion aus
        }
      })
      .catch((error) => console.error("Error loading HTML:", error));
  }
}
includeHTML("#include-container", "./nav.html", function () {
  initializeHeader();
});

/**
 * Entfernt den aktiven Zustand von allen Buttons.
 *
 * @param {NodeList} buttons - Eine Liste der zu bearbeitenden Buttons.
 */
function clearActiveStates(buttons) {
  buttons.forEach((btn) => {
    btn.classList.remove("active");
    const img = btn.querySelector("img");
    if (img) img.classList.remove("filter-color-to-white");
  });
}

/**
 * Aktiviert einen Button und setzt die zugehörige Bildfarbe.
 *
 * @param {HTMLElement} button - Der Button, der aktiviert werden soll.
 */
function activateButton(button) {
  button.classList.add("active");
  const img = button.querySelector("img");
  if (img) img.classList.add("filter-color-to-white");
}

/**
 * Fügt Event-Listener zu Buttons hinzu und aktiviert standardmäßig einen Button.
 *
 * @param {NodeList} buttons - Eine Liste der Buttons.
 * @param {number} defaultActiveIndex - Der Index des standardmäßig aktiven Buttons (optional, Standard: 1).
 */
function setupButtonListeners(buttons, defaultActiveIndex = 1) {
  buttons.forEach((button, index) => {
    button.addEventListener("click", () => {
      clearActiveStates(buttons);
      activateButton(button);
    });

    if (index === defaultActiveIndex) {
      activateButton(button);
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const prioButtons = document.querySelectorAll(".prio-button");
  setupButtonListeners(prioButtons, 1);
});

/**
 * Fügt Event-Listener zu Eingabefeldern hinzu, um Fehler zu entfernen.
 */
function addInputListeners() {
  const fieldsToValidate = getRequiredFields();

  fieldsToValidate.forEach(({ input, errorClass }) => {
    addErrorRemovalListeners(input, errorClass);
  });

  handleCategoryDropdown();
}

/**
 * Fügt Event-Listener hinzu, um Fehler bei einem Eingabefeld zu entfernen.
 *
 * @param {HTMLElement} input - Das Eingabefeld.
 * @param {string} errorClass - Die CSS-Klasse des zu entfernenden Fehlers.
 */
function addErrorRemovalListeners(input, errorClass) {
  input.addEventListener("input", () => removeError(input, errorClass));
  if (input.type === "date") {
    input.addEventListener("change", () => removeError(input, errorClass));
  }
}

/**
 * Verarbeitet Events im Dropdown-Menü der Kategorie und entfernt Fehler.
 */
function handleCategoryDropdown() {
  const categoryInput = document.getElementById("customDropdownInput");
  const dropdownMenu = document.getElementById("customDropdownMenu");

  ["input", "focus"].forEach((event) =>
    categoryInput.addEventListener(event, () =>
      removeError(categoryInput, "error-category")
    )
  );

  dropdownMenu.addEventListener("click", (event) => {
    if (event.target.classList.contains("custom-dropdown-item")) {
      removeError(categoryInput, "error-category");
    }
  });
}

/**
 * Entfernt die Fehlerklasse von einem Eingabefeld und löscht zugehörigen Fehlertext.
 *
 * @param {HTMLElement} input - Das Eingabefeld.
 * @param {string} errorClass - Die CSS-Klasse des Fehlertextes.
 */
function removeError(input, errorClass) {
  if (input.value.trim()) {
    input.classList.remove("error");
    const errorText = document.querySelector(`.${errorClass}`);
    if (errorText) errorText.remove();
  }
}
