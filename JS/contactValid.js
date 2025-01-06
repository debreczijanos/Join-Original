/**
 * Validiert das Formular zur Kontakt-Erstellung oder -Bearbeitung.
 *
 * @function validateContactForm
 * @returns {boolean} `true`, wenn alle Formularfelder gültig sind; ansonsten `false`.
 */
function validateContactForm() {
  const isNameValid = validateName();
  const isEmailValid = validateEmail();
  const isPhoneValid = validatePhone();
  return isNameValid && isEmailValid && isPhoneValid;
}

/**
 * Sammelt die eingegebenen Daten aus dem Kontaktformular.
 *
 * @function gatherContactFormData
 * @returns {Object} Ein Objekt mit den Kontaktinformationen: `name`, `email`, `telefonnummer`.
 */
function gatherContactFormData() {
  const name = document.getElementById("contactName").value.trim();
  const email = document.getElementById("contactEmail").value.trim();
  const telefonnummer = document.getElementById("contactPhone").value.trim();

  return { name, email, telefonnummer };
}

/**
 * Validiert den Namen im Kontaktformular.
 *
 * @function validateName
 * @returns {boolean} `true`, wenn der Name gültig ist; ansonsten `false`.
 */
function validateName() {
  const nameInput = document.getElementById("contactName");
  const errorName = document.getElementById("errorName");
  const nameRegex = /^[a-zA-Z\s]+$/;

  if (!nameRegex.test(nameInput.value.trim())) {
    errorName.textContent =
      "Name darf nur Buchstaben und Leerzeichen enthalten.";
    toggleCreateButton();
    return false;
  } else {
    errorName.textContent = "";
    toggleCreateButton();
    return true;
  }
}

/**
 * Validiert die eingegebene E-Mail-Adresse und überprüft, ob sie bereits registriert ist.
 *
 * @async
 * @function validateEmail
 * @param {boolean} [isEditMode=false] - Gibt an, ob sich die Funktion im Bearbeitungsmodus befindet.
 * @param {string} [originalEmail=""] - Die ursprüngliche E-Mail-Adresse im Bearbeitungsmodus.
 * @returns {Promise<boolean>} Gibt `true` zurück, wenn die E-Mail-Adresse gültig ist; andernfalls `false`.
 */
async function validateEmail(isEditMode = false, originalEmail = "") {
  const emailValue = getEmailInputValue();
  const errorMessage = validateEmailFormat(
    emailValue,
    isEditMode,
    originalEmail
  );

  if (errorMessage) {
    displayEmailError(errorMessage);
    toggleCreateButton();
    return false;
  }

  if (await isEmailAlreadyRegistered(emailValue, isEditMode, originalEmail)) {
    displayEmailError("Diese Email-Adresse ist bereits registriert.");
    toggleCreateButton();
    return false;
  }

  clearEmailError();
  toggleCreateButton();
  return true;
}

/**
 * Holt den Wert aus dem E-Mail-Eingabefeld.
 *
 * @function getEmailInputValue
 * @returns {string} Der Wert des E-Mail-Eingabefelds.
 */
function getEmailInputValue() {
  const emailInput = document.getElementById("contactEmail");
  return emailInput.value.trim();
}

/**
 * Validiert das Format der eingegebenen E-Mail-Adresse.
 *
 * @function validateEmailFormat
 * @param {string} emailValue - Die E-Mail-Adresse, die validiert werden soll.
 * @param {boolean} isEditMode - Gibt an, ob sich die Funktion im Bearbeitungsmodus befindet.
 * @param {string} originalEmail - Die ursprüngliche E-Mail-Adresse im Bearbeitungsmodus.
 * @returns {string|null} Eine Fehlermeldung, wenn die E-Mail-Adresse ungültig ist; andernfalls `null`.
 */
function validateEmailFormat(emailValue, isEditMode, originalEmail) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailValue) return "";
  if (!emailRegex.test(emailValue))
    return "Bitte geben Sie eine gültige Email-Adresse ein.";
  if (isEditMode && emailValue === originalEmail) return "";
  return null;
}

/**
 * Überprüft, ob eine E-Mail-Adresse bereits registriert ist.
 *
 * @async
 * @function isEmailAlreadyRegistered
 * @param {string} emailValue - Die zu überprüfende E-Mail-Adresse.
 * @param {boolean} isEditMode - Gibt an, ob sich die Funktion im Bearbeitungsmodus befindet.
 * @param {string} originalEmail - Die ursprüngliche E-Mail-Adresse im Bearbeitungsmodus.
 * @returns {Promise<boolean>} Gibt `true` zurück, wenn die E-Mail-Adresse bereits registriert ist; ansonsten `false`.
 */
