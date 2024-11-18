//Konstante für die API-URL
const apiURL =
  "https://join-388-default-rtdb.europe-west1.firebasedatabase.app/users.json";

//Dropdown-Management
// Dropdown umschalten
function toggleDropdown(dropdownId) {
  const dropdownMenu = document.getElementById(dropdownId);

  if (!dropdownMenu) return;

  dropdownMenu.classList.toggle("open");
}

// Schließen des Dropdowns bei Klick außerhalb
function closeDropdownOnOutsideClick(inputId, menuId) {
  document.addEventListener("click", (event) => {
    const input = document.getElementById(inputId);
    const dropdownMenu = document.getElementById(menuId);

    if (
      input &&
      dropdownMenu &&
      event.target !== input && // Klick ist nicht auf das Input-Feld
      !dropdownMenu.contains(event.target) // Klick ist nicht innerhalb des Dropdown-Menüs
    ) {
      dropdownMenu.classList.remove("open");
    }
  });
}

// Gemeinsame Initialisierungsfunktion für Dropdowns
function initializeDropdown(inputId, menuId) {
  const input = document.getElementById(inputId);
  const menu = document.getElementById(menuId);

  if (!input || !menu) return;

  // Verhindere doppelte Listener
  if (input.dataset.listenerAdded) return;
  input.dataset.listenerAdded = true;

  input.addEventListener("click", (event) => {
    event.stopPropagation();
    toggleDropdown(menuId);
  });

  closeDropdownOnOutsideClick(inputId, menuId);
  setDropdownValueOnClick(menuId, inputId);
}

// Dropdown filtern
function filterDropdown(inputId, menuSelector) {
  const input = document.getElementById(inputId);
  if (!input) return;

  const filter = input.value.toLowerCase();
  const items = document.querySelectorAll(menuSelector);

  items.forEach((item) => {
    const text = item.textContent || item.innerText;
    item.style.display = text.toLowerCase().includes(filter) ? "block" : "none";
  });
}

// Dropdown-Wert setzen
function setDropdownValueOnClick(menuId, inputId) {
  const menu = document.getElementById(menuId);
  if (!menu) return;

  menu.addEventListener("click", (event) => {
    if (event.target.classList.contains("custom-dropdown-item")) {
      const input = document.getElementById(inputId);
      if (input) {
        input.value = event.target.textContent.trim(); // Setzt den Text als Wert
        menu.style.display = "none"; // Schließt das Dropdown
      }
    }
  });
}

// Initialisierung der Dropdowns
document.addEventListener("DOMContentLoaded", () => {
  initializeDropdown("dropdownInput", "dropdownMenu");
  initializeDropdown("customDropdownInput", "customDropdownMenu");

  const assignedInputId = "dropdownInput";
  const assignedMenuId = "dropdownMenu";

  const assignedInput = document.getElementById(assignedInputId);
  if (assignedInput) {
    assignedInput.addEventListener("click", (event) => {
      event.stopPropagation();
      toggleDropdown(assignedMenuId, event);
    });
    assignedInput.addEventListener("keyup", () => {
      filterDropdown(assignedInputId, `#${assignedMenuId} label`);
    });
    closeDropdownOnOutsideClick(assignedInputId, assignedMenuId);
  }

  const categoryInputId = "customDropdownInput";
  const categoryMenuId = "customDropdownMenu";

  const categoryInput = document.getElementById(categoryInputId);
  if (categoryInput) {
    categoryInput.addEventListener("click", (event) => {
      event.stopPropagation();
      toggleDropdown(categoryMenuId, event);
    });
    categoryInput.addEventListener("input", () => {
      filterDropdown(
        categoryInputId,
        `#${categoryMenuId} .custom-dropdown-item`
      );
    });
    closeDropdownOnOutsideClick(categoryInputId, categoryMenuId);
  }

  setDropdownValueOnClick(categoryMenuId, categoryInputId);
});

//Filter-Management
//Kontakte laden
async function loadContacts(apiURL, dropdownId) {
  try {
    const response = await fetch(apiURL);
    const data = await response.json();

    const dropdownMenu = document.getElementById(dropdownId);
    if (dropdownMenu) {
      dropdownMenu.innerHTML = "";

      Object.values(data).forEach((contact) => {
        const contactElement = createContactElement(contact);
        dropdownMenu.appendChild(contactElement);
      });
    }
  } catch (error) {
    console.error("Fehler beim Laden der Kontakte:", error);
  }
}

//Kontakt-Element erstellen
function createContactElement(contact) {
  const label = document.createElement("label");
  const checkbox = createCheckbox(contact.name);
  const button = createContactButton(contact.name);

  // Event-Listener für Checkbox
  checkbox.onchange = () => {
    updateSelectedContacts(contact.name, button, checkbox.checked);
  };

  // Elemente in das Label einfügen
  label.appendChild(button);
  label.appendChild(document.createTextNode(contact.name));
  label.appendChild(checkbox);

  return label;
}

function createCheckbox(name) {
  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.value = name;
  return checkbox;
}

function createContactButton(name) {
  const button = document.createElement("button");
  button.textContent = name.charAt(0).toUpperCase();
  button.style.marginRight = "10px";
  button.style.backgroundColor = generateColorFromLetter(name.charAt(0));
  return button;
}

//Auswahl-Management
//Ausgewählte Kontakte aktualisieren
function updateSelectedContacts(contactName, button, isChecked) {
  const selectedContactsContainer = document.getElementById("selectedContacts");

  if (isChecked) {
    addSelectedContact(button, contactName, selectedContactsContainer);
  } else {
    removeSelectedContact(contactName, selectedContactsContainer);
  }
}

// Kontakt hinzufügen
function addSelectedContact(button, contactName, container) {
  const clonedButton = button.cloneNode(true);

  // Event-Listener zum Entfernen
  clonedButton.onclick = () => {
    deselectContact(contactName);
    clonedButton.remove();
  };

  container.appendChild(clonedButton);
}

//Kontakt entfernen
function removeSelectedContact(contactName, container) {
  const buttons = container.querySelectorAll("button");
  buttons.forEach((btn) => {
    if (btn.textContent === contactName.charAt(0).toUpperCase()) {
      btn.remove();
    }
  });
}

function deselectContact(contactName) {
  const checkboxes = document.querySelectorAll(".dropdown-menu input");
  checkboxes.forEach((checkbox) => {
    if (checkbox.value === contactName) {
      checkbox.checked = false;
    }
  });
}

//Farbgenerierung
function generateColorFromLetter(letter) {
  const charCode = letter.toUpperCase().charCodeAt(0);
  const hue = (charCode - 65) * 15;
  return `hsl(${hue}, 70%, 50%)`;
}
