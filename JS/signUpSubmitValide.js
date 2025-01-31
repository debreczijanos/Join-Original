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
 * Überprüft, ob der Name gültig ist (nur Buchstaben, mindestens 2 Zeichen)
 */
function isValidName(name) {
  const nameRegex = /^[a-zA-ZäöüÄÖÜß\s-]{2,}$/;
  return nameRegex.test(name);
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
 * Validiert die Formulardaten.
 *
 * @param {Object} formData - Die zu validierenden Formulardaten.
 * @returns {boolean} Ob die Formulardaten gültig sind.
 */
function validateFormData(formData) {
  const errorElement = document.getElementById("error");
  let errorMessages = [];

  if (!isValidName(formData.name)) {
    errorMessages.push(
      "Bitte geben Sie einen gültigen Namen ein (nur Buchstaben, mindestens 2 Zeichen)."
    );
  }

  if (!isValidEmail(formData.email)) {
    errorMessages.push("Bitte geben Sie eine gültige E-Mail-Adresse ein.");
  }

  if (formData.password.length < 6) {
    errorMessages.push("Das Passwort muss mindestens 6 Zeichen lang sein.");
  }

  if (formData.password !== formData.confirmPassword) {
    errorMessages.push("Die Passwörter stimmen nicht überein.");
  }

  if (!formData.acceptTerms) {
    errorMessages.push("Sie müssen die Datenschutzrichtlinie akzeptieren.");
  }

  // Falls es Fehler gibt, zeigen wir sie an und geben false zurück
  if (errorMessages.length > 0) {
    errorElement.innerHTML = errorMessages.join("<br>"); // Alle Fehler untereinander anzeigen
    return false;
  }

  errorElement.textContent = ""; // Wenn alles passt, Fehlermeldung entfernen
  return true;
}

/**
 * Fügt Event-Listener zu allen Eingabefeldern hinzu, um Fehler direkt zu validieren.
 */
function addLiveValidationListeners() {
  document
    .getElementById("nameInput")
    .addEventListener("blur", validateNameField);
  document
    .getElementById("emailInput")
    .addEventListener("blur", validateEmailField);
  document
    .getElementById("passwordInput")
    .addEventListener("blur", validatePasswordField);
  document
    .getElementById("confirmPasswordInput")
    .addEventListener("blur", validatePasswordField);
}

/**
 * Sperrt oder entsperrt die Felder basierend auf Fehlern in Name oder E-Mail.
 */
/**
 * Sperrt oder entsperrt die Felder basierend auf Fehlern in Name, E-Mail oder Passwort.
 */
function toggleFieldLock(nameError, emailError, passwordError) {
  const emailInput = document.getElementById("emailInput");
  const passwordInputs = document.querySelectorAll(
    "#passwordInput, #confirmPasswordInput"
  );
  const acceptTerms = document.getElementById("acceptTerms");

  // Falls der Name falsch ist, ALLES sperren (inkl. E-Mail)
  emailInput.disabled = nameError;
  passwordInputs.forEach((input) => (input.disabled = nameError || emailError));
  acceptTerms.disabled = nameError || emailError || passwordError; // Checkbox bleibt gesperrt, wenn Passwort falsch ist
}

/**
 * Validiert das Namensfeld und sperrt die anderen Felder bei einem Fehler.
 */
function validateNameField() {
  const nameInput = document.getElementById("nameInput");
  const errorElement = document.getElementById("error");

  let nameError = !isValidName(nameInput.value.trim());

  if (nameError) {
    errorElement.textContent =
      "Bitte geben Sie einen gültigen Namen ein (nur Buchstaben, mindestens 2 Zeichen).";
  } else {
    errorElement.textContent = "";
  }

  // Falls Name falsch ist → ALLE Felder sperren
  toggleFieldLock(nameError, false);
}

/**
 * Validiert das E-Mail-Feld in Echtzeit und sperrt die anderen Felder bei einem Fehler.
 */
async function validateEmailField() {
  const emailInput = document.getElementById("emailInput");
  const errorElement = document.getElementById("error");
  const email = emailInput.value.trim();

  let emailError = !isValidEmail(email);

  if (emailError) {
    errorElement.textContent =
      "Bitte geben Sie eine gültige E-Mail-Adresse ein.";
    toggleFieldLock(false, true);
    return;
  }

  // Backend-Check, ob die E-Mail bereits existiert
  try {
    const url =
      "https://join-388-default-rtdb.europe-west1.firebasedatabase.app/users.json";
    const usersData = await fetchExistingUsers(url);

    if (isEmailAlreadyRegistered(usersData, email)) {
      errorElement.textContent =
        "Diese E-Mail-Adresse ist bereits registriert!";
      toggleFieldLock(false, true);
      return;
    } else {
      errorElement.textContent = "";
      toggleFieldLock(false, false);
    }
  } catch (error) {
    console.error("Fehler bei der Serverüberprüfung:", error);
    errorElement.textContent =
      "Serverfehler: Bitte versuchen Sie es später erneut.";
    toggleFieldLock(false, true);
  }
}

/**
 * Fügt Event-Listener zu den Feldern hinzu, um sie direkt nach der Eingabe zu validieren.
 */
function addLiveValidationListeners() {
  document
    .getElementById("nameInput")
    .addEventListener("blur", validateNameField);
  document
    .getElementById("emailInput")
    .addEventListener("blur", validateEmailField);
  document
    .getElementById("passwordInput")
    .addEventListener("input", validatePasswordField);
  document
    .getElementById("confirmPasswordInput")
    .addEventListener("input", validatePasswordField);
}

/**
 * Validiert die Passwörter und stellt sicher, dass die Fehlermeldung bleibt,
 * bis das Problem wirklich behoben ist.
 */
function validatePasswordField() {
  const passwordInput = document.getElementById("passwordInput");
  const confirmPasswordInput = document.getElementById("confirmPasswordInput");
  const errorElement = document.getElementById("error");

  let passwordError = false;

  // Falls eines der Felder leer ist, keine Validierung, aber Fehlermeldung bleibt sichtbar
  if (
    passwordInput.value.trim() === "" ||
    confirmPasswordInput.value.trim() === ""
  ) {
    passwordError = true;
    errorElement.textContent = "Beide Passwortfelder müssen ausgefüllt sein.";
  } else if (passwordInput.value.length < 6) {
    passwordError = true;
    errorElement.textContent =
      "Das Passwort muss mindestens 6 Zeichen lang sein.";
  } else if (passwordInput.value !== confirmPasswordInput.value) {
    passwordError = true;
    errorElement.textContent = "Die Passwörter stimmen nicht überein.";
  }

  // Nur wenn KEIN Fehler existiert, die Fehlermeldung entfernen
  if (!passwordError) {
    errorElement.textContent = "";
  }

  // Falls Name oder E-Mail falsch ist, bleiben sie gesperrt
  let nameError = !isValidName(
    document.getElementById("nameInput").value.trim()
  );
  let emailError = !isValidEmail(
    document.getElementById("emailInput").value.trim()
  );

  toggleFieldLock(nameError, emailError, passwordError);
  updateSubmitButton(!nameError && !emailError && !passwordError);
}

/**
 * Löscht die Fehlermeldung, wenn keine Fehler mehr da sind.
 */
function clearError() {
  const errorElement = document.getElementById("error");
  errorElement.textContent = "";
}

// Event-Listener beim Laden der Seite hinzufügen
document.addEventListener("DOMContentLoaded", () => {
  addLiveValidationListeners();
});
