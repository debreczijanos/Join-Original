/**
 * Hides the content area and displays the contact list for mobile view.
 */
function showContactMobile() {
  document.getElementById("content-area").classList.add("dNone");
  document.getElementById("content-area").classList.remove("d-Block");
  document.getElementById("mycontacts").classList.remove("displayNone");
}

/**
 * Checks the screen size to determine and adjust element visibility for responsive design.
 */
function checkScreenSize() {
  const mobileWidth = 950;
  if (window.matchMedia(`(max-width: ${mobileWidth}px)`).matches) {
    document
      .getElementById("responsiveContactBackButton")
      .classList.remove("displayNone");
    document.getElementById("mycontacts").classList.add("displayNone");
    document.getElementById("content-area").classList.remove("dNone");
    document.getElementById("content-area").classList.add("d-Block");
  }
}

window.addEventListener("resize", concealMobileElements);

/**
 * Toggles the visibility of the responsive back button based on window width.
 */
function concealMobileElements() {
  if (window.innerWidth > 800) {
    document
      .getElementById("responsiveContactBackButton")
      .classList.add("displayNone");
  } else if (window.innerWidth < 800) {
    document
      .getElementById("responsiveContactBackButton")
      .classList.remove("displayNone");
  }
}
/**
 * Toggles the display state of the edit/delete menu.
 */

function showEditandDelete() {
  var menu = document.getElementById("editDeleteMenu");
  if (menu.style.display === "none" || menu.style.display === "") {
    menu.style.display = "block";
  } else {
    menu.style.display = "none";
  }
}

/**
 * Hides the edit/delete menu when a click is detected outside of it.
 *
 * @param {Event} event - The click event object.
 */
window.onclick = function (event) {
  var menu = document.getElementById("editDeleteMenu");
  if (menu) {
    if (!event.target.matches("#options_edit_delete")) {
      {
        menu.style.display = "none";
      }
    }
  }
};

/**
 * Displays a modal with the specified elements and animations.
 *
 * @param {HTMLElement} PopUpBgElement - The background element for the modal.
 * @param {HTMLElement} show - The content element to display.
 * @param {HTMLElement} header - The header element to animate.
 */
function showModal(PopUpBgElement, show, header) {
  PopUpBgElement.classList.remove("displayNone", "hide");
  PopUpBgElement.classList.add("show");
  show.classList.remove("slide-out");
  show.classList.add("slide-in");
  // header.classList.add("stretch");
}

/**
 * Hides a modal by reversing its animations.
 *
 * @param {HTMLElement} bgPopUp - The background element for the modal.
 * @param {HTMLElement} popUp - The content element to hide.
 * @param {HTMLElement} header - The header element to animate.
 */
function hideModal(bgPopUp, popUp, header) {
  popUp.classList.remove("slide-in");
  popUp.classList.add("slide-out");
  bgPopUp.classList.remove("show");
  bgPopUp.classList.add("hide");
  setTimeout(() => {
    bgPopUp.classList.add("displayNone");
  }, 500);
  // header.classList.remove("stretch");
}

/**
 * Displays an error message for a specific element.
 *
 * @param {string} errorElementId - The ID of the error message element.
 * @param {string} message - The message to display.
 */
function showErrorMessage(errorElementId, message) {
  const errorElement = document.getElementById(errorElementId);
  errorElement.innerText = message;
  errorElement.style.color = "red";
  errorElement.style.display = "block";
}

/**
 * Hides an error message for a specific element.
 *
 * @param {string} errorElementId - The ID of the error message element.
 */
function hideErrorMessage(errorElementId) {
  const errorElement = document.getElementById(errorElementId);
  errorElement.innerText = "";
  errorElement.style.display = "none"; // Versteckt die Fehlermeldung
}

/**
 * Resets all displayed error messages.
 */
function resetErrorMessages() {
  const errorElements = document.querySelectorAll(".error-message");
  errorElements.forEach((element) => {
    element.innerText = "";
    element.style.display = "none";
  });
}

