/**
 * API-URLs
 */
const apiURL =
  "https://join-388-default-rtdb.europe-west1.firebasedatabase.app/users.json";
const API_CONTACTS =
  "https://join-388-default-rtdb.europe-west1.firebasedatabase.app/contact.json";

/**
 * Liste der ausgewählten Kontakte
 */
let selectedContacts = [];

/**
 * Schaltet das Dropdown-Menü um.
 *
 * @param {string} dropdownId - Die ID des Dropdown-Menüs.
 */
function toggleDropdown(dropdownId) {
  const dropdownMenu = document.getElementById(dropdownId);

  if (!dropdownMenu) return;

  const allDropdowns = document.querySelectorAll(".dropdown-menu");
  allDropdowns.forEach((menu) => {
    if (menu !== dropdownMenu) {
      menu.classList.remove("open");
    }
  });

  dropdownMenu.classList.toggle("open");
}

/**
 * Schließt ein Dropdown, wenn außerhalb geklickt wird.
 *
 * @param {string} inputId - Die ID des Eingabefelds.
 * @param {string} menuId - Die ID des Dropdown-Menüs.
 */
function closeDropdownOnOutsideClick(inputId, menuId) {
  document.addEventListener("click", (event) => {
    const input = document.getElementById(inputId);
    const dropdownMenu = document.getElementById(menuId);

    if (
      input &&
      dropdownMenu &&
      event.target !== input &&
      !dropdownMenu.contains(event.target)
    ) {
      dropdownMenu.classList.remove("open");
    }
  });
}

/**
 * Initialisiert ein Dropdown-Menü mit zugehörigen Event-Listenern.
 *
 * @param {string} inputId - Die ID des Eingabefelds.
 * @param {string} menuId - Die ID des Dropdown-Menüs.
 */
function initializeDropdown(inputId, menuId) {
  const input = document.getElementById(inputId);
  const menu = document.getElementById(menuId);

  if (!input || !menu) return;

  if (input.dataset.listenerAdded) return;
  input.dataset.listenerAdded = true;

  input.addEventListener("click", (event) => {
    event.stopPropagation();
    toggleDropdown(menuId);
  });

  closeDropdownOnOutsideClick(inputId, menuId);
  setDropdownValueOnClick(menuId, inputId);
}

/**
 * Filtert die Einträge in einem Dropdown-Menü basierend auf der Eingabe.
 *
 * @param {string} inputId - Die ID des Eingabefelds.
 * @param {string} menuSelector - Der CSS-Selektor der Dropdown-Einträge.
 */
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

/**
 * Setzt den Wert eines Dropdowns, wenn ein Eintrag angeklickt wird.
 *
 * @param {string} menuId - Die ID des Dropdown-Menüs.
 * @param {string} inputId - Die ID des Eingabefelds.
 */
function setDropdownValueOnClick(menuId, inputId) {
  const menu = document.getElementById(menuId);
  if (!menu) return;

  menu.addEventListener("click", (event) => {
    if (event.target.classList.contains("custom-dropdown-item")) {
      const input = document.getElementById(inputId);
      if (input) {
        input.value = event.target.textContent.trim();
        menu.classList.remove("open");
      }
    }
  });
}

/**
 * Initialisierung der Dropdowns
 */
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

/**
 * Verhindere Texteingabe, erlaube aber z.B. Zahlen
 */
const input = document.getElementById("customDropdownInput");
input.addEventListener("keypress", (event) => {
  event.preventDefault();
});

input.addEventListener("input", (event) => {
  input.value = "";
});

/**
 * Lädt Kontakte von APIs und fügt sie dem Dropdown hinzu.
 *
 * @param {string} apiURL - Die URL der API.
 * @param {string} dropdownId - Die ID des Dropdown-Menüs.
 */
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

/**
 * Holt ein Dropdown-Menü-Element.
 *
 * @param {string} dropdownId - Die ID des Dropdown-Menüs.
 * @returns {HTMLElement} Das Dropdown-Menü-Element.
 */
function getDropdownMenu(dropdownId) {
  const dropdownMenu = document.getElementById(dropdownId);
  if (!dropdownMenu) {
    throw new Error("Dropdown-Menü nicht gefunden!");
  }
  dropdownMenu.innerHTML = ""; // Vorherigen Inhalt löschen
  return dropdownMenu;
}

/**
 * Ruft Kontakte aus zwei APIs ab und kombiniert sie.
 *
 * @param {string} apiURL - Die URL der ersten API.
 * @returns {Array} Eine Liste aller Kontakte.
 */
async function fetchAllContacts(apiURL) {
  const contactsFromMainAPI = await fetchContactsFromAPI(apiURL);
  const contactsFromSecondaryAPI = await fetchContactsFromAPI(API_CONTACTS);
  return [...contactsFromMainAPI, ...contactsFromSecondaryAPI];
}

/**
 * Ruft Kontakte aus einer API ab.
 *
 * @param {string} url - Die API-URL.
 * @returns {Array} Eine Liste der Kontakte.
 */
