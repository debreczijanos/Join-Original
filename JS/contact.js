/**
 * Firebase-URLs für die API-Endpunkte.
 * @constant {string} apiURL - URL für Benutzerdaten.
 * @constant {string} API_CONTACTS - URL für Kontaktdaten.
 */
const apiURL =
  "https://join-388-default-rtdb.europe-west1.firebasedatabase.app/users.json";
const API_CONTACTS =
  "https://join-388-default-rtdb.europe-west1.firebasedatabase.app/contact.json";

/**
 * Funktion, um Daten von einer angegebenen API zu holen.
 *
 * @async
 * @function fetchData
 * @param {string} url - Die URL der API, von der Daten abgerufen werden sollen.
 * @returns {Promise<Object|undefined>} Gibt ein Promise zurück, das die abgerufenen Daten als Objekt enthält.
 * @throws {Error} Wenn die HTTP-Antwort nicht erfolgreich ist.
 * @example
 * fetchData(apiURL).then(data => console.log(data)).catch(error => console.error(error));
 */
async function fetchData(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP-Fehler! Status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Fehler beim Laden der Daten:", error);
  }
}

/**
 * Rendert die Kontaktliste und die zugehörigen Details.
 *
 * @async
 * @function renderContacts
 * @returns {Promise<void>} Gibt ein Promise zurück, das die Ausführung der Funktion angibt.
 */
async function renderContacts() {
  const contactsDiv = document.getElementById("contactsId");
  const contactDetailsDiv = document.getElementById("contactDate");
  contactsDiv.innerHTML = "";

  try {
    const [contactsData, usersData] = await Promise.all([
      fetchData(API_CONTACTS),
      fetchData(apiURL),
    ]);

    const combinedData = combineContactsAndUsers(contactsData, usersData);
    updateContactList(contactsDiv, contactDetailsDiv, combinedData);
  } catch (error) {
    handleRenderError(contactsDiv, contactDetailsDiv, error);
  }
}

/**
 * Aktualisiert die Kontaktliste und zeigt die sortierten Kontakte an.
 *
 * @function updateContactList
 * @param {HTMLElement} contactsDiv - Das HTML-Element, das die Kontaktliste enthält.
 * @param {HTMLElement} contactDetailsDiv - Das HTML-Element, das die Kontaktdetails enthält.
 * @param {Array<Object>} combinedData - Die kombinierten und verarbeiteten Kontaktdaten.
 */
function updateContactList(contactsDiv, contactDetailsDiv, combinedData) {
  if (combinedData.length > 0) {
    const sortedData = sortContactsByName(combinedData);
    renderSortedContacts(contactsDiv, contactDetailsDiv, sortedData);
  } else {
    contactsDiv.innerHTML = "<p>Keine Kontakte gefunden.</p>";
    contactDetailsDiv.innerHTML = "<p>Keine Details verfügbar.</p>";
  }
}

/**
 * Sortiert Kontakte alphabetisch nach Namen.
 *
 * @function sortContactsByName
 * @param {Array<Object>} contacts - Die Liste der Kontakte.
 * @returns {Array<Object>} Die sortierte Liste der Kontakte.
 */