function checkFormFields(formType = "add") {
  const nameField = document
    .getElementById(`${formType === "edit" ? "editName" : "name"}`)
    .value.trim();
  const emailField = document
    .getElementById(`${formType === "edit" ? "editEmail" : "email"}`)
    .value.trim();
  const telField = document
    .getElementById(`${formType === "edit" ? "editTel" : "tel"}`)
    .value.trim();
  const submitButton = document.getElementById(
    `${formType === "edit" ? "editSubmit" : "createSubmit"}`
  );

  // Dynamisch Fehlermeldungen prüfen
  const nameError = document
    .getElementById(`${formType === "edit" ? "editNameError" : "nameError"}`)
    .innerText.trim();
  const emailError = document
    .getElementById(`${formType === "edit" ? "editEmailError" : "emailError"}`)
    .innerText.trim();
  const telError = document
    .getElementById(`${formType === "edit" ? "editTelError" : "telError"}`)
    .innerText.trim();

  submitButton.disabled =
    !(nameField && emailField && telField) ||
    nameError ||
    emailError ||
    telError;
}

/**
 * Checks if all fields in the edit form contain values and updates the state of the submit button.
 */
function checkFormFields() {
  const field1 = document.getElementById("editName").value.trim();
  const field2 = document.getElementById("editEmail").value.trim();
  const field3 = document.getElementById("editTel").value.trim();
  const submitButton = document.getElementById("editSubmit");
  submitButton.disabled = !(field1 && field2 && field3);
}

/**
 * Checks if all fields in the create contact form contain values and updates the state of the submit button.
 */
function checkFormFields2() {
  const field1 = document.getElementById("name").value.trim();
  const field2 = document.getElementById("email").value.trim();
  const field3 = document.getElementById("tel").value.trim();

  // Überprüfe, ob alle Fehlermeldungen leer sind
  const nameError = document.getElementById("nameError").innerText.trim();
  const emailError = document.getElementById("emailError").innerText.trim();
  const telError = document.getElementById("telError").innerText.trim();

  const submitButton = document.getElementById("createSubmit");

  // Button aktivieren, wenn alle Felder gefüllt sind und keine Fehlermeldungen vorhanden sind
  submitButton.disabled =
    !(field1 && field2 && field3) || nameError || emailError || telError;
}

/**
 * Resets all displayed error messages for edit form fields.
 */
// function resetEditErrorMessages() {
//   const errorElements = document.querySelectorAll(".error-message");
//   errorElements.forEach((element) => {
//     element.innerText = "";
//   });
// }

/**
 * Creates a new contact.
 *
 * @param {Event} event - The form submit event.
 */
function createNewContact(event) {
  event.preventDefault();
  let name = document.getElementById("name").value;
  let email = document.getElementById("email").value;
  let tel = document.getElementById("tel").value;
  resetErrorMessages();
  let isValid = true;
  pushCreateNewContact(name, email, tel, isValid);
}

/**
 * This function adds contact to the list if valid.
 *
 * @param {*} name
 * @param {*} email
 * @param {*} tel
 * @param {*} isValid
 */

/**
 * Prevents form submission for specified form types.
 *
 * @param {string} key - The form type key ('new' or 'update').
 */
function preventFormSubmit(key) {
  let target;
  if (key == "new") {
    target = "addContactForm";
  } else if (key == "update") {
    target = "editContactForm";
  }
  document.getElementById(target),
    addEventListener("submit", function (event) {
      event.preventDefault();
    });
}

function validateEditField(fieldId) {
  const value = document.getElementById(fieldId).value.trim();
  let errorElementId;
  let errorMessage = "";

  // Dynamisch zugehörige Fehlermeldung-ID ermitteln
  if (fieldId.startsWith("edit")) {
    errorElementId = fieldId.replace("edit", "edit") + "Error"; // Beispiel: editName → editNameError
  } else {
    errorElementId = fieldId + "Error"; // Beispiel: name → nameError
  }

  switch (fieldId) {
    case "name":
    case "editName":
      if (/[^a-zA-Z\s]/.test(value)) {
        errorMessage = "Name darf keine Zahlen oder Sonderzeichen enthalten.";
      }
      break;

    case "email":
    case "editEmail":
      if (!/\S+@\S+\.\S+/.test(value)) {
        errorMessage = "Bitte eine gültige E-Mail-Adresse eingeben.";
      } else if (value === lastInvalidEmail) {
        errorMessage = "Diese E-Mail-Adresse ist bereits registriert.";
      }
      break;

    case "tel":
    case "editTel":
      if (!/^\+?[0-9]*$/.test(value)) {
        errorMessage =
          "Telefonnummer darf nur Zahlen enthalten und optional ein '+' am Anfang.";
      }
      break;

    default:
      console.warn(`Unbekanntes Feld: "${fieldId}"`);
      return false;
  }

  if (errorMessage) {
    displayErrorMessage(errorElementId, errorMessage);
    return false; // Eingabe ist ungültig
  } else {
    hideErrorMessage(errorElementId);
    return true; // Eingabe ist gültig
  }
}

