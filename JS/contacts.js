const ContactsURL =
  "https://join-388-default-rtdb.europe-west1.firebasedatabase.app/";
const ContactSaveURL =
  "https://join-388-default-rtdb.europe-west1.firebasedatabase.app/contacts.json";

async function loadContacts() {
  try {
    let response = await fetch(ContactsURL + "contacts.json");
    if (!response.ok) {
      throw new Error(`Error: ${response.status} - ${response.statusText}`);
    }
    const data = await response.json();

    renderContacts(Object.values(data));
  } catch (error) {}

  submitContact("contact");
}

function renderContacts(allContacts) {
  let contactCard = document.getElementById("contactsId");
  contactCard.innerHTML = "";
  for (let i = 0; i < allContacts.length; i++) {
    const contact = allContacts[i];

    const name = contact.name || "No Name";
    const email = contact.email || "No Email";
    const phone = contact.phone || "No Phone";

    contactCard.innerHTML += showRenderedContactsMainData(i, {
      name,
      email,
      phone,
    });
  }
}

function showRenderedContactsMainData(index, contact) {
  return /*html*/ `
    <div onclick="openContact(${index})">
      <div class="contact-name">
        <h3>${contact.name}</h3>
      </div>
      <div class="contact-details">
        <span>Email: ${contact.email}</span>
        <span>Phone: ${contact.phone}</span>
      </div>
    </div>`;
}

function appendContactToUI(contact) {
  const contactCard = document.getElementById("contactId");
  contactCard.innerHTML += showRenderedContactsMainData(contact.id, contact);
}

// beni , contact in firebase hinzufügen//
// Funktion zum Speichern von Benutzerdaten in Firebase
async function saveUserData(name, email, phone) {
  try {
    const response = await fetch(ContactSaveURL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        email,
        phone,
      }),
    });
    if (!response.ok) {
      throw new Error("Fehler beim Speichern der Benutzerdaten");
    }
    const result = await response.json(); // Enthält die ID des neuen Eintrags
    console.log("Benutzerdaten erfolgreich gespeichert:", result);

    return { id: result.name, name, email, phone };
  } catch (error) {
    console.error("Fehler beim Speichern der Benutzerdaten:", error);
    throw error;
  }
}

// Funktion zum Abrufen von Benutzerdaten aus Firebase
async function getUserData(email) {
  try {
    const response = await fetch(ContactSaveURL);
    const usersData = await response.json();

    for (const userId in usersData) {
      const user = usersData[userId];
      if (user.email === email) {
        return user;
      }
    }
    return null;
  } catch (error) {
    console.error("Fehler beim Abrufen der Benutzerdaten:", error);
    return null;
  }
}

/**
 * Stores the list of contacts.
 * @type {Array}
 */
let contactList = [];

/**
 * Stores fetched data.
 * @type {Array}
 */
let storedData = [];
/**
 * Counter to manage color selection.
 * @type {number}
 */
let colorCounter = 0;
/**
 * List of generated colors.
 * @type {Array}
 */
let generatedColors = [];
/**
 * Holds the key of the contact currently being edited.
 * @type {string|null}
 */
let currentEditKey = null;
/**
 * Holds the contact currently selected.
 * @type {Object|null}
 */
let selectedContact = null;
/**
 * An array of available colors for display.
 * @type {Array}
 */

const availableColors = generateColorPalette(20);

/**
 * Displays a list of contacts by rendering it into the DOM.
 *
 * @param {Object} contactData - The contact data to display.
 */
function displayContacts(contactData) {
  let container = document.getElementById("contactsId");
  container.innerHTML = "";
  const sortedGroups = categorizeContacts(contactData);
  const sortedLetters = Object.keys(sortedGroups).sort();
  sortedLetters.forEach((letter) => {
    createContactGroup(container, letter, sortedGroups[letter]);
  });
  applyNewContactHighlight();
  //   highlightContactList();
}

/**
 * Organizes contacts into groups by the first letter of their names.
 *
 * @param {Object} contactData - The contact data to categorize.
 * @returns {Object} An object where keys are letters and values are arrays of contacts.
 */
