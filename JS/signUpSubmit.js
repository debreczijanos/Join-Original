/**
 * Überprüft, ob alle erforderlichen Eingabefelder ausgefüllt sind,
 * und aktualisiert den Status des Submit-Buttons.
 */
function checkInputs() {
  const inputs = getAllInputs();
  const allFilled = validateInputs(inputs);

  updateSubmitButton(allFilled);
}

/**
 * Holt alle relevanten Eingabefelder aus dem Formular.
 *
 * @returns {NodeList} Eine Liste der Eingabefelder.
 */
function getAllInputs() {
  return document.querySelectorAll(
    '.sign-up-daten input[type="text"], .sign-up-daten input[type="email"], .sign-up-daten input[type="password"], .sign-up-daten input[type="checkbox"]'
  );
}

/**
 * Validiert, ob alle Eingabefelder ausgefüllt sind.
 *
 * @param {NodeList} inputs - Eine Liste der Eingabefelder.
 * @returns {boolean} True, wenn alle Felder ausgefüllt sind, sonst false.
 */
function validateInputs(inputs) {
  let allFilled = true;

  inputs.forEach((input) => {
    if (isInputEmpty(input)) {
      allFilled = false;
    }
  });

  return allFilled;
}

/**
 * Überprüft, ob ein Eingabefeld leer ist.
 *
 * @param {HTMLElement} input - Das zu prüfende Eingabefeld.
 * @returns {boolean} True, wenn das Feld leer ist, sonst false.
 */
function isInputEmpty(input) {
  return (
    (input.type !== "checkbox" && input.value.trim() === "") ||
    (input.type === "checkbox" && !input.checked)
  );
}

/**
 * Aktiviert oder deaktiviert den Submit-Button basierend auf dem Status der Eingabefelder.
 *
 * @param {boolean} allFilled - Gibt an, ob alle Felder ausgefüllt sind.
 */
function updateSubmitButton(allFilled) {
  const submitButton = document.getElementById("submitButton");
  submitButton.disabled = !allFilled;
  submitButton.style.backgroundColor = allFilled ? "#2a3647" : "#d1d1d1";
}

/**
 * Überprüft, ob eine E-Mail-Adresse gültig ist.
 *
 * @param {string} email - Die zu prüfende E-Mail-Adresse.
 * @returns {boolean} True, wenn die E-Mail-Adresse gültig ist, sonst false.
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Fügt Event-Listener zu allen relevanten Eingabefeldern hinzu,
 * um Fehlermeldungen dynamisch zu entfernen.
 */
function addInputListeners() {
  const inputs = document.querySelectorAll(".costume-input input");
  const errorElement = document.getElementById("error");

  inputs.forEach((input) => {
    input.addEventListener("input", () => {
      errorElement.textContent = ""; // Fehlermeldung entfernen
    });
  });
}

/**
 * Behandelt das Absenden des Formulars, validiert die Daten und sendet sie an den Server.
 *
 * @param {Event} event - Das Submit-Event.
 */
async function handleSubmit(event) {
  event.preventDefault();

  const errorElement = document.getElementById("error");
  const formData = collectFormData();

  // Validierung der Daten
  if (!validateFormData(formData)) {
    errorElement.textContent = "Die Passwörter stimmen nicht überein.";
    errorElement.style.color = "red";
    return;
  }

  // Daten an den Server senden
  try {
    const response = await sendDataToServer(formData);
    handleServerResponse(response);
  } catch (error) {
    errorElement.textContent =
      "Netzwerkfehler: Bitte überprüfen Sie Ihre Verbindung.";
    errorElement.style.color = "red";
  }
}

/**
 * Sammelt die Daten aus den Eingabefeldern.
 *
 * @returns {Object} Die gesammelten Formulardaten.
 */
function collectFormData() {
  return {
    name: document.getElementById("nameInput").value.trim(),
    email: document.getElementById("emailInput").value.trim(),
    password: document.getElementById("passwordInput").value.trim(),
    confirmPassword: document
      .getElementById("confirmPasswordInput")
      .value.trim(),
    acceptTerms: document.getElementById("acceptTerms").checked,
  };
}

/**
 * Validiert die Formulardaten.
 *
 * @param {Object} formData - Die zu validierenden Formulardaten.
 * @returns {boolean} Ob die Formulardaten gültig sind.
 */
