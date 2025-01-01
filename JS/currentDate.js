/**
 * Zeigt das aktuelle Datum in einem spezifischen Format an.
 *
 * Diese Funktion wird ausgeführt, wenn die Seite vollständig geladen ist.
 * Sie setzt das aktuelle Datum im Format "TT. Monat JJJJ" in ein Element mit der ID `current-date`.
 */
document.addEventListener("DOMContentLoaded", function () {
  const dateElement = document.getElementById("current-date");
  const today = new Date();
  const options = { year: "numeric", month: "long", day: "numeric" };
  dateElement.textContent = today.toLocaleDateString("de-DE", options); // Beispiel: November 7, 2024
});

/**
 * Zeigt den Benutzernamen aus dem `localStorage` in der Begrüßung an.
 *
 * Diese Funktion wird ausgeführt, wenn die Seite vollständig geladen ist.
 * Sie liest den Benutzernamen aus dem `localStorage` (oder verwendet "Guest" als Standard)
 * und aktualisiert das Begrüßungselement mit der Klasse `.greating h1`.
 */
document.addEventListener("DOMContentLoaded", function () {
  const userName = localStorage.getItem("userName") || "Guest";

  const greetingElement = document.querySelector(".greating h1");
  greetingElement.textContent = userName;
});