function sortContactsByName(contacts) {
  return contacts.sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Behandelt Fehler beim Rendern von Kontakten.
 *
 * @function handleRenderError
 * @param {HTMLElement} contactsDiv - Das HTML-Element, das die Kontaktliste enthält.
 * @param {HTMLElement} contactDetailsDiv - Das HTML-Element, das die Kontaktdetails enthält.
 * @param {Error} error - Der Fehler, der beim Rendern aufgetreten ist.
 */
function handleRenderError(contactsDiv, contactDetailsDiv, error) {
  contactsDiv.innerHTML = `<p>Fehler beim Laden der Kontakte: ${error.message}</p>`;
  contactDetailsDiv.innerHTML = "<p>Fehler beim Laden der Details.</p>";
}

/**
 * Kombiniert die Kontakt- und Benutzerdaten, entfernt Duplikate.
 *
 * @function combineContactsAndUsers
 * @param {Object} contacts - Die Kontaktdaten.
 * @param {Object} users - Die Benutzerdaten.
 * @returns {Array<Object>} Ein Array mit kombinierten und deduplizierten Kontakten.
 */
function combineContactsAndUsers(contacts, users) {
  const contactsArray = parseDataToArray(contacts);
  const usersArray = parseDataToArray(users);
  const combinedArray = [...contactsArray, ...usersArray];
  return removeDuplicatesByEmailAndId(combinedArray);
}

/**
 * Konvertiert ein Datenobjekt in ein Array.
 *
 * @function parseDataToArray
 * @param {Object|null} data - Das Datenobjekt.
 * @returns {Array<Object>} Ein Array, das die Daten als Objekte enthält.
 */
function parseDataToArray(data) {
  return data
    ? Object.entries(data).map(([id, item]) => ({ id, ...item }))
    : [];
}

/**
 * Entfernt doppelte Einträge in einem Array basierend auf E-Mail und ID.
 *
 * @function removeDuplicatesByEmailAndId
 * @param {Array<Object>} array - Das Array, das überprüft wird.
 * @returns {Array<Object>} Ein Array ohne Duplikate.
 */
function removeDuplicatesByEmailAndId(array) {
  return array.reduce((acc, current) => {
    if (
      !acc.find(
        (item) => item.email === current.email && item.id === current.id
      )
    ) {
      acc.push(current);
    }
    return acc;
  }, []);
}

/**
 * Hebt den ausgewählten Kontakt hervor und zeigt dessen Details an.
 *
 * @function highlightSelectedContact
 * @param {HTMLElement} selectedDiv - Das HTML-Element des ausgewählten Kontakts.
 * @param {Object} contactData - Die Daten des ausgewählten Kontakts.
 */
function highlightSelectedContact(selectedDiv, contactData) {
  deselectAllContacts();
  selectContact(selectedDiv);
  updateContactDetails(contactData);

  if (window.innerWidth <= 1250) {
    openEditContactOverlay(contactData);
  }
}

/**
 * Hebt die Auswahl von allen Kontakten auf.
 *
 * @function deselectAllContacts
 */
function deselectAllContacts() {
  document
    .querySelectorAll(".contact-item")
    .forEach((item) => item.classList.remove("selected"));
}

/**
 * Markiert einen Kontakt als ausgewählt.
 *
 * @function selectContact
 * @param {HTMLElement} contactDiv - Das HTML-Element des zu markierenden Kontakts.
 */
function selectContact(contactDiv) {
  contactDiv.classList.add("selected");
}

/**
 * Löscht einen Kontakt nach Bestätigung durch den Benutzer.
 *
 * @async
 * @function deleteContact
 * @param {string} contactId - Die ID des zu löschenden Kontakts.
 * @param {string} contactName - Der Name des zu löschenden Kontakts.
 */
async function deleteContact(contactId, contactName) {
  const confirmationBox = createConfirmationBox(contactName);

  document.body.appendChild(confirmationBox);

  confirmationBox
    .querySelector(".confirm-btn")
    .addEventListener("click", async () => {
      await handleContactDeletion(contactId, confirmationBox);
    });

  confirmationBox.querySelector(".cancel-btn").addEventListener("click", () => {
    confirmationBox.remove(); // Schließe die Bestätigungsbox
  });
}

/**
 * Handhabt die Löschung eines Kontakts und aktualisiert die UI.
 *
 * @async
 * @function handleContactDeletion
 * @param {string} contactId - Die ID des zu löschenden Kontakts.
 * @param {HTMLElement} confirmationBox - Die Bestätigungsbox, die geschlossen werden soll.
 */
async function handleContactDeletion(contactId, confirmationBox) {
  try {
    const response = await fetch(
      `${API_CONTACTS.replace(".json", "")}/${contactId}.json`,
      {
        method: "DELETE",
      }
    );

    if (!response.ok) {
      throw new Error(`Fehler beim Löschen des Kontakts: ${response.status}`);
    }
    confirmationBox.remove();
    closeAddContactOverlay();
    renderContacts();
  } catch (error) {
    console.error("Fehler beim Löschen des Kontakts:", error);
  }
}

/**
 * Ruft die Kontakte beim Laden der Seite auf.
 *
 * @function
 * @listens DOMContentLoaded
 */
document.addEventListener("DOMContentLoaded", renderContacts);

/**
 * Schließt das Overlay zur Erstellung oder Bearbeitung eines Kontakts.
 *
 * @function closeAddContactOverlay
 */
function closeAddContactOverlay() {
  const overlay = document.querySelector(".overlay");
  if (overlay) {
    overlay.remove();
  }
}

/**
 * Erstellt einen neuen Kontakt, wenn das Formular gültig ist, und aktualisiert die Kontaktliste.
 *
 * @function createContact
 */
function createContact() {
  if (validateContactForm()) {
    const newContact = gatherContactFormData();
    saveNewContact(newContact)
      .then(() => {
        closeAddContactOverlay();
        renderContacts();
      })
      .catch((error) => {
        console.error("Fehler beim Hinzufügen des Kontakts:", error);
      });
  }
}

/**
 * Speichert einen neuen Kontakt in der Datenbank.
 *
 * @async
 * @function saveNewContact
 * @param {Object} contact - Die Kontaktinformationen, die gespeichert werden sollen.
 * @throws {Error} Wenn die HTTP-Antwort nicht erfolgreich ist.
 */
async function saveNewContact(contact) {
  const response = await fetch(`${API_CONTACTS}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(contact),
  });

  if (!response.ok) {
    throw new Error(`Fehler beim Speichern des Kontakts: ${response.status}`);
  }
}

/**
 * Öffnet ein Overlay zur Erstellung oder Bearbeitung eines Kontakts.
 *
 * @function openContactOverlay
 * @param {Object|null} [contactData=null] - Die Kontaktdaten, falls im Bearbeitungsmodus.
 */
function openContactOverlay(contactData = null) {
  const isEditMode = !!contactData;
  const overlay = document.createElement("div");
  overlay.classList.add("overlay");
  overlay.innerHTML = getContactOverlayTemplate(contactData, isEditMode);
  document.body.appendChild(overlay);
  attachOverlayEventListeners(isEditMode, contactData);
  toggleCreateButton();
}

/**
 * Fügt Event-Listener für Eingabefelder im Overlay hinzu.
 *
 * @function attachOverlayEventListeners
 * @param {boolean} isEditMode - Gibt an, ob sich die Funktion im Bearbeitungsmodus befindet.
 * @param {Object|null} contactData - Die Kontaktdaten im Bearbeitungsmodus, sonst `null`.
 */
function attachOverlayEventListeners(isEditMode, contactData) {
  const nameInput = document.getElementById("contactName");
  const emailInput = document.getElementById("contactEmail");
  const phoneInput = document.getElementById("contactPhone");

  nameInput.addEventListener("input", () => {
    validateName();
    toggleCreateButton();
  });

  emailInput.addEventListener("input", () => {
    validateEmail(isEditMode, contactData ? contactData.email : "");
    toggleCreateButton();
  });

  phoneInput.addEventListener("input", () => {
    validatePhone();
    toggleCreateButton();
  });
}

/**
 * Öffnet ein Overlay zur Erstellung eines neuen Kontakts.
 *
 * @function openAddContactOverlay
 */
function openAddContactOverlay() {
  openContactOverlay(); // Aufruf ohne Kontakt-Daten
}

/**
 * Öffnet ein Overlay zur Bearbeitung eines vorhandenen Kontakts.
 *
 * @function openEditContactOverlay
 * @param {Object} contactData - Die Daten des zu bearbeitenden Kontakts.
 */
function openEditContactOverlay(contactData) {
  openContactOverlay(contactData); // Aufruf mit Kontakt-Daten
}
