function startAnimation() {
  let background = document.getElementById("backgroundAnimation");

  fadeOutBackground(background);
  hideBackgroundWithDelay(background);
}

function fadeOutBackground(background) {
  setTimeout(() => {
    document.getElementById("logoAnimation").classList.add("end-position-logo");
    background.style.opacity = 0;
  }, 500);
}

function hideBackgroundWithDelay(background) {
  setTimeout(() => {
    background.classList.add("d-none");
  }, 1500);
}

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

function getInputValues() {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  return { email, password };
}

async function fetchUserData() {
  const response = await fetch(
    "https://join-388-default-rtdb.europe-west1.firebasedatabase.app/users.json"
  );
  return response.json();
}

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

function loginUser(userName) {
  localStorage.setItem("userName", userName);
  window.location.href = "./html/summary.html";
}

function showError() {
  document.querySelector(".error").style.display = "block";
}

function handleLoginError(error) {
  console.error("Fehler beim Abrufen der Benutzerdaten:", error);
  alert("Ein Fehler ist aufgetreten. Bitte versuche es später erneut.");
}

function handleGuestLogin() {
  localStorage.setItem("userName", "Guest");
  window.location.href = "./html/summary.html";
}

function saveCredentialsToLocalStorage(email, password) {
  localStorage.setItem("savedEmail", email);
  localStorage.setItem("savedPassword", password);
}

function clearCredentialsFromLocalStorage() {
  localStorage.removeItem("savedEmail");
  localStorage.removeItem("savedPassword");
}

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
