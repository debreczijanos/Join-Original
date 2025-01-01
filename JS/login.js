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
 * Behandelt den Login-Vorgang.
 *
 * @param {Event} event - Das Login-Event.
 */
function handleLogin(event) {
  event.preventDefault();

  const { email, password } = getInputValues();
  const rememberMe = document.getElementById("checkbox").checked;

  fetchUserData()
    .then((usersData) => {
      const { userFound, userName } = validateUser(usersData, email, password);

      if (userFound) {
        if (rememberMe) {
          saveCredentialsToLocalStorage(email, password);
        } else {
          clearCredentialsFromLocalStorage();
        }
        loginUser(userName);
      } else {
        showError();
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
 * Validiert die Benutzerdaten.
 *
 * @param {Object} usersData - Die Benutzerdaten.
 * @param {string} email - Die eingegebene E-Mail-Adresse.
 * @param {string} password - Das eingegebene Passwort.
 * @returns {Object} Ein Objekt mit `userFound` (boolean) und `userName` (string).
 */
function validateUser(usersData, email, password) {
  let userFound = false;
  let userName = "";

  for (const userId in usersData) {
    const user = usersData[userId];
    if (user.email === email && user.password === password) {
      userFound = true;
      userName = user.name;
      break;
    }
  }
  return { userFound, userName };
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
