/**
 * Öffnet oder schließt das Dropdown-Menü.
 */
function toggleDropdown() {
  const dropdownMenu = document.getElementById("dropdownMenu");

  if (dropdownMenu.classList.contains("d-none")) {
    dropdownMenu.classList.remove("d-none");
    dropdownMenu.style.display = "block"; // Sichtbar machen
  } else {
    dropdownMenu.classList.add("d-none");
    dropdownMenu.style.display = "none"; // Verbergen
  }
}

/**
 * Erstellt eine Checkbox.
 *
 * @param {string} name - Name des Kontakts.
 * @returns {HTMLInputElement} Die erstellte Checkbox.
 */
function createCheckbox(name) {
  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.value = name;
  return checkbox;
}

/**
 * Generiert eine Farbe basierend auf dem ersten Buchstaben eines Namens.
 *
 * @param {string} letter - Der erste Buchstabe des Namens.
 * @returns {string} Die generierte Farbe.
 */
function generateColorFromLetter(letter) {
  const charCode = letter.toUpperCase().charCodeAt(0);
  const hue = (charCode - 65) * 15;
  return `hsl(${hue}, 70%, 50%)`; // HSL-Farbmodell für dynamische Farben
}

/**
 * Aktualisiert den Stil eines Dropdown-Labels basierend auf dem Zustand.
 *
 * @param {HTMLElement} contactElement - Das Element des Kontakts.
 * @param {boolean} isChecked - Ob der Kontakt ausgewählt ist.
 */
function updateDropdownStyle(contactElement, isChecked) {
  if (isChecked) {
    contactElement.style.backgroundColor = "#2A3647"; // Dunkler Hintergrund für Auswahl
    contactElement.style.color = "#ffffff"; // Weiße Schrift

    // Entferne Hover-Effekt, falls vorhanden
    contactElement.onmouseover = null;
    contactElement.onmouseout = null;
  } else {
    contactElement.style.backgroundColor = "#f9f9f9"; // Standard-Hintergrund
    contactElement.style.color = "#000000"; // Schwarze Schrift

    // Entferne vorherige Event-Listener, um doppelte Listener zu vermeiden
    contactElement.onmouseover = () => {
      contactElement.style.backgroundColor = "#a8a3a666"; // Hover-Hintergrund
      contactElement.style.color = "#000000"; // Hover-Schriftfarbe
    };

    contactElement.onmouseout = () => {
      contactElement.style.backgroundColor = "#f9f9f9"; // Zurück zum Standard
      contactElement.style.color = "#000000"; // Zurück zur Standard-Schriftfarbe
    };
  }
}

/**
 * Aktualisiert die Zuweisungen im Backend.
 * @param {string[]} updatedAssignments - Die aktualisierte Liste der zugewiesenen Kontakte.
 */
async function updateTaskAssignments(updatedAssignments) {
  try {
    const response = await fetch(
      `https://join-388-default-rtdb.europe-west1.firebasedatabase.app/tasks/${currentTaskId}/assignedTo.json`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedAssignments),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to update task assignments");
    }

    console.log("Task assignments updated successfully!");
  } catch (error) {
    console.error("Error updating task assignments:", error);
  }
}

/**
 * Erstellt einen Button mit dem Initial des Kontakts.
 *
 * @param {string} name - Name des Kontakts.
 * @returns {HTMLButtonElement} Der erstellte Button.
 */
function createContactButton(name) {
  const button = document.createElement("button");
  button.textContent = name.charAt(0).toUpperCase();
  button.style.marginRight = "10px";
  button.style.width = "30px";
  button.style.height = "30px";
  button.style.borderRadius = "50%";
  button.style.backgroundColor = generateColorFromLetter(name.charAt(0));
  button.style.color = "#ffffff";
  button.style.border = "none";
  return button;
}