function categorizeContacts(contactData) {
  const organizedContacts = Object.keys(contactData).reduce((groups, id) => {
    const firstLetter = contactData[id].name[0].toUpperCase();
    groups[firstLetter] = groups[firstLetter] || [];
    groups[firstLetter].push({ id, ...contactData[id] });
    return groups;
  }, {});
  Object.keys(organizedContacts).forEach((letter) =>
    organizedContacts[letter].sort((a, b) => a.name.localeCompare(b.name))
  );
  return organizedContacts;
}

/**
 * Creates and displays a contact group for a specific letter.
 *
 * @param {HTMLElement} container - The container element for displaying contacts.
 * @param {string} letter - The letter grouping the contacts.
 * @param {Array} contacts - The contacts associated with the letter.
 */
function createContactGroup(container, letter, contacts) {
  container.innerHTML += `<h3 class="letter">${letter}</h3>`;
  contacts.forEach((contact) => {
    displayContact(container, contact);
  });
}

/**
 * Renders a contact card into the specified container.
 *
 * @param {HTMLElement} container - The container element.
 * @param {Object} contact - The contact data to display.
 */
function displayContact(container, contact) {
  const contactShade = contact.color || getRandomHexColor();
  container.innerHTML += `
        <div onclick="showDetailedContact('${contact.id}')" id="${contact.id}" class="contactCard">
             <div id="letter${contact.id}" class="one_letter" style="background-color: ${contactShade};">${contact.name[0]}</div>
             <div class="fullName-email">
               <span>${contact.name}</span>
               <a class="email" href="#">${contact.email}</a>
             </div>
        </div>
    `;
}

/**
 * Modifies contact details based on input values.
 *
 * @returns {Object} An object containing modified contact details.
 */
function modifyContactDetails() {
  let name = document.getElementById("editName");
  let email = document.getElementById("editEmail");
  let tel = document.getElementById("editTel");

  let data = {
    name: name.value,
    email: email.value,
    telefonnummer: tel.value,
  };
  return data;
}

/**
 * Clears the detailed contact view.
 */
function clearDetailedView() {
  const target = document.getElementById("content");
  if (target) {
    target.innerHTML = "";
  }
}

/**
 * Returns the initials of a given name.
 *
 * @param {string} name - The name to get initials from.
 * @returns {string} The initials of the name.
 */
function getInitials(name) {
  return name
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase())
    .join(" ");
}

let saveId = "";
/**
 * Displays detailed information for a selected contact.
 *
 * @param {string} contactId - The ID of the contact to display.
 */
function showDetailedContact(contactId) {
  saveId = contactId;
  let root = storedData[0][contactId];
  if (currentEditKey !== null) {
    document.getElementById(currentEditKey).classList.remove("blueBackground");
  }

  currentEditKey = contactId;
  document.getElementById(currentEditKey).classList.add("blueBackground");
  let target = document.getElementById("content");
  target.innerHTML = contactInfoHtml(root, contactId);
  setEditPopupContent(root);
  checkScreenSize();
  applyBackgroundColor(contactId);
}

/**
 * Updates and redisplays contact details.
 */
function updateDetail() {
  showDetailedContact(`${saveId}`);
}

/**
 * Sets the content of the edit popup for a contact.
 *
 * @param {Object} root - The contact data to populate the popup.
 */
function setEditPopupContent(root) {
  document.getElementById("letterForPopUp").innerHTML = `${root["name"][0]}`;
  document.getElementById("editName").value = root["name"];
  document.getElementById("editEmail").value = root["email"];
  document.getElementById("editTel").value = root["telefonnummer"];
}

/**
 * Applies a background color to a contact's profile display element.
 *
 * @param {string} contactId - The ID of the contact to style.
 */
function applyBackgroundColor(contactId) {
  let root = storedData[0][contactId];
  let profileLetterElement = document.getElementById("singleLetterProfile");
  if (profileLetterElement) {
    let contactShade = root.color || getRandomHexColor();
    profileLetterElement.style.backgroundColor = contactShade;
  }
}

/**
 * Generates a color palette.
 *
 * @param {number} numberColors - The number of colors to generate.
 * @returns {Array} An array of hex color strings.
 */
function generateColorPalette(numberColors) {
  const availableColors = [];
  const hexValuesForColor = "0123456789ABCDEF";
  const textContrastLevel = 40;
  for (let i = 0; i < numberColors; i++) {
    let color;
    let brightness;
    do {
      color = "#";
      for (let j = 0; j < 6; j++) {
        color += hexValuesForColor[Math.floor(Math.random() * 16)];
      }
      brightness = calculateBrightness(color);
    } while (brightness < textContrastLevel);
    availableColors.push(color);
  }
  return availableColors;
}

