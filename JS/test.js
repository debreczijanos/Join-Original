const USERS_API_URL =
  "https://join-388-default-rtdb.europe-west1.firebasedatabase.app/users.json";
const CONTACTS_API_URL =
  "https://join-388-default-rtdb.europe-west1.firebasedatabase.app/contact.json";

/**
 * Liste der ausgewählten Kontakte
 */
let selectedContacts = [];
let currentTaskId = null; // Speichert die aktuelle Task-ID

/**
 * Schließt das Dropdown, wenn außerhalb geklickt wird.
 */
document.addEventListener("click", (event) => {
  const dropdown = document.querySelector(".dropdown");
  if (!dropdown.contains(event.target)) {
    document.getElementById("dropdownMenu").classList.add("d-none");
  }
});

/**
 * Füllt das Dropdown mit den geladenen Kontakten.
 * @param {Array} contacts - Die Liste der geladenen Kontakte.
 * @param {Array} [assignedContacts=[]] - Liste der bereits zugewiesenen Kontakte (optional).
 */
function populateDropdown(contacts, assignedContacts = []) {
  const dropdownMenu = document.getElementById("dropdownMenu");
  dropdownMenu.innerHTML = ""; // Vorherige Inhalte löschen

  contacts.forEach((contact) => {
    const contactElement = document.createElement("label");
    contactElement.className = "dropdown-item";

    // Checkbox erstellen
    const checkbox = createCheckbox(contact.name);
    checkbox.checked = assignedContacts.includes(contact.name);

    // Button mit dem ersten Buchstaben des Namens erstellen
    const button = createContactButton(contact.name);

    // Event-Handler für Checkbox
    checkbox.onchange = () => {
      const isChecked = checkbox.checked;

      if (isChecked) {
        if (!selectedContacts.includes(contact.name)) {
          selectedContacts.push(contact.name);
        }
      } else {
        const index = selectedContacts.indexOf(contact.name);
        if (index > -1) {
          selectedContacts.splice(index, 1);
        }
      }

      // Aktualisiere die Anzeige der ausgewählten Kontakte
      updateSelectedContactsDisplay();

      // Optional: Synchronisiere mit dem Backend
      updateTaskAssignments(selectedContacts);
    };

    // Elemente hinzufügen
    contactElement.appendChild(checkbox);
    contactElement.appendChild(button);
    contactElement.appendChild(document.createTextNode(contact.name));
    dropdownMenu.appendChild(contactElement);

    // Aktualisiere initialen Stil
    updateDropdownStyle(contactElement, checkbox.checked);
  });
}

/**
 * Aktualisiert die Liste der ausgewählten Kontakte.
 * @param {string} contactName - Der Name des Kontakts.
 * @param {boolean} isChecked - Ob der Kontakt ausgewählt ist.
 */
function updateSelectedContacts(contactName, isChecked) {
  if (isChecked) {
    if (!selectedContacts.includes(contactName)) {
      selectedContacts.push(contactName);
    }
  } else {
    const index = selectedContacts.indexOf(contactName);
    if (index > -1) {
      selectedContacts.splice(index, 1);
    }
  }

  // Aktualisiere die Anzeige der ausgewählten Kontakte
  const selectedContactsContainer = document.getElementById("selectedContacts");
  renderSelectedContacts(selectedContactsContainer);

  // Aktualisiere die Task-Daten (falls erforderlich)
  if (currentTaskId) {
    const task = allTasksData.find((task) => task.id === currentTaskId);
    if (task) {
      task.assignedTo = [...selectedContacts];
    }
  }
}

/**
 * Lädt die Zuweisungen einer spezifischen Aufgabe und markiert die zugewiesenen Kontakte.
 * @param {string} taskId - Die ID der Aufgabe.
 */
async function loadTaskAssignments(taskId) {
  currentTaskId = taskId;

  try {
    const taskResponse = await fetch(
      `https://join-388-default-rtdb.europe-west1.firebasedatabase.app/tasks/${taskId}.json`
    );

    if (!taskResponse.ok) {
      throw new Error("Failed to load task data");
    }

    const task = await taskResponse.json();
    if (!task) {
      console.warn("Task not found or response is null");
      return;
    }

    selectedContacts = task.assignedTo || [];
    console.log("Selected contacts for this task:", selectedContacts);

    // Synchronisiere das Dropdown mit den geladenen Kontakten
    syncDropdownWithSelectedContacts();
  } catch (error) {
    console.error("Error loading task assignments:", error);
  }
}

