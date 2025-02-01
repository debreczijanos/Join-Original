/**
 * Startet die Animation des Hintergrunds und des Logos.
 */
function startAnimation() {
  let background = document.getElementById("backgroundAnimation");

  fadeOutBackground(background);
  hideBackgroundWithDelay(background);
}

/**
 * Blendet den Hintergrund langsam aus.
 *
 * @param {HTMLElement} background - Das Hintergrund-Element.
 */
function fadeOutBackground(background) {
  setTimeout(() => {
    document.getElementById("logoAnimation").classList.add("end-position-logo");
    background.style.opacity = 0;
  }, 500);
}

/**
 * Versteckt den Hintergrund nach einer Verzögerung.
 *
 * @param {HTMLElement} background - Das Hintergrund-Element.
 */
function hideBackgroundWithDelay(background) {
  setTimeout(() => {
    background.classList.add("d-none");
  }, 1500);
}

/**
 * Behandelt den Login-Vorgang und zeigt spezifische Fehlermeldungen an.
 *
 * @param {Event} event - Das Login-Event.
 */
function handleLogin(event) {
  event.preventDefault();

  const { email, password } = getInputValues();
  const rememberMe = document.getElementById("checkbox").checked;

  fetchUserData()
    .then((usersData) => {
      const { status, userName } = validateUser(usersData, email, password);

      if (status === "success") {
        if (rememberMe) {
          saveCredentialsToLocalStorage(email, password);
        } else {
          clearCredentialsFromLocalStorage();
        }
        loginUser(userName);
      } else {
        showError(status);
      }
    })
    .catch(handleLoginError);
}

/**
 * Holt die Eingabewerte für E-Mail und Passwort aus dem Formular.
 *
 * @returns {Object} Ein Objekt mit `email` und `password`.
 */
function getInputValues() {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  return { email, password };
}

/**
 * Ruft die Benutzerdaten aus der Datenbank ab.
 *
 * @returns {Promise<Object>} Die Benutzerdaten als JSON-Objekt.
 */
async function fetchUserData() {
  const response = await fetch(
    "https://join-388-default-rtdb.europe-west1.firebasedatabase.app/users.json"
  );
  return response.json();
}

/**
 * Validiert die Benutzerdaten und gibt spezifische Fehlermeldungen zurück.
 *
 * @param {Object} usersData - Die Benutzerdaten.
 * @param {string} email - Die eingegebene E-Mail-Adresse.
 * @param {string} password - Das eingegebene Passwort.
 * @returns {Object} Ein Objekt mit `status` (string) und `userName` (string oder null).
 */
function validateUser(usersData, email, password) {
  // Regulärer Ausdruck für eine gültige E-Mail-Adresse (zusätzliche Validierung)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { status: "invalidEmail", userName: null };
  }

  let userFound = false;
  let correctPassword = false;
  let userName = "";

  for (const userId in usersData) {
    const user = usersData[userId];

    if (user.email === email) {
      userFound = true;
      if (user.password === password) {
        correctPassword = true;
        userName = user.name;
      }
      break;
    }
  }

  if (!userFound) {
    return { status: "emailNotRegistered", userName: null };
  } else if (!correctPassword) {
    return { status: "wrongPassword", userName: null };
  }

  return { status: "success", userName };
}

/**
 * Loggt den Benutzer ein und speichert den Benutzernamen im LocalStorage.
 *
 * @param {string} userName - Der Benutzername.
 */
function loginUser(userName) {
  localStorage.setItem("userName", userName);
  window.location.href = "./html/summary.html";
}

/**
 * Zeigt eine Fehlermeldung bei falschen Anmeldedaten an.
 */
function showError() {
  document.querySelector(".error").style.display = "block";
}

/**
 * Behandelt Fehler, die beim Abrufen der Benutzerdaten auftreten.
 *
 * @param {Error} error - Der Fehler.
 */
function handleLoginError(error) {
  console.error("Fehler beim Abrufen der Benutzerdaten:", error);
  alert("Ein Fehler ist aufgetreten. Bitte versuche es später erneut.");
}

/**
 * Behandelt den Login als Gast.
 */
function handleGuestLogin() {
  localStorage.setItem("userName", "Guest");
  window.location.href = "./html/summary.html";
}

/**
 * Speichert die Anmeldedaten im LocalStorage.
 *
 * @param {string} email - Die E-Mail-Adresse.
 * @param {string} password - Das Passwort.
 */
function saveCredentialsToLocalStorage(email, password) {
  localStorage.setItem("savedEmail", email);
  localStorage.setItem("savedPassword", password);
}

/**
 * Entfernt die gespeicherten Anmeldedaten aus dem LocalStorage.
 */
function clearCredentialsFromLocalStorage() {
  localStorage.removeItem("savedEmail");
  localStorage.removeItem("savedPassword");
}

/**
 * Event-Listener für das Laden der Seite
 */
document.addEventListener("DOMContentLoaded", () => {
  const savedEmail = localStorage.getItem("savedEmail");
  const savedPassword = localStorage.getItem("savedPassword");
  const rememberMeCheckbox = document.getElementById("checkbox");

  if (savedEmail && savedPassword) {
    document.getElementById("email").value = savedEmail;
    document.getElementById("password").value = savedPassword;
    rememberMeCheckbox.checked = true; // Checkbox aktivieren
  }

  const form = document.querySelector(".logInDate");
  form.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleLogin(event);
    }
  });
});

/**
 * Zeigt eine spezifische Fehlermeldung basierend auf dem Fehlerstatus an.
 *
 * @param {string} status - Der Fehlerstatus.
 */
function showError(status) {
  const errorMessage = document.querySelector(".error");

  switch (status) {
    case "invalidEmail":
      errorMessage.textContent = "Bitte eine gültige E-Mail-Adresse eingeben!";
      break;
    case "emailNotRegistered":
      errorMessage.textContent = "Diese E-Mail ist nicht registriert.";
      break;
    case "wrongPassword":
      errorMessage.textContent = "Falsches Passwort. Bitte versuche es erneut.";
      break;
    default:
      errorMessage.textContent = "Ein unbekannter Fehler ist aufgetreten.";
  }

  errorMessage.style.display = "block"; // Fehlermeldung einblenden
}
