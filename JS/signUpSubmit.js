/**
 * Activates or deactivates the submit button based on the input fields and the checkbox.
 */
function updateSubmitButton(allFilled) {
  const submitButton = document.getElementById("submitButton");
  const passwordInput = document.getElementById("passwordInput");
  const confirmPasswordInput = document.getElementById("confirmPasswordInput");
  const acceptTerms = document.getElementById("acceptTerms");
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
 * Adds event listeners to all relevant input fields to
 * remove errors directly and validate dynamically.
 */
function addInputListeners() {
  const inputs = document.querySelectorAll(".costume-input input");
  const errorElement = document.getElementById("error");

  inputs.forEach((input) => {
    input.addEventListener("input", () => {
      errorElement.textContent = "";
    });

    input.addEventListener("blur", () => {
      checkInputs();
    });
  });
}

/**
 * Handles the form submission, validates data, and sends it to the server.
 */
async function handleSubmit(event) {
  event.preventDefault();
  const errorElement = document.getElementById("error");
  errorElement.textContent = "";
  errorElement.style.color = "red";

  if (!validateFormData(collectFormData())) return;

  try {
    handleServerResponse(await sendDataToServer(collectFormData()));
  } catch {
    errorElement.textContent = "Network error: Please check your connection.";
  }
}

/**
 * Collects data from the input fields.
 *
 * @returns {Object} The collected form data.
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
 * Sends form data to the server after checking for existing users.
 */
async function sendDataToServer({ name, email, password, acceptTerms }) {
  const url =
    "https://join-388-default-rtdb.europe-west1.firebasedatabase.app/users.json";
  const usersData = await fetchExistingUsers(url);
  if (isEmailAlreadyRegistered(usersData, email))
    return showError("This email address is already registered!");

  return saveNewUser(url, { name, email, password, acceptTerms }).catch(() =>
    showError("A server error occurred. Please try again later.")
  );
}

/**
 * Displays an error message.
 */
function showError(message) {
  const errorElement = document.getElementById("error");
  errorElement.textContent = message;
  errorElement.style.color = "red";
  return {
    ok: false,
    reason: message.includes("registered") ? "email_exists" : "server_error",
  };
}

/**
 * Fetches existing user data from the server.
 *
 * @param {string} url - The API URL.
 * @returns {Object} The user data.
 */
async function fetchExistingUsers(url) {
  const response = await fetch(url);
  return response.json();
}

/**
 * Saves a new user on the server.
 *
 * @param {string} url - The API URL.
 * @param {Object} userData - The user data to be saved.
 * @returns {Response} The server's response.
 */
async function saveNewUser(url, userData) {
  return await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  });
}

/**
 * Handles server errors.
 *
 * @param {Error} error - The error that occurred.
 * @returns {Object} An error object with the reason.
 */
function handleServerError(error) {
  console.error("Error sending request:", error);
  return { ok: false, reason: "server_error" };
}

/**
 * Handles the server's response.
 *
 * @param {Response|Object} response - The server's response.
 */
function handleServerResponse(response) {
  const errorElement = document.getElementById("error");

  if (response && response.ok) {
    displaySuccessMessage();
  } else if (response.reason === "email_exists") {
    errorElement.textContent = "This email address is already registered!";
    errorElement.style.color = "red";
  } else if (response.reason === "server_error") {
    errorElement.textContent =
      "A server error occurred. Please try again later.";
    errorElement.style.color = "red";
  } else {
    errorElement.textContent = "An unknown error occurred.";
    errorElement.style.color = "red";
  }
}

/**
 * Displays a success message and redirects the user.
 */
function displaySuccessMessage() {
  document.querySelector(".center").style.display = "none";
  const successMessage = document.getElementById("successMessage");

  successMessage.style.display = "flex";
  successMessage.style.animation = "slideUp 1s ease-out forwards";

  setTimeout(() => (window.location.href = "../index.html"), 3000);
}

/**
 * Navigates to the index page.
 */
function navigateToIndex() {
  window.location.href = "../index.html";
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("acceptTerms").addEventListener("change", () => {
    checkInputs();
  });
});