function selectNextColor() {
  const color = availableColors[colorCounter % availableColors.length];
  colorCounter++;
  updateColorCounter();
  return color;
}

/**
 * Updates the color counter on the server.
 */
function updateColorCounter() {
  fetch(BASE_URL + "colorIndex.json", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(colorCounter),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to update color index");
      }
    })
    .catch((error) => console.error("Error updating color index:", error));
}

/**
 * Saves the currently selected contact highlight to local storage.
 */
function saveHighlight() {
  let serializedContact = JSON.stringify(selectedContact);
  localStorage.setItem("highlightKey", serializedContact);
}

/**
 * Finds a contact in the stored data based on the selected contact's name.
 *
 * @returns {string} The key of the matching contact.
 */
function findContactInStoredData() {
  let contactData = storedData[0];

  for (const key in contactData) {
    if (contactData[key].name === selectedContact["name"]) {
      return key;
    }
  }
}

/**
 * Validates which popup background to use based on the key.
 *
 * @param {boolean} key - Indicator of which popup background to use.
 * @returns {string} The ID of the target background element.
 */
function validatePopUp(key) {
  return key ? "EditModalBackground" : "modalBackground";
}
/**
 * Generates a random hex color.
 *
 * @returns {string} A random hex color string.
 */
function getRandomHexColor() {
  const letters = "89ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * letters.length)];
  }
  return color;
}

/**
 * Highlights the contact list element by applying a CSS class.
 */

// function highlightContactList() {
//   document.getElementById("link-contact").classList.add("bg-focus");
// }

/**
 * Generates HTML for displaying contact information.
 *
 * @param {Object} root - The contact data to display.
 * @param {string} contactId - The ID of the contact.
 * @returns {string} The generated HTML string for the contact profile.
 */
function contactInfoHtml(root, contactId) {
  return `
        <div class="contact-profile">
            <div id="singleLetterProfile" class="single-letter">${root["name"][0]}</div>
            <div class="h4_edit-delete">
                <h4>${root["name"]}</h4>
                <div class="edit-delete">
                    <span onclick="openClosePopUp('open', true)"><img src="../img/SubtasksEdit.png"/>Edit</span>
                    <span onclick="removeContact('contact', '${contactId}')"><img src="../img/SubtasksDel.png" />Delete</span>
                </div>
            </div>
        </div>
        <span class="contactInformation">Contact Information</span>
        <div class="pers-info">
            <b>Email</b>
            <a href="#">${root["email"]}</a>
        </div>
        <div class="pers-info">
            <span><b>Phone</b></span>
            <span>${root["telefonnummer"]}</span>
        </div>

        <div id="editDeleteMenu">
      
        <a href="#" onclick="openClosePopUp('open', true)"><img src="imgs/icon_edit.png"/>Edit</a>
        <a href="#" onclick="removeContact('contact', '${contactId}')"><img src="imgs/icon_trash.png" />Delete</a>
    </div>

    `;
}

/**
 * Calculates the brightness of a hex color.
 *
 * @param {string} color - The hex color string.
 * @returns {number} The calculated brightness value.
 */
function calculateBrightness(color) {
  let hex = color.substring(1);
  let r = parseInt(hex.substring(0, 2), 16);
  let g = parseInt(hex.substring(2, 4), 16);
  let b = parseInt(hex.substring(4, 6), 16);
  const [h, s, l] = rgbToHsl(r, g, b);
  return l;
}

/**
 * Converts RGB values to HSL.
 *
 * @param {number} r - The red component (0-255).
 * @param {number} g - The green component (0-255).
 * @param {number} b - The blue component (0-255).
 * @returns {Array} An array containing HSL values.
 */
function rgbToHsl(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b),
    min = Math.min(r, g, b);
  let h = 0,
    s,
    l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    h =
      max === r
        ? (g - b) / d + (g < b ? 6 : 0)
        : max === g
        ? (b - r) / d + 2
        : (r - g) / d + 4;
    h /= 6;
  } else s = 0;
  return [h * 360, s * 100, l * 100];
}