async function isEmailAlreadyRegistered(emailValue, isEditMode, originalEmail) {
  if (isEditMode && emailValue === originalEmail) return false;
  const existingEmails = await fetchExistingEmails();
  return existingEmails.includes(emailValue);
}

/**
 * Zeigt eine Fehlermeldung für die E-Mail-Adresse an.
 *
 * @function displayEmailError
 * @param {string} message - Die anzuzeigende Fehlermeldung.
 */
function displayEmailError(message) {
  const errorEmail = document.getElementById("errorEmail");
  errorEmail.textContent = message;
}

/**
 * Entfernt die Fehlermeldung für die E-Mail-Adresse.
 *
 * @function clearEmailError
 */
function clearEmailError() {
  const errorEmail = document.getElementById("errorEmail");
  errorEmail.textContent = "";
}

/**
 * Validiert die Telefonnummer im Kontaktformular.
 *
 * @function validatePhone
 * @returns {boolean} Gibt `true` zurück, wenn die Telefonnummer gültig ist; andernfalls `false`.
 */
function validatePhone() {
  const phoneInput = document.getElementById("contactPhone");
  const errorPhone = document.getElementById("errorPhone");
  const phoneRegex = /^\+?[0-9]{7,15}$/;

  if (!phoneInput.value.trim()) {
    errorPhone.textContent = "";
    toggleCreateButton();
    return false;
  }

  if (!phoneRegex.test(phoneInput.value.trim())) {
    errorPhone.textContent =
      "Telefonnummer mindestlänge 7 Zahlen und darf nur Zahlen enthalten (optional mit '+').";
    toggleCreateButton();
    return false;
  }

  errorPhone.textContent = "";
  toggleCreateButton();
  return true;
}

/**
 * Ruft alle vorhandenen E-Mail-Adressen von Kontakten und Benutzern ab.
 *
 * @async
 * @function fetchExistingEmails
 * @returns {Promise<Array<string>>} Ein Array von E-Mail-Adressen.
 */
async function fetchExistingEmails() {
  try {
    const [contacts, users] = await fetchContactsAndUsers();
    return combineAndDeduplicateEmails(contacts, users);
  } catch {
    return [];
  }
}

/**
 * Holt Kontakt- und Benutzerdaten von der API.
 *
 * @async
 * @function fetchContactsAndUsers
 * @returns {Promise<Array<Object>>} Ein Array mit Kontakt- und Benutzerdaten.
 */
async function fetchContactsAndUsers() {
  const [contactsResponse, usersResponse] = await Promise.all([
    fetch(`${API_CONTACTS}`),
    fetch(`${apiURL}`),
  ]);

  const contactsData = await contactsResponse.json();
  const usersData = await usersResponse.json();

  return [contactsData, usersData];
}

/**
 * Extrahiert E-Mail-Adressen aus den Daten.
 *
 * @function extractEmails
 * @param {Object} data - Die Daten, aus denen E-Mails extrahiert werden.
 * @param {string} [type="contact"] - Der Typ der Daten ("contact" oder "user").
 * @returns {Array<string>} Ein Array mit E-Mail-Adressen.
 */
function extractEmails(data, type = "contact") {
  if (!data) return [];
  return Object.values(data).map((item) =>
    type === "contact" ? item.email.trim() : item.email.trim()
  );
}

/**
 * Kombiniert und entfernt Duplikate aus Kontakt- und Benutzer-E-Mails.
 *
 * @function combineAndDeduplicateEmails
 * @param {Object} contactsData - Die Kontaktdaten.
 * @param {Object} usersData - Die Benutzerdaten.
 * @returns {Array<string>} Ein Array eindeutiger E-Mail-Adressen.
 */
function combineAndDeduplicateEmails(contactsData, usersData) {
  const contactEmails = extractEmails(contactsData, "contact");
  const userEmails = extractEmails(usersData, "user");
  return [...new Set([...contactEmails, ...userEmails])];
}

/**
 * Aktiviert oder deaktiviert die Buttons basierend auf der Formularvalidität.
 *
 * @function toggleCreateButton
 */
function toggleCreateButton() {
  const createButton = document.getElementById("createContactButton");
  const saveButton = document.querySelector(".save-btn");
  const isValid = validateFormInputs();
  updateButtonState(createButton, isValid);
  updateButtonState(saveButton, isValid);
}