/**
 * Synchronisiert das Dropdown mit den ausgewählten Kontakten.
 */
function syncDropdownWithSelectedContacts() {
  const dropdownMenu = document.getElementById("dropdownMenu");
  const checkboxes = dropdownMenu.querySelectorAll("input[type='checkbox']");

  checkboxes.forEach((checkbox) => {
    checkbox.checked = selectedContacts.includes(checkbox.value);
  });
}

/**
 * Initialisiert das Laden der Kontakte und der spezifischen Aufgabe.
 */
document.addEventListener("DOMContentLoaded", async () => {
  const taskId = "OF604eP7v0MtTlC5Del"; // Beispiel-Task-ID
  await loadContacts(); // Kontakte laden
});

/**
 * Rendert das Dropdown-Menü mit den geladenen Kontakten.
 *
 * @param {Array} contacts - Liste der Kontakte.
 * @param {HTMLElement} dropdownMenu - Das Dropdown-Menü-Element.
 * @param {Array} assignedContacts - Die Liste der bereits zugewiesenen Kontakte.
 */
function renderContactsDropdown(contacts, dropdownMenu, assignedContacts = []) {
  dropdownMenu.innerHTML = ""; // Leere das Dropdown

  contacts.forEach((contact) => {
    const label = document.createElement("label");
    label.className = "dropdown-item";
    label.style.display = "flex";
    label.style.alignItems = "center";
    label.style.padding = "10px";

    const checkbox = createCheckbox(contact.name);
    checkbox.checked = assignedContacts.includes(contact.name);

    // Styling aktualisieren basierend auf dem Status
    updateDropdownStyle(label, checkbox.checked);

    checkbox.onchange = () => {
      updateDropdownStyle(label, checkbox.checked);
      if (checkbox.checked) {
        if (!assignedContacts.includes(contact.name)) {
          assignedContacts.push(contact.name);
        }
      } else {
        const index = assignedContacts.indexOf(contact.name);
        if (index > -1) {
          assignedContacts.splice(index, 1);
        }
      }

      // Aktualisiere die Ansicht der ausgewählten Kontakte
      renderSelectedContacts(document.getElementById("selectedContacts"));
    };

    const button = createContactButton(contact.name);

    label.appendChild(checkbox);
    label.appendChild(button);
    label.appendChild(document.createTextNode(contact.name));
    dropdownMenu.appendChild(label);
  });
}

/**
 * Fügt einen Kontakt zu den ausgewählten hinzu.
 *
 * @param {string} name - Name des Kontakts.
 * @param {HTMLElement} button - Button für den Kontakt.
 */
function addContact(name, button) {
  if (!selectedContacts.includes(name)) {
    selectedContacts.push(name);
    renderSelectedContacts();
  }
}

/**
 * Entfernt einen Kontakt aus den ausgewählten.
 *
 * @param {string} name - Name des Kontakts.
 */
function removeContact(name) {
  selectedContacts = selectedContacts.filter((contact) => contact !== name);
  renderSelectedContacts();
}

/**
 * Rendert die ausgewählten Kontakte mit einer maximal sichtbaren Anzahl.
 *
 * @param {HTMLElement} container - Der Container für die Anzeige der ausgewählten Kontakte.
 */
function renderSelectedContacts(container) {
  const maxVisible = 3; // Maximale Anzahl sichtbar
  container.innerHTML = ""; // Container leeren

  // Zeige die ersten 3 Kontakte
  selectedContacts.slice(0, maxVisible).forEach((contactName) => {
    const initials = contactName
      .split(" ")
      .map((namePart) => namePart[0].toUpperCase())
      .join("");

    const randomColor = generateColorFromLetter(contactName.charAt(0));

    const participantElement = document.createElement("span");
    participantElement.classList.add("participant");
    participantElement.style.backgroundColor = randomColor;
    participantElement.innerText = initials;

    container.appendChild(participantElement);
  });

  // Zeige die Anzahl der zusätzlichen Kontakte
  const extraCount = selectedContacts.length - maxVisible;
  if (extraCount > 0) {
    const extraCountElement = document.createElement("span");
    extraCountElement.classList.add("participant", "extra-count");
    extraCountElement.innerText = `+${extraCount}`;
    container.appendChild(extraCountElement);
  }
}

