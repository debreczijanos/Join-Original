// Rufe die Funktion auf, um "header.html" in das Element mit der ID "include-container" einzufügen
includeHTML("#include-container", "./nav.html");

// Selektiere alle Buttons innerhalb der prio-btn-Klasse
const buttons = document.querySelectorAll(".prio-btn button");

// Funktion: Entfernt aktive Klassen von allen Buttons und Bildern
const clearActiveStates = () => {
  buttons.forEach((btn) => {
    btn.classList.remove("active"); // Entferne die aktive Klasse vom Button
    const img = btn.querySelector("img"); // Finde das Bild im Button
    if (img) {
      img.classList.remove("filter-color-to-white"); // Entferne die Filterklasse
    }
  });
};

// Funktion: Aktiviert den geklickten Button und sein Bild
const activateButton = (button) => {
  button.classList.add("active"); // Füge die aktive Klasse zum Button hinzu
  const img = button.querySelector("img"); // Finde das Bild im Button
  if (img) {
    img.classList.add("filter-color-to-white"); // Füge die Filterklasse hinzu
  }
};

// Event-Listener für alle Buttons
buttons.forEach((button) => {
  button.addEventListener("click", () => {
    clearActiveStates(); // Entferne die aktiven Zustände von allen Buttons
    activateButton(button); // Aktiviere den geklickten Button
  });
});