function validateFormData(formData) {
  const errorElement = document.getElementById("error");

  if (
    !formData.name ||
    !formData.email ||
    !formData.password ||
    !formData.confirmPassword ||
    !formData.acceptTerms
  ) {
    errorElement.textContent = "Bitte füllen Sie alle Felder korrekt aus.";
    errorElement.style.color = "red";
    return false;
  }

  if (formData.password !== formData.confirmPassword) {
    errorElement.textContent = "Die Passwörter stimmen nicht überein.";
    errorElement.style.color = "red";
    return false;
  }

  return true;
}

/**
 * Sendet die Formulardaten an den Server.
 *
 * @param {Object} formData - Die zu sendenden Daten.
 * @returns {Response|Object} Die Antwort des Servers oder ein Fehlerobjekt.
 */
async function sendDataToServer({ name, email, password, acceptTerms }) {
  const url =
    "https://join-388-default-rtdb.europe-west1.firebasedatabase.app/users.json";

  try {
    const usersData = await fetchExistingUsers(url);

    if (isEmailAlreadyRegistered(usersData, email)) {
      return { ok: false, reason: "email_exists" };
    }

    const response = await saveNewUser(url, {
      name,
      email,
      password,
      acceptTerms,
    });
    return response;
  } catch (error) {
    return handleServerError(error);
  }
}

/**
 * Ruft bestehende Benutzerdaten vom Server ab.
 *
 * @param {string} url - Die URL der API.
 * @returns {Object} Die Benutzerdaten.
 */
async function fetchExistingUsers(url) {
  const response = await fetch(url);
  return response.json();
}

/**
 * Überprüft, ob eine E-Mail-Adresse bereits registriert ist.
 *
 * @param {Object} usersData - Die bestehenden Benutzerdaten.
 * @param {string} email - Die zu prüfende E-Mail-Adresse.
 * @returns {boolean} True, wenn die E-Mail-Adresse registriert ist, sonst false.
 */
function isEmailAlreadyRegistered(usersData, email) {
  return usersData
    ? Object.values(usersData).some((user) => user.email === email)
    : false;
}

/**
 * Speichert einen neuen Benutzer auf dem Server.
 *
 * @param {string} url - Die URL der API.
 * @param {Object} userData - Die zu speichernden Benutzerdaten.
 * @returns {Response} Die Antwort des Servers.
 */
async function saveNewUser(url, userData) {
  return await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  });
}

/**
 * Behandelt Serverfehler.
 *
 * @param {Error} error - Der aufgetretene Fehler.
 * @returns {Object} Ein Fehlerobjekt mit der Ursache.
 */
function handleServerError(error) {
  console.error("Fehler beim Senden der Anfrage:", error);
  return { ok: false, reason: "server_error" };
}

/**
 * Behandelt die Antwort des Servers.
 *
 * @param {Response|Object} response - Die Antwort des Servers.
 */
function handleServerResponse(response) {
  const errorElement = document.getElementById("error");

  if (response && response.ok) {
    displaySuccessMessage();
  } else if (response.reason === "email_exists") {
    errorElement.textContent = "Diese E-Mail-Adresse ist bereits registriert!";
    errorElement.style.color = "red";
  } else if (response.reason === "server_error") {
    errorElement.textContent =
      "Ein Serverfehler ist aufgetreten. Bitte versuchen Sie es später erneut.";
    errorElement.style.color = "red";
  } else {
    errorElement.textContent = "Ein unbekannter Fehler ist aufgetreten.";
    errorElement.style.color = "red";
  }
}

/**
 * Zeigt eine Erfolgsnachricht an und leitet den Benutzer weiter.
 */
function displaySuccessMessage() {
  document.querySelector(".center").style.display = "none";
  const successMessage = document.getElementById("successMessage");

  successMessage.style.display = "flex";
  successMessage.style.animation = "slideUp 1s ease-out forwards";

  setTimeout(() => (window.location.href = "../index.html"), 3000);
}

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Event-Listener beim Laden der Seite hinzufügen
 */
document.addEventListener("DOMContentLoaded", () => {
  const inputs = document.querySelectorAll(
    '.sign-up-daten input[type="text"], .sign-up-daten input[type="email"], .sign-up-daten input[type="password"], .sign-up-daten input[type="checkbox"]'
  );
  const errorElement = document.getElementById("error");

  inputs.forEach((input) => {
    input.addEventListener("input", () => {
      errorElement.textContent = "";
    });

    input.addEventListener("change", () => {
      errorElement.textContent = "";
    });
  });

  inputs.forEach((input) => {
    input.addEventListener("input", checkInputs);
    input.addEventListener("change", checkInputs);
  });
});

/**
 * Navigiert zur Indexseite.
 */
function navigateToIndex() {
  window.location.href = "../index.html";
}
