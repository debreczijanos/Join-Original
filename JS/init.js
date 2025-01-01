/**
 * Initialisiert die Anwendung und richtet notwendige Event-Listener und Dropdowns ein.
 *
 * Die Funktion wird ausgeführt, sobald die Seite vollständig geladen ist (`DOMContentLoaded`).
 * Sie konfiguriert Dropdowns, lädt Kontakte, setzt Event-Listener für Eingaben und Buttons
 * und sorgt für eine reibungslose Bedienung der Anwendung.
 */
function initApp() {
  initializeDropdown("dropdownInput", "dropdownMenu", ".dropdown-menu-item");
  initializeDropdown(
    "customDropdownInput",
    "customDropdownMenu",
    ".custom-dropdown-item"
  );

  addInputListeners();
  loadContacts(apiURL, "dropdownMenu");
  setupEventListeners();
  const buttons = document.querySelectorAll(".prio-btn button");
  setupButtonListeners(buttons);
}

/**
 * Starte die Initialisierung der App, sobald die Seite geladen ist
 */
document.addEventListener("DOMContentLoaded", initApp);
