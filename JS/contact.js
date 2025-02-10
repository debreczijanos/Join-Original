/**
 * Firebase URLs for the API endpoints.
 * @constant {string} apiURL - URL for user data.
 * @constant {string} API_CONTACTS - URL for contact data.
 */
const apiURL =
  "https://join-388-default-rtdb.europe-west1.firebasedatabase.app/users.json";
const API_CONTACTS =
  "https://join-388-default-rtdb.europe-west1.firebasedatabase.app/contact.json";

/**
 * Function to fetch data from a specified API.
 *
 * @async
 * @function fetchData
 * @param {string} url - The URL of the API from which to fetch data.
 * @returns {Promise<Object|undefined>} Returns a Promise that contains the fetched data as an object.
 * @throws {Error} If the HTTP response is not successful.
 * @example
 * fetchData(apiURL).then(data => console.log(data)).catch(error => console.error(error));
 */
async function fetchData(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP Error! Status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error loading data:", error);
  }
}

/**
 * Renders the contact list and the associated details.
 *
 * @async
 * @function renderContacts
 * @returns {Promise<void>} Returns a Promise indicating the function's execution.
 */
async function renderContacts() {
  const contactsDiv = document.getElementById("contactsId");
  const contactDetailsDiv = document.getElementById("contactDate");
  contactsDiv.innerHTML = "";

  try {
    const [contactsData, usersData] = await Promise.all([
      fetchData(API_CONTACTS),
      fetchData(apiURL),
    ]);

    const combinedData = combineContactsAndUsers(contactsData, usersData);
    updateContactList(contactsDiv, contactDetailsDiv, combinedData);
  } catch (error) {
    handleRenderError(contactsDiv, contactDetailsDiv, error);
  }
}

/**
 * Updates the contact list and displays the sorted contacts.
 *
 * @function updateContactList
 * @param {HTMLElement} contactsDiv - The HTML element containing the contact list.
 * @param {HTMLElement} contactDetailsDiv - The HTML element containing the contact details.
 * @param {Array<Object>} combinedData - The combined and processed contact data.
 */
function updateContactList(contactsDiv, contactDetailsDiv, combinedData) {
  if (combinedData.length > 0) {
    const sortedData = sortContactsByName(combinedData);
    renderSortedContacts(contactsDiv, contactDetailsDiv, sortedData);
  } else {
    contactsDiv.innerHTML = "<p>No contacts found.</p>";
    contactDetailsDiv.innerHTML = "<p>No details available.</p>";
  }
}

/**
 * Sorts contacts alphabetically by name.
 *
 * @function sortContactsByName
 * @param {Array<Object>} contacts - The list of contacts.
 * @returns {Array<Object>} The sorted list of contacts.
 */
