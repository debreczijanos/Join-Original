/**
 * Validates the contact form for creation or editing.
 *
 * @function validateContactForm
 * @returns {boolean} `true` if all form fields are valid; otherwise, `false`.
 */
function validateContactForm() {
  const isNameValid = validateName();
  const isEmailValid = validateEmail();
  const isPhoneValid = validatePhone();
  return isNameValid && isEmailValid && isPhoneValid;
}

/**
 * Collects the entered data from the contact form.
 *
 * @function gatherContactFormData
 * @returns {Object} An object containing the contact information: `name`, `email`, `phoneNumber`.
 */
function gatherContactFormData() {
  const name = document.getElementById("contactName").value.trim();
  const email = document.getElementById("contactEmail").value.trim();
  const telefonnummer = document.getElementById("contactPhone").value.trim();

  return { name, email, telefonnummer };
}

/**
 * Validates the name field in the contact form.
 *
 * @function validateName
 * @returns {boolean} `true` if the name is valid; otherwise, `false`.
 */
function validateName() {
  const nameInput = document.getElementById("contactName");
  const errorName = document.getElementById("errorName");
  const nameRegex = /^[a-zA-Z\s]+$/;

  if (!nameRegex.test(nameInput.value.trim())) {
    errorName.textContent = "Name can only contain letters and spaces.";
    toggleCreateButton();
    return false;
  } else {
    errorName.textContent = "";
    toggleCreateButton();
    return true;
  }
}

/**
 * Validates the entered email address and checks if it is already registered.
 *
 * @async
 * @function validateEmail
 * @param {boolean} [isEditMode=false] - Indicates whether the function is in edit mode.
 * @param {string} [originalEmail=""] - The original email address in edit mode.
 * @returns {Promise<boolean>} Returns `true` if the email is valid; otherwise, `false`.
 */
/**
 * Validates email input and checks for duplicates.
 */
async function validateEmail(isEditMode = false, originalEmail = "") {
  const emailValue = getEmailInputValue();
  if (!emailValue) return setEmailError("Email is required.") || false;

  const error = validateEmailFormat(emailValue, isEditMode, originalEmail);
  if (error) return setEmailError(error) || false;

  if (await isEmailAlreadyRegistered(emailValue, isEditMode, originalEmail)) {
    return setEmailError("This email address is already registered.") || false;
  }

  return clearEmailError() || true;
}

/**
 * Clears the email error message and ensures the function returns `true`.
 */
function clearEmailError() {
  document.getElementById("errorEmail").textContent = "";
  return true;
}

/**
 * Displays an email error and ensures the function returns `false`.
 */
function setEmailError(message) {
  displayEmailError(message);
  toggleCreateButton();
  return false;
}

/**
 * Retrieves the value from the email input field.
 *
 * @function getEmailInputValue
 * @returns {string} The value of the email input field.
 */
function getEmailInputValue() {
  const emailInput = document.getElementById("contactEmail");
  return emailInput.value.trim();
}

/**
 * Validates the format of the entered email address.
 *
 * @function validateEmailFormat
 * @param {string} emailValue - The email address to validate.
 * @param {boolean} isEditMode - Indicates whether the function is in edit mode.
 * @param {string} originalEmail - The original email address in edit mode.
 * @returns {string|null} An error message if the email is invalid; otherwise, `null`.
 */
function validateEmailFormat(emailValue, isEditMode, originalEmail) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailValue) return "";
  if (!emailRegex.test(emailValue))
    return "Please enter a valid email address.";
  if (isEditMode && emailValue === originalEmail) return "";
  return null;
}

/**
 * Checks if an email address is already registered.
 *
 * @async
 * @function isEmailAlreadyRegistered
 * @param {string} emailValue - The email address to check.
 * @param {boolean} isEditMode - Indicates whether the function is in edit mode.
 * @param {string} originalEmail - The original email address in edit mode.
 * @returns {Promise<boolean>} Returns `true` if the email is already registered; otherwise, `false`.
 */
async function isEmailAlreadyRegistered(emailValue, isEditMode, originalEmail) {
  if (isEditMode && emailValue === originalEmail) return false;
  const existingEmails = await fetchExistingEmails();
  return existingEmails.includes(emailValue);
}

/**
 * Displays an error message for the email input field.
 *
 * @function displayEmailError
 * @param {string} message - The error message to display.
 */
function displayEmailError(message) {
  const errorEmail = document.getElementById("errorEmail");
  errorEmail.textContent = message;
}

/**
 * Removes the error message for the email input field.
 *
 * @function clearEmailError
 */
function clearEmailError() {
  const errorEmail = document.getElementById("errorEmail");
  errorEmail.textContent = "";
}

/**
 * Validates the phone number in the contact form.
 * @returns {boolean} Returns `true` if valid, otherwise `false`.
 */
function validatePhone() {
  const phoneInput = document.getElementById("contactPhone").value.trim();
  const errorPhone = document.getElementById("errorPhone");
  const phoneRegex = /^\+?[0-9]{7,15}$/;

  if (!phoneInput) return setPhoneError("", false);
  if (!phoneRegex.test(phoneInput)) {
    return setPhoneError(
      "Phone number must be 7-15 digits, numbers only (optional '+').",
      false
    );
  }

  return setPhoneError("", true);
}

/**
 * Sets or clears the phone number error message.
 */
function setPhoneError(message, isValid) {
  document.getElementById("errorPhone").textContent = message;
  toggleCreateButton();
  return isValid;
}

/**
 * Retrieves all existing email addresses from contacts and users.
 *
 * @async
 * @function fetchExistingEmails
 * @returns {Promise<Array<string>>} An array of email addresses.
 */
