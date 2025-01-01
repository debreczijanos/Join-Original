/**
 * Schaltet die Sichtbarkeit des Navigations-Menüs um.
 */
function navToggel() {
  const x = document.getElementById("myLinks");
  if (x.style.display === "flex") {
    x.style.display = "none";
  } else {
    x.style.display = "flex";
  }
}

/**
 * Setzt den Initialbuchstaben des Benutzernamens im Header.
 *
 * Der Benutzername wird aus dem LocalStorage abgerufen.
 * Wenn kein Name vorhanden ist, wird "Guest" verwendet.
 */
function setUserInitial() {
  const userName = localStorage.getItem("userName") || "Guest";
  const userInitial = userName.charAt(0).toUpperCase();

  const userButton = document.getElementById("user-init");
  if (userButton) {
    userButton.textContent = userInitial;
  }
}

/**
 * Aktiviert den Logout-Button, um den Benutzer auszuloggen.
 *
 * Beim Klick auf den Logout-Button werden die Benutzerdaten
 * aus dem LocalStorage entfernt und der Benutzer wird auf die Login-Seite weitergeleitet.
 */
function activateLogoutButton() {
  const logoutButton = document.querySelector(".nav-toggel button:last-child");
  if (logoutButton) {
    logoutButton.addEventListener("click", function () {
      localStorage.removeItem("userName");
      window.location.href = "../index.html";
    });
  }
}

/**
 * Initialisiert den Header durch Setzen des Benutzernamens,
 * Aktivieren des Logout-Buttons und Aktivieren der Overlay-Schließfunktion.
 */
function initializeHeader() {
  setUserInitial();
  activateLogoutButton();
  setupOverlayClose();
}

/**
 * Schließt das Overlay, wenn außerhalb des Overlays geklickt wird.
 */
function setupOverlayClose() {
  const overlay = document.getElementById("myLinks");

  document.addEventListener("click", (event) => {
    if (
      overlay.style.display === "flex" &&
      !overlay.contains(event.target) &&
      event.target.id !== "user-init"
    ) {
      overlay.style.display = "none";
    }
  });
}

/**
 * Navigiert zur Kanban-Board-Seite.
 */
function navigateToBoard() {
  window.location.href = "../html/boardTest.html";
}

/**
 * Navigiert zur Zusammenfassungsseite.
 */
function navigateToSummary() {
  window.location.href = "../html/summary.html";
}

/**
 * Navigiert zur Seite zum Hinzufügen von Aufgaben.
 */
function navigateToAddTask() {
  window.location.href = "../html/addTask.html";
}

/**
 * Navigiert zur Kontaktseite.
 */
function navigateToContacts() {
  window.location.href = "../html/contacts.html";
}

/**
 * Navigiert zur Seite mit rechtlichen Hinweisen.
 */
function navigateToLegalNotice() {
  window.location.href = "../html/legalNotice.html";
}

/**
 * Navigiert zur Datenschutzrichtlinien-Seite.
 */
function navigateToprivacyPolicy() {
  window.location.href = "../html/privacyPolicy.html";
}
