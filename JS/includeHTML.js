/**
 * Lädt eine externe HTML-Datei in ein bestimmtes Element und führt optional eine Callback-Funktion aus.
 *
 * @param {string} selector - Der CSS-Selektor des Elements, in das der HTML-Inhalt eingefügt werden soll.
 * @param {string} file - Der Pfad zur HTML-Datei, die geladen werden soll.
 * @param {Function} [callback] - Eine optionale Callback-Funktion, die nach dem Laden des Inhalts ausgeführt wird.
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
          setTimeout(callback, 0);
        }
      })
      .catch((error) => console.error("Error loading HTML:", error));
  }
}

document.addEventListener("DOMContentLoaded", function () {
  includeHTML("#include-container", "./nav.html", function () {
    if (typeof initializeHeader === "function") {
      initializeHeader();
    } else {
      console.error("initializeHeader is not defined");
    }
  });
});