/**
 * Zeigt eine Fehlermeldung für ein spezifisches Element an.
 *
 * @param {string} errorElementId - Die ID des Fehlermeldungselements.
 * @param {string} errorMessage - Die anzuzeigende Fehlermeldung.
 */
function displayErrorMessage(errorElementId, errorMessage) {
  const errorElement = document.getElementById(errorElementId);
  errorElement.innerText = errorMessage;
  errorElement.style.display = "block"; // Zeigt die Fehlermeldung an
}
let lastInvalidEmail = ""; // Speichert die letzte ungültige oder existierende E-Mail

async function validateRealTimeEmailInput() {
  const emailInput = document.getElementById("email");
  const email = emailInput.value.trim();
  const emailError = document.getElementById("emailError");

  // Überprüfe die Struktur der E-Mail
  if (!/\S+@\S+\.\S+/.test(email)) {
    displayErrorMessage(
      "emailError",
      "Bitte eine gültige E-Mail-Adresse eingeben."
    );
    lastInvalidEmail = email; // Speichere die ungültige E-Mail
    return;
  }

  const API_CONTACTS =
    "https://join-388-default-rtdb.europe-west1.firebasedatabase.app/contact.json";
  const API_USERS =
    "https://join-388-default-rtdb.europe-west1.firebasedatabase.app/users.json";

  try {
    const duplicate = await checkForDuplicateContact(
      API_CONTACTS,
      API_USERS,
      email,
      ""
    );
    if (duplicate) {
      displayErrorMessage(
        "emailError",
        "Diese E-Mail-Adresse ist bereits registriert."
      );
      lastInvalidEmail = email; // Speichere die bereits existierende E-Mail
    } else {
      hideErrorMessage("emailError");
      lastInvalidEmail = ""; // Zurücksetzen, wenn keine Duplikate gefunden wurden
    }
  } catch (error) {
    console.error("Fehler beim Überprüfen der E-Mail:", error);
  }
}

async function validateRealTimeTelInput() {
  const tel = document.getElementById("tel").value.trim();
  const telError = document.getElementById("telError");

  if (!/^\+?[0-9]*$/.test(tel)) {
    displayErrorMessage(
      "telError",
      "Telefonnummer darf nur Zahlen enthalten und optional ein '+' am Anfang."
    );
    return;
  }

  hideErrorMessage("telError");
}

// function isEmailOrPhoneRegistered(usersData, email, tel) {
//   return usersData
//     ? Object.values(usersData).some(
//         (user) => user.email === email || user.telefonnummer === tel
//       )
//     : false;
// }

function isEmailOrPhoneRegistered(data, email, tel) {
  if (!data) return false;

  // Iteriere durch alle Einträge und überprüfe auf Duplikate
  return Object.values(data).some(
    (item) => item.email === email || item.telefonnummer === tel
  );
}

// Hilfsfunktion: Holt bestehende Nutzer/Kontakte von der Datenbank
async function fetchExistingUsers(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Fehler beim Abrufen der Daten.");
  }
  return response.json();
}

async function pushCreateNewContact(name, email, tel, isValid) {
  if (!isValid) return;

  const API_CONTACTS =
    "https://join-388-default-rtdb.europe-west1.firebasedatabase.app/contact.json";
  const API_USERS =
    "https://join-388-default-rtdb.europe-west1.firebasedatabase.app/users.json";

  try {
    // Überprüfe die Duplikate
    const duplicate = await checkForDuplicateContact(
      API_CONTACTS,
      API_USERS,
      email,
      tel
    );
    if (duplicate) {
      alert("Die E-Mail-Adresse oder Telefonnummer ist bereits registriert!");
      return;
    }

    // Speichere neuen Kontakt, falls keine Duplikate gefunden wurden
    saveNewContact(name, email, tel);
  } catch (error) {
    console.error("Fehler beim Erstellen des Kontakts:", error);
    alert("Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.");
  }
}

