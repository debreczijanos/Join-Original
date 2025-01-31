/**
 * Aktiviert oder deaktiviert den Submit-Button basierend auf den Eingabefeldern und der Checkbox.
 */
function updateSubmitButton(allFilled) {
  const submitButton = document.getElementById("submitButton");
  const passwordInput = document.getElementById("passwordInput");
  const confirmPasswordInput = document.getElementById("confirmPasswordInput");
  const acceptTerms = document.getElementById("acceptTerms");

  // Button aktivieren NUR wenn alle Felder ausgefüllt sind, Passwörter stimmen UND Checkbox aktiviert ist
  const passwordsMatch =
    passwordInput.value === confirmPasswordInput.value &&
    passwordInput.value.length >= 6;

  const isCheckboxChecked = acceptTerms.checked;

  submitButton.disabled = !allFilled || !passwordsMatch || !isCheckboxChecked;
  submitButton.style.backgroundColor = !submitButton.disabled
    ? "#2a3647"
    : "#d1d1d1";
}
/**
 * Fügt Event-Listener zu allen relevanten Eingabefeldern hinzu,
 * um Fehler direkt zu entfernen und dynamisch zu validieren.
 */
function addInputListeners() {
  const inputs = document.querySelectorAll(".costume-input input");
  const errorElement = document.getElementById("error");

  inputs.forEach((input) => {
    // Entferne Fehler, wenn der Benutzer zu tippen beginnt
    input.addEventListener("input", () => {
      errorElement.textContent = "";
    });

    // Validierung beim Verlassen des Feldes
    input.addEventListener("blur", () => {
      checkInputs();
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

  // Fehler-Reset
  errorElement.textContent = "";
  errorElement.style.color = "red";

  // Validierung der Daten
  if (!validateFormData(formData)) {
    return;
  }

  // Daten an den Server senden
  try {
    const response = await sendDataToServer(formData);
    handleServerResponse(response);
  } catch (error) {
    errorElement.textContent =
      "Netzwerkfehler: Bitte überprüfen Sie Ihre Verbindung.";
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
 * Sendet die Formulardaten an den Server.
 *
 * @param {Object} formData - Die zu sendenden Daten.
 * @returns {Response|Object} Die Antwort des Servers oder ein Fehlerobjekt.
 */
async function sendDataToServer({ name, email, password, acceptTerms }) {
  const url =
    "https://join-388-default-rtdb.europe-west1.firebasedatabase.app/users.json";
  const errorElement = document.getElementById("error");

  try {
    const usersData = await fetchExistingUsers(url);

    if (isEmailAlreadyRegistered(usersData, email)) {
      errorElement.textContent =
        "Diese E-Mail-Adresse ist bereits registriert!";
      errorElement.style.color = "red";
      return { ok: false, reason: "email_exists" };
    }

    return await saveNewUser(url, { name, email, password, acceptTerms });
  } catch (error) {
    errorElement.textContent =
      "Ein Serverfehler ist aufgetreten. Bitte versuchen Sie es später erneut.";
    errorElement.style.color = "red";
    return { ok: false, reason: "server_error" };
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

/**
 * Navigiert zur Indexseite.
 */
function navigateToIndex() {
  window.location.href = "../index.html";
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("acceptTerms").addEventListener("change", () => {
    checkInputs(); // Überprüft erneut alle Eingaben und aktualisiert den Button-Status
  });
});
