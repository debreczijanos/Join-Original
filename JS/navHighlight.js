/**
 * Initialisiert die Navigation und setzt das aktive Menüelement basierend auf der URL.
 */
document.addEventListener("DOMContentLoaded", function () {
  setTimeout(() => {
    const menuItems = document.querySelectorAll(
      ".summary, .addTask, .board, .contacts"
    );

    if (menuItems.length === 0) return;

    const activeMenuClass = getActiveMenuClass();
    updateActiveMenu(menuItems, activeMenuClass);
    addClickListeners(menuItems);
  }, 200);
});

/**
 * Ermittelt die aktive Menüklasse basierend auf der aktuellen URL.
 * @returns {string|null} - Die Klasse des aktiven Menüpunkts oder null, falls kein Treffer.
 */
function getActiveMenuClass() {
  const currentPath = window.location.pathname;
  const pathToMenuClass = {
    "/summary.html": "summary",
    "/addTask.html": "addTask",
    "/boardTest.html": "board",
    "/contacts.html": "contacts",
  };

  for (const path in pathToMenuClass) {
    if (currentPath.includes(path)) return pathToMenuClass[path];
  }
  return null;
}

/**
 * Setzt die "active"-Klasse für das gefundene Menüelement.
 * @param {NodeList} menuItems - Liste der Menüelemente.
 * @param {string|null} activeMenuClass - Die Klasse des aktiven Menüpunkts.
 */
function updateActiveMenu(menuItems, activeMenuClass) {
  menuItems.forEach((el) => el.classList.remove("active"));

  if (activeMenuClass) {
    const activeElement = document.querySelector(`.${activeMenuClass}`);
    if (activeElement) activeElement.classList.add("active");
  }
}

/**
 * Fügt allen Menüelementen ein Click-Event hinzu, um sie aktiv zu setzen.
 * @param {NodeList} menuItems - Liste der Menüelemente.
 */
function addClickListeners(menuItems) {
  menuItems.forEach((item) => {
    item.addEventListener("click", function () {
      menuItems.forEach((el) => el.classList.remove("active"));
      this.classList.add("active");
    });
  });
}