async function checkForDuplicateContact(API_CONTACTS, API_USERS, email, tel) {
  // Daten von beiden APIs abrufen
  const [contacts, users] = await Promise.all([
    fetchExistingUsers(API_CONTACTS),
    fetchExistingUsers(API_USERS),
  ]);

  // Überprüfe auf E-Mail oder Telefonnummer in beiden Datenquellen
  const isDuplicate =
    isEmailOrPhoneRegistered(contacts, email, tel) ||
    isEmailOrPhoneRegistered(users, email, tel);
  return isDuplicate;
}

function saveNewContact(name, email, tel) {
  const button = document.getElementById("createSubmit");
  button.disabled = true;
  const nextColor = selectNextColor();
  contactList.push({
    name,
    email,
    telefonnummer: tel,
    color: nextColor,
  });
  submitContact("contact");
  openClosePopUp("close");

  document.getElementById("name").value = "";
  document.getElementById("email").value = "";
  document.getElementById("tel").value = "";
}

/**
 * Fetches data from the server and updates `storedData`.
 * Displays contacts and updates the color counter if data is retrieved successfully.
 *
 * @async
 * @function
 */
async function fetchData() {
  storedData = [];
  try {
    let returnValue = await fetch(BASE_URL + ".json");
    let returnValueAsJson = await returnValue.json();
    let info = returnValueAsJson.contact;
    storedData.push(returnValueAsJson.contact);
    displayContacts(info);
    let colorCounterResponse = await fetch(BASE_URL + "colorIndex.json");
    let colorCounterData = await colorCounterResponse.json();
    if (colorCounterData !== null) {
      colorCounter = colorCounterData;
    }
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

/**
 * Removes a contact from the server and updates the contact list.
 *
 * @async
 * @param {string} [path='contact'] - The endpoint path for deleting the contact.
 * @param {string} id - The ID of the contact to remove.
 */
let keyForEdit;
async function removeContact(path = "contact", id) {
  if (!id) {
    console.error("Keine gültige ID für den Kontakt angegeben.");
    return;
  }

  const url = `${BASE_URL}${path}/${encodeURIComponent(id)}.json`;

  try {
    let response = await fetch(url, {
      method: "DELETE",
      headers: {
        "content-type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Löschfehler des Kontakts");
    }

    await fetchData();
    clearDetailedView();
    currentEditKey = null;

    console.log(`Kontakt mit ID ${id} wurde erfolgreich gelöscht.`);
  } catch (error) {
    console.error("Löschfehler des Kontakts:", error.message);
  }
}

/**
 * Submits contact data to the server.
 *
 * @async
 * @param {string} path - The server endpoint path for submission.
 */
async function submitContact(path) {
  for (const element of contactList) {
    selectedContact = element;
    saveHighlight();
    const response = await fetch(`${BASE_URL}${path}.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(element),
    });
    response.ok
      ? updateColorCounter()
      : console.error("Failed to save contact");
  }
  fetchData();
}

/**
 * Applies highlight to a newly added contact.
 */
function applyNewContactHighlight() {
  let serializedContact = localStorage.getItem("highlightKey");
  if (serializedContact === null) {
    return;
  } else selectedContact = JSON.parse(serializedContact);
  currentEditKey = findContactInStoredData();
  showDetailedContact(currentEditKey);
  localStorage.removeItem("highlightKey");
}

/**
 * Opens or closes a popup window based on the provided parameter.
 *
 * @param {string} param - The action ('open' or 'close') to perform.
 * @param {boolean} key - Whether to validate a specific popup type.
 */
function openClosePopUp(param, key) {
  concealMobileElements();
  let target = validatePopUp(key);
  let bgPopUp = document.getElementById(target);
  let popUp = bgPopUp.querySelector(".popUp");
  let header = document.getElementById("header");

  if (param === "open") {
    showModal(bgPopUp, popUp, header);
  } else if (param === "close") {
    hideModal(bgPopUp, popUp, header);

    // Leere die Eingabefelder beim Schließen
    clearInputFields();
  } else {
    param.stopPropagation();
  }
}

/**
 * Leert alle Eingabefelder im Formular.
 */
function clearInputFields() {
  document.getElementById("name").value = "";
  document.getElementById("email").value = "";
  document.getElementById("tel").value = "";

  // Setze eventuelle Fehlermeldungen zurück
  resetErrorMessages();
}
