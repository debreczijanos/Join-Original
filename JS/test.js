// Firebase-URLs
const apiURL =
  "https://join-388-default-rtdb.europe-west1.firebasedatabase.app/users.json";
const API_CONTACTS =
  "https://join-388-default-rtdb.europe-west1.firebasedatabase.app/contact.json";

// Funktion, um Daten von der API zu holen
async function fetchData(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP-Fehler! Status: ${response.status}`);
    }
    const data = await response.json();
    // console.log("Daten von API:", data); // Debugging
    return data;
  } catch (error) {
    console.error("Fehler beim Laden der Daten:", error);
  }
}

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

function updateContactList(contactsDiv, contactDetailsDiv, combinedData) {
  if (combinedData.length > 0) {
    const sortedData = sortContactsByName(combinedData);
    renderSortedContacts(contactsDiv, contactDetailsDiv, sortedData);
  } else {
    contactsDiv.innerHTML = "<p>Keine Kontakte gefunden.</p>";
    contactDetailsDiv.innerHTML = "<p>Keine Details verfügbar.</p>";
  }
}

function sortContactsByName(contacts) {
  return contacts.sort((a, b) => a.name.localeCompare(b.name));
}

function handleRenderError(contactsDiv, contactDetailsDiv, error) {
  contactsDiv.innerHTML = `<p>Fehler beim Laden der Kontakte: ${error.message}</p>`;
  contactDetailsDiv.innerHTML = "<p>Fehler beim Laden der Details.</p>";
}

function combineContactsAndUsers(contacts, users) {
  const contactsArray = parseDataToArray(contacts);
  const usersArray = parseDataToArray(users);

  const combinedArray = [...contactsArray, ...usersArray];
  return removeDuplicatesByEmailAndId(combinedArray);
}

function parseDataToArray(data) {
  return data
    ? Object.entries(data).map(([id, item]) => ({ id, ...item }))
    : [];
}

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

function highlightSelectedContact(selectedDiv, contactData) {
  deselectAllContacts();
  selectContact(selectedDiv);
  updateContactDetails(contactData);
}

function deselectAllContacts() {
  document
    .querySelectorAll(".contact-item")
    .forEach((item) => item.classList.remove("selected"));
}

function selectContact(contactDiv) {
  contactDiv.classList.add("selected");
}

async function deleteContact(contactId, contactName) {
  const confirmationBox = createConfirmationBox(contactName);

  document.body.appendChild(confirmationBox);

  // Bestätigungshandling
  confirmationBox
    .querySelector(".confirm-btn")
    .addEventListener("click", async () => {
      await handleContactDeletion(contactId, confirmationBox);
    });

  // Abbrechen-Button
  confirmationBox.querySelector(".cancel-btn").addEventListener("click", () => {
    confirmationBox.remove(); // Schließe die Bestätigungsbox
  });
}

function createConfirmationBox(contactName) {
  const confirmationBox = document.createElement("div");
  confirmationBox.classList.add("confirmation-box");

  confirmationBox.innerHTML = `
      <div class="confirmation-content">
        <p>Sind Sie sicher, dass Sie den Kontakt <strong>${contactName}</strong> löschen möchten?</p>
        <div class="confirmation-buttons">
          <button class="confirm-btn">Ja</button>
          <button class="cancel-btn">Nein</button>
        </div>
      </div>
    `;
  return confirmationBox;
}

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

    // Entferne die Bestätigungsbox
    confirmationBox.remove();

    // Schließe das Bearbeitungs-Overlay (falls geöffnet)
    closeAddContactOverlay();

    // Aktualisiere die Kontaktliste
    renderContacts();
  } catch (error) {
    console.error("Fehler beim Löschen des Kontakts:", error);
  }
}

// Kontakte beim Laden der Seite rendern
document.addEventListener("DOMContentLoaded", renderContacts);

function closeAddContactOverlay() {
  const overlay = document.querySelector(".overlay");
  if (overlay) {
    overlay.remove();
  }
}

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

function validateContactForm() {
  const isNameValid = validateName();
  const isEmailValid = validateEmail();
  const isPhoneValid = validatePhone();
  return isNameValid && isEmailValid && isPhoneValid;
}

function gatherContactFormData() {
  const name = document.getElementById("contactName").value.trim();
  const email = document.getElementById("contactEmail").value.trim();
  const telefonnummer = document.getElementById("contactPhone").value.trim();

  return { name, email, telefonnummer };
}

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

function getEmailInputValue() {
  const emailInput = document.getElementById("contactEmail");
  return emailInput.value.trim();
}

function validateEmailFormat(emailValue, isEditMode, originalEmail) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailValue) return "";
  if (!emailRegex.test(emailValue))
    return "Bitte geben Sie eine gültige Email-Adresse ein.";
  if (isEditMode && emailValue === originalEmail) return "";
  return null;
}

async function isEmailAlreadyRegistered(emailValue, isEditMode, originalEmail) {
  if (isEditMode && emailValue === originalEmail) return false;
  const existingEmails = await fetchExistingEmails();
  return existingEmails.includes(emailValue);
}

function displayEmailError(message) {
  const errorEmail = document.getElementById("errorEmail");
  errorEmail.textContent = message;
}

function clearEmailError() {
  const errorEmail = document.getElementById("errorEmail");
  errorEmail.textContent = "";
}

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

async function fetchExistingEmails() {
  try {
    const [contacts, users] = await fetchContactsAndUsers();
    return combineAndDeduplicateEmails(contacts, users);
  } catch {
    return [];
  }
}

async function fetchContactsAndUsers() {
  const [contactsResponse, usersResponse] = await Promise.all([
    fetch(`${API_CONTACTS}`),
    fetch(`${apiURL}`),
  ]);

  const contactsData = await contactsResponse.json();
  const usersData = await usersResponse.json();

  return [contactsData, usersData];
}

function extractEmails(data, type = "contact") {
  if (!data) return [];
  return Object.values(data).map((item) =>
    type === "contact" ? item.email.trim() : item.email.trim()
  );
}

function combineAndDeduplicateEmails(contactsData, usersData) {
  const contactEmails = extractEmails(contactsData, "contact");
  const userEmails = extractEmails(usersData, "user");

  // Kombinieren und Duplikate entfernen
  return [...new Set([...contactEmails, ...userEmails])];
}

function toggleCreateButton() {
  const createButton = document.getElementById("createContactButton");
  const saveButton = document.querySelector(".save-btn");

  const isValid = validateFormInputs();

  updateButtonState(createButton, isValid);
  updateButtonState(saveButton, isValid);
}

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

function updateButtonState(button, isValid) {
  if (button) {
    button.disabled = !isValid;
  }
}

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

async function isFormValid() {
  const isNameValid = validateName();
  const email = document.getElementById("contactEmail").value.trim();
  const isEmailValid = await validateEmail(true, email);
  const isPhoneValid = validatePhone();

  return isNameValid && isEmailValid && isPhoneValid;
}

function getUpdatedContactData() {
  const name = document.getElementById("contactName").value.trim();
  const email = document.getElementById("contactEmail").value.trim();
  const phone = document.getElementById("contactPhone").value.trim();

  return { name, email, telefonnummer: phone };
}

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

async function updateUIAfterSave(updatedData) {
  await renderContacts();

  const selectedDiv = document.querySelector(`.contact-item.selected`);
  if (selectedDiv) {
    highlightSelectedContact(selectedDiv, updatedData);
  }
}

function handleSaveError(error) {
  console.error("Fehler beim Aktualisieren des Kontakts:", error);
}

function openContactOverlay(contactData = null) {
  const isEditMode = !!contactData;

  // Overlay-Container erstellen
  const overlay = document.createElement("div");
  overlay.classList.add("overlay");

  // Overlay-Inhalt aus Template-Funktion
  overlay.innerHTML = getContactOverlayTemplate(contactData, isEditMode);

  document.body.appendChild(overlay);

  // Event-Listener für Validierung und Button-Aktivierung
  attachOverlayEventListeners(isEditMode, contactData);
  toggleCreateButton();
}

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

function openAddContactOverlay() {
  openContactOverlay(); // Aufruf ohne Kontakt-Daten
}

function openEditContactOverlay(contactData) {
  openContactOverlay(contactData); // Aufruf mit Kontakt-Daten
}