/**
 * Entfernt einen Kontakt aus der Liste der ausgewählten Kontakte.
 *
 * @param {string} contactName - Der Name des zu entfernenden Kontakts.
 */
function deselectContact(contactName) {
  selectedContacts = selectedContacts.filter((name) => name !== contactName);

  // Checkbox des entsprechenden Kontakts im Dropdown deaktivieren
  const checkboxes = document.querySelectorAll(".dropdown-item input");
  checkboxes.forEach((checkbox) => {
    if (checkbox.value === contactName) {
      checkbox.checked = false;
    }
  });

  const selectedContactsContainer = document.getElementById("selectedContacts");
  populateEditTaskForm(selectedContactsContainer); // Aktualisiere die Anzeige
}

function generateColorFromLetter(letter) {
  const charCode = letter.toUpperCase().charCodeAt(0);
  const hue = (charCode - 65) * 15;
  return `hsl(${hue}, 70%, 50%)`; // HSL-Farbmodell für dynamische Farben
}

/**
 * Füllt das Bearbeitungsformular mit den Task-Daten.
 *
 * @param {Object} task - Die Daten des Tasks, der bearbeitet werden soll.
 */
function populateEditTaskForm(task) {
  // Setze die Task-Details in das Formular
  document.getElementById("edit-title").value = task.title || "";
  document.getElementById("edit-description").value = task.description || "";
  document.getElementById("edit-due-date").value = task.dueDate || "";
  document.getElementById("edit-priority").value = task.prio || "Medium";

  // Aktualisiere die `selectedContacts`
  selectedContacts = task.assignedTo || [];

  // Zeige die Kontakte
  updateSelectedContactsDisplay();
  // Bereite den Container für ausgewählte Kontakte vor
  const selectedContactsContainer = document.getElementById("selectedContacts");
  selectedContactsContainer.innerHTML = "";

  if (task.assignedTo && task.assignedTo.length > 0) {
    // Limitiere auf die ersten 3 Teilnehmer
    const visibleParticipants = task.assignedTo.slice(0, 3);
    const remainingCount = task.assignedTo.length - visibleParticipants.length;

    // Erstelle die ersten 3 Teilnehmer als `span`-Elemente
    visibleParticipants.forEach((person) => {
      const initials = person
        .split(" ")
        .map((namePart) => namePart[0].toUpperCase())
        .join("");

      const randomColor = getRandomColor();

      const participantElement = document.createElement("span");
      participantElement.classList.add("participant");
      participantElement.style.backgroundColor = randomColor;
      participantElement.innerText = initials;

      selectedContactsContainer.appendChild(participantElement);
    });

    // Falls es mehr als 3 Teilnehmer gibt, füge einen Zähler hinzu
    if (remainingCount > 0) {
      const extraCountElement = document.createElement("span");
      extraCountElement.classList.add("participant", "extra-count");
      extraCountElement.innerText = `+${remainingCount}`;
      selectedContactsContainer.appendChild(extraCountElement);
    }
  } else {
    // Keine Kontakte zugewiesen
    selectedContactsContainer.innerHTML = `<p>Keine Kontakte zugewiesen</p>`;
  }
}

function updateSelectedContactsDisplay() {
  const selectedContactsContainer = document.getElementById("selectedContacts");

  // 1. Container leeren
  selectedContactsContainer.innerHTML = "";

  // 2. Zeige maximal 3 Kontakte
  const maxVisible = 3;
  const visibleContacts = selectedContacts.slice(0, maxVisible);

  visibleContacts.forEach((contactName) => {
    const initials = contactName
      .split(" ")
      .map((namePart) => namePart[0].toUpperCase())
      .join("");

    const randomColor = generateColorFromLetter(contactName.charAt(0));

    const participantElement = document.createElement("span");
    participantElement.classList.add("participant");
    participantElement.style.backgroundColor = randomColor;
    participantElement.innerText = initials;

    selectedContactsContainer.appendChild(participantElement);
  });

  // 3. Zusätzliche Kontakte anzeigen
  const extraCount = selectedContacts.length - maxVisible;
  if (extraCount > 0) {
    const extraCountElement = document.createElement("span");
    extraCountElement.classList.add("participant", "extra-count");
    extraCountElement.innerText = `+${extraCount}`;
    selectedContactsContainer.appendChild(extraCountElement);
  }
}
