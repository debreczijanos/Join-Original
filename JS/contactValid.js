/**
 * Validates the contact creation or editing form.
 *
 * @function validateContactForm
 * @returns {boolean} `true` if all form fields are valid; otherwise `false`.
 */
 
/**
 * Gathers the data entered in the contact form.
 *
 * @function gatherContactFormData
 * @returns {Object} An object containing the contact information: `name`, `email`, `phone number`.
 */
 
/**
 * Validates the name in the contact form.
 *
 * @function validateName
 * @returns {boolean} `true` if the name is valid; otherwise `false`.
 */
 
/**
 * Validates the entered email address and checks if it is already registered.
 *
 * @async
 * @function validateEmail
 * @param {boolean} [isEditMode=false] - Indicates whether the function is in edit mode.
 * @param {string} [originalEmail=""] - The original email address in edit mode.
 * @returns {Promise<boolean>} Returns `true` if the email address is valid; otherwise `false`.
 */
 
/**
 * Retrieves the value from the email input field.
 *
 * @function getEmailInputValue
 * @returns {string} The value of the email input field.
 */
 
/**
 * Validates the format of the entered email address.
 *
 * @function validateEmailFormat
 * @param {string} emailValue - The email address to be validated.
 * @param {boolean} isEditMode - Indicates whether the function is in edit mode.
 * @param {string} originalEmail - The original email address in edit mode.
 * @returns {string|null} An error message if the email address is invalid; otherwise `null`.
 */
 
/**
 * Checks if an email address is already registered.
 *
 * @async
 * @function isEmailAlreadyRegistered
 * @param {string} emailValue - The email address to be checked.
 * @param {boolean} isEditMode - Indicates whether the function is in edit mode.
 * @param {string} originalEmail - The original email address in edit mode.
 * @returns {Promise<boolean>} Returns `true` if the email address is already registered; otherwise `false`.
 */
 
/**
 * Displays an error message for the email address.
 *
 * @function displayEmailError
 * @param {string} message - The error message to be displayed.
 */
 
/**
 * Clears the error message for the email address.
 *
 * @function clearEmailError
 */
 
/**
 * Validates the phone number in the contact form.
 *
 * @function validatePhone
 * @returns {boolean} Returns `true` if the phone number is valid; otherwise `false`.
 */
 
/**
 * Fetches all existing email addresses from contacts and users.
 *
 * @async
 * @function fetchExistingEmails
 * @returns {Promise<Array<string>>} An array of email addresses.
 */
 
/**
 * Fetches contact and user data from the API.
 *
 * @async
 * @function fetchContactsAndUsers
 * @returns {Promise<Array<Object>>} An array of contact and user data.
 */
 
/**
 * Extracts email addresses from the data.
 *
 * @function extractEmails
 * @param {Object} data - The data from which emails are to be extracted.
 * @param {string} [type="contact"] - The type of data ("contact" or "user").
 * @returns {Array<string>} An array of email addresses.
 */
 
/**
 * Combines and deduplicates contact and user emails.
 *
 * @function combineAndDeduplicateEmails
 * @param {Object} contactsData - The contact data.
 * @param {Object} usersData - The user data.
 * @returns {Array<string>} An array of unique email addresses.
 */
 
/**
 * Enables or disables the buttons based on form validity.
 *
 * @function toggleCreateButton
 */
 
/**
 * Checks the form inputs for errors and whether all fields are filled out.
 *
 * @function validateFormInputs
 * @returns {boolean} `true` if the form is valid; otherwise `false`.
 */
 
/**
 * Updates the state of a button (enables/disables it).
 *
 * @function updateButtonState
 * @param {HTMLElement} button - The button whose state is to be changed.
 * @param {boolean} isValid - Indicates whether the button should be enabled (`true`) or disabled (`false`).
 */
 
/**
 * Saves the changes of a contact.
 *
 * @async
 * @function saveEditedContact
 * @param {string} contactId - The ID of the contact being edited.
 */
 
/**
 * Checks the validity of the form fields (name, email, phone number).
 *
 * @async
 * @function isFormValid
 * @returns {Promise<boolean>} Returns `true` if the form is valid; otherwise `false`.
 */
 
/**
 * Retrieves the updated data from the contact form.
 *
 * @function getUpdatedContactData
 * @returns {Object} An object with the updated contact information: `name`, `email`, `phone number`.
 */
 
/**
 * Updates a contact in the database.
 *
 * @async
 * @function updateContactInDatabase
 * @param {string} contactId - The ID of the contact to be updated.
 * @param {Object} updatedData - The updated contact data.
 * @throws {Error} If the HTTP request fails.
 */
 
/**
 * Updates the user interface after saving a contact.
 *
 * @async
 * @function updateUIAfterSave
 * @param {Object} updatedData - The updated contact data.
 */
 
/**
 * Handles errors that occur when saving a contact.
 *
 * @function handleSaveError
 * @param {Error} error - The error that occurred.
 */
