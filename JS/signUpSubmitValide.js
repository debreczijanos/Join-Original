/**
 * Checks if all required input fields are filled in,
 * and updates the status of the submit button.
 */
function checkInputs() {
  const inputs = getAllInputs();
  const allFilled = validateInputs(inputs);

  updateSubmitButton(allFilled);
}

/**
 * Retrieves all relevant input fields from the form.
 *
 * @returns {NodeList} A list of the input fields.
 */
function getAllInputs() {
  return document.querySelectorAll(
    '.sign-up-daten input[type="text"], .sign-up-daten input[type="email"], .sign-up-daten input[type="password"], .sign-up-daten input[type="checkbox"]'
  );
}

/**
 * Validates if all input fields are filled.
 *
 * @param {NodeList} inputs - A list of the input fields.
 * @returns {boolean} True if all fields are filled, otherwise false.
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
 * Checks if an input field is empty.
 *
 * @param {HTMLElement} input - The input field to check.
 * @returns {boolean} True if the field is empty, otherwise false.
 */
function isInputEmpty(input) {
  return (
    (input.type !== "checkbox" && input.value.trim() === "") ||
    (input.type === "checkbox" && !input.checked)
  );
}

/**
 * Checks if an email address is valid.
 *
 * @param {string} email - The email address to check.
 * @returns {boolean} True if the email address is valid, otherwise false.
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Checks if the name is valid (only letters, at least 2 characters).
 */
function isValidName(name) {
  const nameRegex = /^[a-zA-ZäöüÄÖÜß\s-]{2,}$/;
  return nameRegex.test(name);
}

/**
 * Checks if an email address is already registered.
 *
 * @param {Object} usersData - The existing user data.
 * @param {string} email - The email address to check.
 * @returns {boolean} True if the email address is registered, otherwise false.
 */
function isEmailAlreadyRegistered(usersData, email) {
  return usersData
    ? Object.values(usersData).some((user) => user.email === email)
    : false;
}

/**
 * Validates the form data.
 *
 * @param {Object} formData - The form data to validate.
 * @returns {boolean} Whether the form data is valid.
 */
function validateFormData(formData) {
  const errorElement = document.getElementById("error");
  let errorMessages = [];

  if (!isValidName(formData.name)) {
    errorMessages.push(
      "Please enter a valid name (only letters, at least 2 characters)."
    );
  }

  if (!isValidEmail(formData.email)) {
    errorMessages.push("Please enter a valid email address.");
  }

  if (formData.password.length < 6) {
    errorMessages.push("Password must be at least 6 characters long.");
  }

  if (formData.password !== formData.confirmPassword) {
    errorMessages.push("Passwords do not match.");
  }

  if (!formData.acceptTerms) {
    errorMessages.push("You must accept the privacy policy.");
  }

  if (errorMessages.length > 0) {
    errorElement.innerHTML = errorMessages.join("<br>");
    return false;
  }

  errorElement.textContent = "";
  return true;
}

/**
 * Adds event listeners to all input fields to validate errors immediately.
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
 * Locks or unlocks the fields based on errors in the name or email.
 */
/**
 * Locks or unlocks the fields based on errors in the name, email, or password.
 */
function toggleFieldLock(nameError, emailError, passwordError) {
  const emailInput = document.getElementById("emailInput");
  const passwordInputs = document.querySelectorAll(
    "#passwordInput, #confirmPasswordInput"
  );
  const acceptTerms = document.getElementById("acceptTerms");

  emailInput.disabled = nameError;
  passwordInputs.forEach((input) => (input.disabled = nameError || emailError));
  acceptTerms.disabled = nameError || emailError || passwordError;
}

/**
 * Validates the name field and locks other fields in case of an error.
 */
function validateNameField() {
  const nameInput = document.getElementById("nameInput");
  const errorElement = document.getElementById("error");

  let nameError = !isValidName(nameInput.value.trim());

  if (nameError) {
    errorElement.textContent =
      "Please enter a valid name (only letters, at least 2 characters).";
  } else {
    errorElement.textContent = "";
  }

  toggleFieldLock(nameError, false);
}

/**
 * Validates the email field in real-time and locks other fields in case of an error.
 */
async function validateEmailField() {
  const emailInput = document.getElementById("emailInput");
  const errorElement = document.getElementById("error");
  const email = emailInput.value.trim();

  let emailError = !isValidEmail(email);

  if (emailError) {
    errorElement.textContent = "Please enter a valid email address.";
    toggleFieldLock(false, true);
    return;
  }

  try {
    const url =
      "https://join-388-default-rtdb.europe-west1.firebasedatabase.app/users.json";
    const usersData = await fetchExistingUsers(url);

    if (isEmailAlreadyRegistered(usersData, email)) {
      errorElement.textContent = "This email address is already registered!";
      toggleFieldLock(false, true);
      return;
    } else {
      errorElement.textContent = "";
      toggleFieldLock(false, false);
    }
  } catch (error) {
    console.error("Error during server check:", error);
    errorElement.textContent = "Server error: Please try again later.";
    toggleFieldLock(false, true);
  }
}

/**
 * Adds event listeners to the fields to validate them immediately after input.
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
 * Validates the passwords and ensures that the error message stays
 * until the issue is really fixed.
 */
function validatePasswordField() {
  const passwordInput = document.getElementById("passwordInput");
  const confirmPasswordInput = document.getElementById("confirmPasswordInput");
  const errorElement = document.getElementById("error");

  let passwordError = false;

  if (
    passwordInput.value.trim() === "" ||
    confirmPasswordInput.value.trim() === ""
  ) {
    passwordError = true;
    errorElement.textContent = "Both password fields must be filled out.";
  } else if (passwordInput.value.length < 6) {
    passwordError = true;
    errorElement.textContent = "Password must be at least 6 characters long.";
  } else if (passwordInput.value !== confirmPasswordInput.value) {
    passwordError = true;
    errorElement.textContent = "Passwords do not match.";
  }

  if (!passwordError) {
    errorElement.textContent = "";
  }

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
 * Clears the error message if there are no errors.
 */
function clearError() {
  const errorElement = document.getElementById("error");
  errorElement.textContent = "";
}

/**
 * Updates the status of the submit button.
 *
 * @param {boolean} enabled - Whether the button should be enabled.
 */
document.addEventListener("DOMContentLoaded", () => {
  addLiveValidationListeners();
});
