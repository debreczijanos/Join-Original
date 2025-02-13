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
 * @param {Object} formData - The form data to validate.
 * @returns {boolean} Whether the form data is valid.
 */
function validateFormData(formData) {
  const errors = [];
  if (!isValidName(formData.name))
    errors.push("Enter a valid name (min. 2 letters).");
  if (!isValidEmail(formData.email))
    errors.push("Enter a valid email address.");
  if (formData.password.length < 6)
    errors.push("Password must be at least 6 characters.");
  if (formData.password !== formData.confirmPassword)
    errors.push("Passwords do not match.");
  if (!formData.acceptTerms) errors.push("You must accept the privacy policy.");

  document.getElementById("error").innerHTML = errors.join("<br>");
  return errors.length === 0;
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
 * Validates the email field and locks other fields if invalid.
 */
async function validateEmailField() {
  const email = document.getElementById("emailInput").value.trim();
  const errorElement = document.getElementById("error");

  if (!isValidEmail(email))
    return setEmailError("Please enter a valid email address.", true);

  try {
    const usersData = await fetchExistingUsers(
      "https://join-388-default-rtdb.europe-west1.firebasedatabase.app/users.json"
    );
    if (isEmailAlreadyRegistered(usersData, email))
      return setEmailError("This email address is already registered!", true);

    setEmailError("", false);
  } catch {
    setEmailError("Server error: Please try again later.", true);
  }
}

/**
 * Sets the email error message and updates field locks.
 */
function setEmailError(message, lock) {
  document.getElementById("error").textContent = message;
  toggleFieldLock(false, lock);
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
 * Validates passwords and ensures error messages persist until fixed.
 */
function validatePasswordField() {
  const password = document.getElementById("passwordInput").value.trim();
  const confirmPassword = document
    .getElementById("confirmPasswordInput")
    .value.trim();

  const errorMsg = getPasswordError(password, confirmPassword);
  setPasswordError(errorMsg);

  const hasError = !!errorMsg;
  toggleFieldLock(hasNameError(), hasEmailError(), hasError);
  updateSubmitButton(!hasError);
}

/**
 * Returns an error message if the password validation fails.
 */
function getPasswordError(password, confirmPassword) {
  if (!password || !confirmPassword)
    return "Both password fields must be filled out.";
  if (password.length < 6)
    return "Password must be at least 6 characters long.";
  if (password !== confirmPassword) return "Passwords do not match.";
  return "";
}

/**
 * Updates the error message display.
 */
function setPasswordError(message) {
  document.getElementById("error").textContent = message;
}

/**
 * Checks if the name input has an error.
 */
function hasNameError() {
  return !isValidName(document.getElementById("nameInput").value.trim());
}

/**
 * Checks if the email input has an error.
 */
function hasEmailError() {
  return !isValidEmail(document.getElementById("emailInput").value.trim());
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