function sortContactsByName(contacts) {
  return contacts.sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Handles errors during the rendering of contacts.
 *
 * @function handleRenderError
 * @param {HTMLElement} contactsDiv - The HTML element containing the contact list.
 * @param {HTMLElement} contactDetailsDiv - The HTML element containing the contact details.
 * @param {Error} error - The error that occurred during rendering.
 */
function handleRenderError(contactsDiv, contactDetailsDiv, error) {
  contactsDiv.innerHTML = `<p>Error loading contacts: ${error.message}</p>`;
  contactDetailsDiv.innerHTML = "<p>Error loading details.</p>";
}

/**
 * Combines the contact and user data, removes duplicates.
 *
 * @function combineContactsAndUsers
 * @param {Object} contacts - The contact data.
 * @param {Object} users - The user data.
 * @returns {Array<Object>} An array of combined and deduplicated contacts.
 */
function combineContactsAndUsers(contacts, users) {
  const contactsArray = parseDataToArray(contacts);
  const usersArray = parseDataToArray(users);
  const combinedArray = [...contactsArray, ...usersArray];
  return removeDuplicatesByEmailAndId(combinedArray);
}

/**
 * Converts a data object into an array.
 *
 * @function parseDataToArray
 * @param {Object|null} data - The data object.
 * @returns {Array<Object>} An array containing the data as objects.
 */
function parseDataToArray(data) {
  return data
    ? Object.entries(data).map(([id, item]) => ({ id, ...item }))
    : [];
}

/**
 * Removes duplicate entries in an array based on email and ID.
 *
 * @function removeDuplicatesByEmailAndId
 * @param {Array<Object>} array - The array to check.
 * @returns {Array<Object>} An array without duplicates.
 */
function removeDuplicatesByEmailAndId(array) {
  return array.reduce((acc, current) => {
    if (
      !acc.find(
        (item) => item.email === current.email && item.id === current.id
      )
    ) {
      acc.push(current);
    }
    return acc;
  }, []);
}

/**
 * Highlights the selected contact and shows its details.
 *
 * @function highlightSelectedContact
 * @param {HTMLElement} selectedDiv - The HTML element of the selected contact.
 * @param {Object} contactData - The data of the selected contact.
 */
function highlightSelectedContact(selectedDiv, contactData) {
  deselectAllContacts();
  selectContact(selectedDiv);
  updateContactDetails(contactData);

  if (window.innerWidth <= 1025) {
    openEditContactOverlay(contactData);
  }
}

/**
 * Deselects all contacts.
 *
 * @function deselectAllContacts
 */
function deselectAllContacts() {
  document
    .querySelectorAll(".contact-item")
    .forEach((item) => item.classList.remove("selected"));
}

/**
 * Marks a contact as selected.
 *
 * @function selectContact
 * @param {HTMLElement} contactDiv - The HTML element of the contact to mark.
 */
function selectContact(contactDiv) {
  contactDiv.classList.add("selected");
}

/**
 * Deletes a contact after user confirmation.
 *
 * @async
 * @function deleteContact
 * @param {string} contactId - The ID of the contact to delete.
 * @param {string} contactName - The name of the contact to delete.
 */
async function deleteContact(contactId, contactName) {
  const confirmationBox = createConfirmationBox(contactName);

  document.body.appendChild(confirmationBox);

  confirmationBox
    .querySelector(".confirm-btn")
    .addEventListener("click", async () => {
      await handleContactDeletion(contactId, confirmationBox);
    });

  confirmationBox.querySelector(".cancel-btn").addEventListener("click", () => {
    confirmationBox.remove(); // Close the confirmation box
  });
}

/**
 * Handles the deletion of a contact and updates the UI.
 *
 * @async
 * @function handleContactDeletion
 * @param {string} contactId - The ID of the contact to delete.
 * @param {HTMLElement} confirmationBox - The confirmation box to be closed.
 */
async function handleContactDeletion(contactId, confirmationBox) {
  try {
    const response = await fetch(
      `${API_CONTACTS.replace(".json", "")}/${contactId}.json`,
      {
        method: "DELETE",
      }
    );

    if (!response.ok) {
      throw new Error(`Error deleting contact: ${response.status}`);
    }
    confirmationBox.remove();
    closeAddContactOverlay();
    renderContacts();
  } catch (error) {
    console.error("Error deleting contact:", error);
  }
}

/**
 * Fetches the contacts when the page loads.
 *
 * @function
 * @listens DOMContentLoaded
 */
document.addEventListener("DOMContentLoaded", renderContacts);

/**
 * Closes the overlay for creating or editing a contact.
 *
 * @function closeAddContactOverlay
 */
function closeAddContactOverlay() {
  const overlay = document.querySelector(".overlay");
  if (overlay) {
    overlay.remove();
  }
}

/**
 * Creates a new contact if the form is valid, and updates the contact list.
 *
 * @function createContact
 */
function createContact() {
  if (validateContactForm()) {
    const newContact = gatherContactFormData();
    saveNewContact(newContact)
      .then(() => {
        closeAddContactOverlay();
        renderContacts();
      })
      .catch((error) => {
        console.error("Error adding contact:", error);
      });
  }
}

/**
 * Saves a new contact to the database.
 *
 * @async
 * @function saveNewContact
 * @param {Object} contact - The contact information to save.
 * @throws {Error} If the HTTP response is not successful.
 */
async function saveNewContact(contact) {
  const response = await fetch(`${API_CONTACTS}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(contact),
  });

  if (!response.ok) {
    throw new Error(`Error saving contact: ${response.status}`);
  }
}

/**
 * Opens an overlay for creating or editing a contact.
 *
 * @function openContactOverlay
 * @param {Object|null} [contactData=null] - The contact data, if in edit mode.
 */
function openContactOverlay(contactData = null) {
  const isEditMode = !!contactData;
  const overlay = document.createElement("div");
  overlay.classList.add("overlay");
  overlay.innerHTML = getContactOverlayTemplate(contactData, isEditMode);
  document.body.appendChild(overlay);
  attachOverlayEventListeners(isEditMode, contactData);
  toggleCreateButton();
}

/**
 * Adds event listeners for input fields in the overlay.
 *
 * @function attachOverlayEventListeners
 * @param {boolean} isEditMode - Indicates whether the function is in edit mode.
 * @param {Object|null} contactData - The contact data in edit mode, otherwise `null`.
 */
function attachOverlayEventListeners(isEditMode, contactData) {
  const nameInput = document.getElementById("contactName");
  const emailInput = document.getElementById("contactEmail");
  const phoneInput = document.getElementById("contactPhone");

  nameInput.addEventListener("input", () => {
    validateName();
    toggleCreateButton();
  });

  emailInput.addEventListener("input", () => {
    validateEmail(isEditMode, contactData ? contactData.email : "");
    toggleCreateButton();
  });

  phoneInput.addEventListener("input", () => {
    validatePhone();
    toggleCreateButton();
  });
}

/**
 * Opens an overlay for creating a new contact.
 *
 * @function openAddContactOverlay
 */
function openAddContactOverlay() {
  openContactOverlay(); // Call without contact data
}

/**
 * Opens an overlay for editing an existing contact.
 *
 * @function openEditContactOverlay
 * @param {Object} contactData - The data of the contact to edit.
 */
function openEditContactOverlay(contactData) {
  openContactOverlay(contactData); // Call with contact data
}
