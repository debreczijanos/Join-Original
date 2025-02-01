/**
 * Speichert die aktuelle Seite in `sessionStorage`, bevor die Seite verlassen wird.
 */
function saveLastPage() {
  const currentPage = window.location.href;
  const lastPage = sessionStorage.getItem("currentPage");

  if (lastPage && lastPage !== currentPage) {
    sessionStorage.setItem("lastPage", lastPage);
  }

  sessionStorage.setItem("currentPage", currentPage);
}

/**
 * Leitet den Benutzer zur zuletzt besuchten Seite weiter.
 */
function goToLastPage() {
  const lastPage = sessionStorage.getItem("lastPage");
  if (lastPage) {
    window.location.href = lastPage;
  } else {
    window.history.back(); // Falls keine gespeicherte Seite vorhanden ist
  }
}

// Speichert die aktuelle Seite beim **Verlassen** der Seite, damit schnelle Wechsel erfasst werden
window.addEventListener("beforeunload", saveLastPage);

// Falls das nicht reicht, speichern wir zusätzlich beim Laden der Seite
document.addEventListener("DOMContentLoaded", saveLastPage);