async function fetchExistingEmails() {
  try {
    const [contacts, users] = await fetchContactsAndUsers();
    return combineAndDeduplicateEmails(contacts, users);
  } catch {
    return [];
  }
}

/**
 * Fetches contact and user data from the API.
 *
 * @async
 * @function fetchContactsAndUsers
 * @returns {Promise<Array<Object>>} An array containing contact and user data.
 */
async function fetchContactsAndUsers() {
  const [contactsResponse, usersResponse] = await Promise.all([
    fetch(`${API_CONTACTS}`),
    fetch(`${apiURL}`),
  ]);

  const contactsData = await contactsResponse.json();
  const usersData = await usersResponse.json();

  return [contactsData, usersData];
}

/**
 * Extracts email addresses from the given data.
 *
 * @function extractEmails
 * @param {Object} data - The data from which emails are extracted.
 * @param {string} [type="contact"] - The type of data ("contact" or "user").
 * @returns {Array<string>} An array of email addresses.
 */
function extractEmails(data, type = "contact") {
  if (!data) return [];
  return Object.values(data).map((item) =>
    type === "contact" ? item.email.trim() : item.email.trim()
  );
}

/**
 * Combines and removes duplicate email addresses from contact and user data.
 *
 * @function combineAndDeduplicateEmails
 * @param {Object} contactsData - The contact data.
 * @param {Object} usersData - The user data.
 * @returns {Array<string>} An array of unique email addresses.
 */
function combineAndDeduplicateEmails(contactsData, usersData) {
  const contactEmails = extractEmails(contactsData, "contact");
  const userEmails = extractEmails(usersData, "user");
  return [...new Set([...contactEmails, ...userEmails])];
}

/**
 * Enables or disables buttons based on form validity.
 *
 * @function toggleCreateButton
 */
function toggleCreateButton() {
  const createButton = document.getElementById("createContactButton");
  const saveButton = document.querySelector(".save-btn");
  const isValid = validateFormInputs();
  updateButtonState(createButton, isValid);
  updateButtonState(saveButton, isValid);
}

/**
 * Checks form inputs for errors and whether all fields are filled.
 *
 * @function validateFormInputs
 * @returns {boolean} `true` if the form is valid; otherwise, `false`.
 */
function validateFormInputs() {
  const errorName = document.getElementById("errorName").textContent;
  const errorEmail = document.getElementById("errorEmail").textContent;
  const errorPhone = document.getElementById("errorPhone").textContent;
  const nameInput = document.getElementById("contactName").value.trim();
  const emailInput = document.getElementById("contactEmail").value.trim();
  const phoneInput = document.getElementById("contactPhone").value.trim();

  return (
    !errorName &&
    !errorEmail &&
    !errorPhone &&
    nameInput &&
    emailInput &&
    phoneInput
  );
}

/**
 * Updates the state of a button (enables/disables it).
 *
 * @function updateButtonState
 * @param {HTMLElement} button - The button whose state is being changed.
 * @param {boolean} isValid - Indicates whether the button should be enabled (`true`) or disabled (`false`).
 */
function updateButtonState(button, isValid) {
  if (button) {
    button.disabled = !isValid;
  }
}

/**
 * Saves the changes made to a contact.
 *
 * @async
 * @function saveEditedContact
 * @param {string} contactId - The ID of the contact being edited.
 */
async function saveEditedContact(contactId) {
  if (await isFormValid()) {
    const updatedData = getUpdatedContactData();

    try {
      await updateContactInDatabase(contactId, updatedData);
      await updateUIAfterSave(updatedData);
      closeAddContactOverlay();
    } catch (error) {
      console.error("Save error:", error);
    }
  }
}

/**
 * Checks the validity of the form fields (name, email, phone number).
 *
 * @async
 * @function isFormValid
 * @returns {Promise<boolean>} Returns `true` if the form is valid; otherwise, `false`.
 */
async function isFormValid() {
  const isNameValid = validateName();
  const email = document.getElementById("contactEmail").value.trim();
  const isEmailValid = await validateEmail(true, email);
  const isPhoneValid = validatePhone();

  return isNameValid && isEmailValid && isPhoneValid;
}

/**
 * Retrieves the updated data from the contact form.
 *
 * @function getUpdatedContactData
 * @returns {Object} An object containing the updated contact information: `name`, `email`, `phoneNumber`.
 */
function getUpdatedContactData() {
  const name = document.getElementById("contactName").value.trim();
  const email = document.getElementById("contactEmail").value.trim();
  const phone = document.getElementById("contactPhone").value.trim();

  return { name, email, telefonnummer: phone };
}

/**
 * Updates a contact in the database.
 *
 * @async
 * @function updateContactInDatabase
 * @param {string} contactId - The ID of the contact to be updated.
 * @param {Object} updatedData - The updated contact data.
 * @throws {Error} If the HTTP request fails.
 */
async function updateContactInDatabase(contactId, updatedData) {
  const response = await fetch(
    `${API_CONTACTS.replace(".json", "")}/${contactId}.json`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedData),
    }
  );

  if (!response.ok) throw new Error(`Error while saving: ${response.status}`);
}

/**
 * Updates the user interface after saving a contact.
 *
 * @async
 * @function updateUIAfterSave
 * @param {Object} updatedData - The updated contact data.
 */
async function updateUIAfterSave(updatedData) {
  await renderContacts();

  const selectedDiv = document.querySelector(`.contact-item.selected`);
  if (selectedDiv) {
    highlightSelectedContact(selectedDiv, updatedData);
  }
}

/**
 * Handles errors that occur when saving a contact.
 *
 * @function handleSaveError
 * @param {Error} error - The error that occurred.
 */
function handleSaveError(error) {
  console.error("Error updating the contact:", error);
}
