//Konstante für die API-URL
const apiURL =
  "https://join-388-default-rtdb.europe-west1.firebasedatabase.app/users.json";

const API_CONTACTS =
  "https://join-388-default-rtdb.europe-west1.firebasedatabase.app/contact.json";

let selectedContacts = []; // Speichert die vollständigen Namen

// Dropdown umschalten
function toggleDropdown(dropdownId) {
  const dropdownMenu = document.getElementById(dropdownId);

  if (!dropdownMenu) return;

  // Schließt Dropdowns, wenn sie offen sind
  const allDropdowns = document.querySelectorAll(".dropdown-menu");
  allDropdowns.forEach((menu) => {
    if (menu !== dropdownMenu) {
      menu.classList.remove("open");
    }
  });

  // Öffnet oder schließt das aktuelle Dropdown
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
        menu.classList.remove("open"); // Schließt das Dropdown
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

//Kontakte laden
// Kontakte laden
// Kontakte laden und ins Dropdown einfügen
async function loadContacts(apiURL, dropdownId) {
  try {
    const dropdownMenu = getDropdownMenu(dropdownId);
    const uniqueContacts = new Set();

    const allContacts = await fetchAllContacts(apiURL);
    addContactsToDropdown(allContacts, uniqueContacts, dropdownMenu);
  } catch (error) {
    console.error("Fehler beim Laden der Kontakte:", error);
  }
}

// Dropdown-Element abrufen
function getDropdownMenu(dropdownId) {
  const dropdownMenu = document.getElementById(dropdownId);
  if (!dropdownMenu) {
    throw new Error("Dropdown-Menü nicht gefunden!");
  }
  dropdownMenu.innerHTML = ""; // Vorherigen Inhalt löschen
  return dropdownMenu;
}

// Alle Kontakte aus beiden APIs abrufen
async function fetchAllContacts(apiURL) {
  const contactsFromMainAPI = await fetchContactsFromAPI(apiURL);
  const contactsFromSecondaryAPI = await fetchContactsFromAPI(API_CONTACTS);
  return [...contactsFromMainAPI, ...contactsFromSecondaryAPI];
}

// Kontakte aus einer API abrufen
async function fetchContactsFromAPI(url) {
  const response = await fetch(url);
  if (!response.ok) {
    console.error(`Fehler beim Abrufen der Daten von ${url}`);
    return [];
  }
  const data = await response.json();
  return Object.values(data);
}

// Kontakte ins Dropdown einfügen
function addContactsToDropdown(contacts, uniqueContacts, dropdownMenu) {
  contacts.forEach((contact) => {
    if (!uniqueContacts.has(contact.name)) {
      uniqueContacts.add(contact.name);
      const contactElement = createContactElement(contact);
      dropdownMenu.appendChild(contactElement);
    }
  });
}

//Kontakt-Element erstellen
function createContactElement(contact) {
  const label = document.createElement("label");
  const checkbox = createCheckbox(contact.name);
  const button = createContactButton(contact.name);

  const checkboxId = `checkbox-${contact.name}`;
  checkbox.id = checkboxId;
  label.htmlFor = checkboxId;

  checkbox.onchange = () => {
    updateSelectedContacts(contact.name, button, checkbox.checked);
  };

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

//Ausgewählte Kontakte aktualisieren
function updateSelectedContacts(contactName, button, isChecked) {
  const selectedContactsContainer = document.getElementById("selectedContacts");

  if (isChecked) {
    addSelectedContact(button, contactName, selectedContactsContainer);
  } else {
    removeSelectedContact(contactName, selectedContactsContainer);
  }

  renderSelectedContacts(selectedContactsContainer);
}

// Kontakt hinzufügen
function addSelectedContact(button, contactName, container) {
  // Prüfen, ob der Kontakt schon in der Liste ist
  if (selectedContacts.includes(contactName)) return;

  // Zum Array hinzufügen
  selectedContacts.push(contactName);

  // DOM-Element erstellen
  const clonedButton = button.cloneNode(true);
  clonedButton.dataset.contactName = contactName;

  // Event-Listener zum Entfernen
  clonedButton.onclick = () => {
    deselectContact(contactName);
    renderSelectedContacts(container);
  };

  container.appendChild(clonedButton);
  renderSelectedContacts(container); // UI aktualisieren
}

function removeSelectedContact(contactName, container) {
  // Aus der Liste entfernen
  selectedContacts = selectedContacts.filter((name) => name !== contactName);

  // Aus dem DOM entfernen
  const buttons = container.querySelectorAll("button");
  buttons.forEach((btn) => {
    if (btn.dataset.contactName === contactName) {
      btn.remove();
    }
  });
  renderSelectedContacts(container); // UI aktualisieren
}

function renderSelectedContacts(container) {
  const maxVisible = 3;

  // Alle Buttons entfernen
  container.innerHTML = "";

  // Sichtbare Buttons hinzufügen
  selectedContacts.slice(0, maxVisible).forEach((contactName) => {
    const button = document.createElement("button");
    button.textContent = contactName.charAt(0).toUpperCase();
    button.dataset.contactName = contactName;
    button.style.marginRight = "10px";
    button.style.backgroundColor = generateColorFromLetter(
      contactName.charAt(0)
    );

    button.onclick = () => {
      deselectContact(contactName);
      renderSelectedContacts(container);
    };

    container.appendChild(button);
  });

  // Restliche Kontakte zählen
  const extraCount = selectedContacts.length - maxVisible;
  if (extraCount > 0) {
    const extraButton = document.createElement("div");
    extraButton.textContent = `+${extraCount}`;
    extraButton.classList.add("extra-count-button");
    container.appendChild(extraButton);
  }
}

function deselectContact(contactName) {
  const checkboxes = document.querySelectorAll(".dropdown-menu input");
  checkboxes.forEach((checkbox) => {
    if (checkbox.value === contactName) {
      checkbox.checked = false;
    }
  });

  const selectedContactsContainer = document.getElementById("selectedContacts");
  renderSelectedContacts(selectedContactsContainer);
}

function getSelectedContacts() {
  return selectedContacts; // Gibt die vollständige Liste der Namen zurück
}

function buildTaskObject() {
  return {
    title: document.getElementById("title").value.trim(),
    description: document.getElementById("description").value.trim(),
    assignedTo: getSelectedContacts(), // Vollständige Namen
    dueDate: document.querySelector("input[type='date']").value,
    prio: getActivePrio(),
    category: document.getElementById("customDropdownInput").value.trim(),
    subtasks: getSubtasks(),
  };
}

//Farbgenerierung
function generateColorFromLetter(letter) {
  const charCode = letter.toUpperCase().charCodeAt(0);
  const hue = (charCode - 65) * 15;
  return `hsl(${hue}, 70%, 50%)`;
}
