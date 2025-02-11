/**
 * Starts the background and logo animation.
 */
function startAnimation() {
  let background = document.getElementById("backgroundAnimation");

  fadeOutBackground(background);
  hideBackgroundWithDelay(background);
}

/**
 * Slowly fades out the background.
 *
 * @param {HTMLElement} background - The background element.
 */
function fadeOutBackground(background) {
  setTimeout(() => {
    document.getElementById("logoAnimation").classList.add("end-position-logo");
    background.style.opacity = 0;
  }, 500);
}

/**
 * Hides the background after a delay.
 *
 * @param {HTMLElement} background - The background element.
 */
function hideBackgroundWithDelay(background) {
  setTimeout(() => {
    background.classList.add("d-none");
  }, 1500);
}

/**
 * Handles the login process and displays specific error messages.
 *
 * @param {Event} event - The login event.
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
 * Retrieves the input values for email and password from the form.
 *
 * @returns {Object} An object with `email` and `password`.
 */
function getInputValues() {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  return { email, password };
}

/**
 * Fetches the user data from the database.
 *
 * @returns {Promise<Object>} The user data as a JSON object.
 */
async function fetchUserData() {
  const response = await fetch(
    "https://join-388-default-rtdb.europe-west1.firebasedatabase.app/users.json"
  );
  return response.json();
}

/**
 * Validates the user data and returns specific error messages.
 *
 * @param {Object} usersData - The user data.
 * @param {string} email - The entered email address.
 * @param {string} password - The entered password.
 * @returns {Object} An object with `status` (string) and `userName` (string or null).
 */
function validateUser(usersData, email, password) {
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
 * Logs the user in and saves the username in localStorage.
 *
 * @param {string} userName - The username.
 */
function loginUser(userName) {
  localStorage.setItem("userName", userName);
  window.location.href = "./html/summary.html";
}

/**
 * Displays an error message for incorrect login credentials.
 */
function showError() {
  document.querySelector(".error").style.display = "block";
}

/**
 * Handles errors that occur when fetching user data.
 *
 * @param {Error} error - The error.
 */
function handleLoginError(error) {
  console.error("Error fetching user data:", error);
  alert("An error occurred. Please try again later.");
}

/**
 * Handles the guest login.
 */
function handleGuestLogin() {
  localStorage.setItem("userName", "Guest");
  window.location.href = "./html/summary.html";
}

/**
 * Saves the login credentials in localStorage.
 *
 * @param {string} email - The email address.
 * @param {string} password - The password.
 */
function saveCredentialsToLocalStorage(email, password) {
  localStorage.setItem("savedEmail", email);
  localStorage.setItem("savedPassword", password);
}

/**
 * Removes the saved login credentials from localStorage.
 */
function clearCredentialsFromLocalStorage() {
  localStorage.removeItem("savedEmail");
  localStorage.removeItem("savedPassword");
}

/**
 * Event listener for page load
 */
document.addEventListener("DOMContentLoaded", () => {
  const savedEmail = localStorage.getItem("savedEmail");
  const savedPassword = localStorage.getItem("savedPassword");
  const rememberMeCheckbox = document.getElementById("checkbox");

  if (savedEmail && savedPassword) {
    document.getElementById("email").value = savedEmail;
    document.getElementById("password").value = savedPassword;
    rememberMeCheckbox.checked = true;
  }
});

/**
 * Displays a specific error message based on the error status.
 *
 * @param {string} status - The error status.
 */
function showError(status) {
  const errorMessage = document.querySelector(".error");

  switch (status) {
    case "invalidEmail":
      errorMessage.textContent = "Please enter a valid email address!";
      break;
    case "emailNotRegistered":
      errorMessage.textContent = "This email is not registered.";
      break;
    case "wrongPassword":
      errorMessage.textContent = "Incorrect password. Please try again.";
      break;
    default:
      errorMessage.textContent = "An unknown error occurred.";
  }

  errorMessage.style.display = "block";
}