async function fetchContactsFromAPI(url) {
  const response = await fetch(url);
  if (!response.ok) {
    console.error(`Fehler beim Abrufen der Daten von ${url}`);
    return [];
  }
  const data = await response.json();
  return Object.values(data);
}

/**
 * Fügt Kontakte zum Dropdown hinzu und sortiert sie alphabetisch.
 *
 * @param {Array} contacts - Die Liste der Kontakte.
 * @param {Set} uniqueContacts - Eine Menge zur Vermeidung von Duplikaten.
 * @param {HTMLElement} dropdownMenu - Das Dropdown-Menü-Element.
 */
function addContactsToDropdown(contacts, uniqueContacts, dropdownMenu) {
  const sortedContacts = contacts.sort((a, b) =>
    a.name.localeCompare(b.name, "de", { sensitivity: "base" })
  );

  sortedContacts.forEach((contact) => {
    if (!uniqueContacts.has(contact.name)) {
      uniqueContacts.add(contact.name);
      const contactElement = createContactElement(contact);
      dropdownMenu.appendChild(contactElement);
    }
  });
}

/**
 * Erstellt ein Element für einen Kontakt.
 *
 * @param {Object} contact - Der Kontakt.
 * @returns {HTMLElement} Das erstellte Kontakt-Element.
 */
function createContactElement(contact) {
  const label = document.createElement("label");
  const checkbox = createCheckbox(contact.name);
  const button = createContactButton(contact.name);

  const checkboxId = `checkbox-${contact.name}`;
  checkbox.id = checkboxId;
  label.htmlFor = checkboxId;

  // Standardstil für das Label setzen
  label.style.backgroundColor = "#f9f9f9"; // Standardhintergrund
  label.style.padding = "10px"; // Optional, für bessere Sichtbarkeit
  label.style.display = "flex"; // Optional, wenn du Flex-Layout verwendest
  label.style.alignItems = "center";

  // Ändere den Hintergrund beim Ändern des Checkbox-Zustands
  checkbox.onchange = () => {
    if (checkbox.checked) {
      label.style.backgroundColor = "#2A3647"; // Grünlicher Hintergrund
      label.style.color = "#ffffff"; // Textfarbe weiß
    } else {
      label.style.backgroundColor = "#f9f9f9"; // Standardhintergrund
      label.style.color = "#000000"; // Textfarbe schwarz
    }

    updateSelectedContacts(contact.name, button, checkbox.checked);
  };

  // Füge die Checkbox, den Button und den Namen dem Label hinzu
  label.appendChild(checkbox);
  label.appendChild(button);
  label.appendChild(document.createTextNode(contact.name));

  return label;
}

/**
 * Erstellt ein Checkbox-Element.
 *
 * @param {string} name - Der Name des Kontakts.
 * @returns {HTMLElement} Das Checkbox-Element.
 */
function createCheckbox(name) {
  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.value = name;
  return checkbox;
}

/**
 * Erstellt einen Button für einen Kontakt.
 *
 * @param {string} name - Der Name des Kontakts.
 * @returns {HTMLElement} Der erstellte Button.
 */
function createContactButton(name) {
  const button = document.createElement("button");
  button.textContent = name.charAt(0).toUpperCase();
  button.style.marginRight = "10px";
  button.style.backgroundColor = generateColorFromLetter(name.charAt(0));
  return button;
}

/**
 * Ausgewählte Kontakte aktualisiere
 */
function updateSelectedContacts(contactName, button, isChecked) {
  const selectedContactsContainer = document.getElementById("selectedContacts");

  if (isChecked) {
    addSelectedContact(button, contactName, selectedContactsContainer);
  } else {
    removeSelectedContact(contactName, selectedContactsContainer);
  }

  renderSelectedContacts(selectedContactsContainer);
}

/**
 * Kontakt hinzufügen
 */
function addSelectedContact(button, contactName, container) {
  if (selectedContacts.includes(contactName)) return;
  selectedContacts.push(contactName);
  const clonedButton = button.cloneNode(true);
  clonedButton.dataset.contactName = contactName;
  clonedButton.onclick = () => {
    deselectContact(contactName);
    renderSelectedContacts(container);
  };

  container.appendChild(clonedButton);
  renderSelectedContacts(container);
}

/**
 * ausgewälte kontakt entfernen
 */
function removeSelectedContact(contactName, container) {
  selectedContacts = selectedContacts.filter((name) => name !== contactName);

  const buttons = container.querySelectorAll("button");
  buttons.forEach((btn) => {
    if (btn.dataset.contactName === contactName) {
      btn.remove();
    }
  });
  renderSelectedContacts(container);
}

function renderSelectedContacts(container) {
  const maxVisible = 3;
  container.innerHTML = "";
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
  return selectedContacts;
}

function buildTaskObject() {
  return {
    title: document.getElementById("title").value.trim(),
    description: document.getElementById("description").value.trim(),
    assignedTo: getSelectedContacts(),
    dueDate: document.querySelector("input[type='date']").value,
    prio: getActivePrio(),
    status: "To Do",
    category: document.getElementById("customDropdownInput").value.trim(),
    subtasks: getSubtasks(),
  };
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
  return `hsl(${hue}, 70%, 50%)`;
}
