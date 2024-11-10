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

// Funktion, um den zweiten Dropdown zu öffnen/schließen
function toggleCustomDropdown() {
  const customMenu = document.getElementById("customDropdownMenu");
  customMenu.style.display =
    customMenu.style.display === "block" ? "none" : "block";
}

// Filterfunktion für den zweiten Dropdown
function filterCustomDropdown() {
  const input = document.getElementById("customDropdownInput");
  const filter = input.value.toLowerCase();
  const items = document.querySelectorAll(
    "#customDropdownMenu .custom-dropdown-item"
  );

  items.forEach((item) => {
    const text = item.textContent || item.innerText;
    item.style.display = text.toLowerCase().includes(filter) ? "block" : "none";
  });
}

// Event-Listener für den zweiten Dropdown
document
  .getElementById("customDropdownInput")
  .addEventListener("focus", toggleCustomDropdown);
document
  .getElementById("customDropdownInput")
  .addEventListener("input", filterCustomDropdown);

// Dropdown schließen, wenn man außerhalb klickt
window.addEventListener("click", (event) => {
  const customInput = document.getElementById("customDropdownInput");
  const customMenu = document.getElementById("customDropdownMenu");

  if (
    !customInput.contains(event.target) &&
    !customMenu.contains(event.target)
  ) {
    customMenu.style.display = "none";
  }
});

// Funktion, um beim Klick auf eine Dropdown-Option den Wert zu setzen
document
  .getElementById("customDropdownMenu")
  .addEventListener("click", (event) => {
    if (event.target.classList.contains("custom-dropdown-item")) {
      const input = document.getElementById("customDropdownInput");
      input.value = event.target.textContent;

      // Dropdown schließen
      document.getElementById("customDropdownMenu").style.display = "none";
    }
  });