/**
 * Überprüft die Eingaben im Formular auf Fehler und ob alle Felder ausgefüllt sind.
 *
 * @function validateFormInputs
 * @returns {boolean} `true`, wenn das Formular gültig ist; ansonsten `false`.
 */
function validateFormInputs() {
  const errorName = document.getElementById("errorName").textContent;
  const errorEmail = document.getElementById("errorEmail").textContent;
  const errorPhone = document.getElementById("errorPhone").textContent;
  const nameInput = document.getElementById("contactName").value.trim();
  const emailInput = document.getElementById("contactEmail").value.trim();
  const phoneInput = document.getElementById("contactPhone").value.trim();

  return (
    !errorName &&
    !errorEmail &&
    !errorPhone &&
    nameInput &&
    emailInput &&
    phoneInput
  );
}

/**
 * Aktualisiert den Zustand eines Buttons (aktiviert/deaktiviert).
 *
 * @function updateButtonState
 * @param {HTMLElement} button - Der Button, dessen Zustand geändert wird.
 * @param {boolean} isValid - Gibt an, ob der Button aktiviert (`true`) oder deaktiviert (`false`) sein soll.
 */
function updateButtonState(button, isValid) {
  if (button) {
    button.disabled = !isValid;
  }
}

/**
 * Speichert die Änderungen eines Kontakts.
 *
 * @async
 * @function saveEditedContact
 * @param {string} contactId - Die ID des zu bearbeitenden Kontakts.
 */
async function saveEditedContact(contactId) {
  if (await isFormValid()) {
    const updatedData = getUpdatedContactData();

    try {
      await updateContactInDatabase(contactId, updatedData);
      await updateUIAfterSave(updatedData);
      closeAddContactOverlay();
    } catch (error) {
      handleSaveError(error);
    }
  }
}

/**
 * Überprüft die Validität der Formularfelder (Name, E-Mail, Telefonnummer).
 *
 * @async
 * @function isFormValid
 * @returns {Promise<boolean>} Gibt `true` zurück, wenn das Formular gültig ist; andernfalls `false`.
 */
async function isFormValid() {
  const isNameValid = validateName();
  const email = document.getElementById("contactEmail").value.trim();
  const isEmailValid = await validateEmail(true, email);
  const isPhoneValid = validatePhone();

  return isNameValid && isEmailValid && isPhoneValid;
}

/**
 * Holt die aktualisierten Daten aus dem Kontaktformular.
 *
 * @function getUpdatedContactData
 * @returns {Object} Ein Objekt mit den aktualisierten Kontaktinformationen: `name`, `email`, `telefonnummer`.
 */
function getUpdatedContactData() {
  const name = document.getElementById("contactName").value.trim();
  const email = document.getElementById("contactEmail").value.trim();
  const phone = document.getElementById("contactPhone").value.trim();

  return { name, email, telefonnummer: phone };
}

/**
 * Aktualisiert einen Kontakt in der Datenbank.
 *
 * @async
 * @function updateContactInDatabase
 * @param {string} contactId - Die ID des zu aktualisierenden Kontakts.
 * @param {Object} updatedData - Die aktualisierten Kontaktdaten.
 * @throws {Error} Wenn die HTTP-Anfrage fehlschlägt.
 */
async function updateContactInDatabase(contactId, updatedData) {
  const response = await fetch(
    `${API_CONTACTS.replace(".json", "")}/${contactId}.json`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedData),
    }
  );

  if (!response.ok) {
    throw new Error(`Fehler beim Speichern: ${response.status}`);
  }
}

/**
 * Aktualisiert die Benutzeroberfläche nach dem Speichern eines Kontakts.
 *
 * @async
 * @function updateUIAfterSave
 * @param {Object} updatedData - Die aktualisierten Kontaktdaten.
 */
async function updateUIAfterSave(updatedData) {
  await renderContacts();

  const selectedDiv = document.querySelector(`.contact-item.selected`);
  if (selectedDiv) {
    highlightSelectedContact(selectedDiv, updatedData);
  }
}

/**
 * Behandelt Fehler, die beim Speichern eines Kontakts auftreten.
 *
 * @function handleSaveError
 * @param {Error} error - Der aufgetretene Fehler.
 */
function handleSaveError(error) {
  console.error("Fehler beim Aktualisieren des Kontakts:", error);
}
