function renderSortedContacts(contactsDiv, contactDetailsDiv, sortedData) {
  let currentLetter = "";

  sortedData.forEach((entry) => {
    const firstLetter = entry.name[0].toUpperCase();

    if (currentLetter !== firstLetter) {
      currentLetter = firstLetter;
      contactsDiv.appendChild(createLetterHeader(currentLetter));
    }

    const contactDiv = createContactDiv(entry, firstLetter);
    contactsDiv.appendChild(contactDiv);
  });

  const selectedContact = document.querySelector(".contact-item.selected");
  if (!selectedContact) {
    contactDetailsDiv.innerHTML = "<p>Wählen Sie einen Kontakt aus.</p>";
  }
}

function createLetterHeader(letter) {
  const headerDiv = document.createElement("div");
  headerDiv.classList.add("letter-header");
  headerDiv.innerHTML = `<h2>${letter}</h2>`;
  return headerDiv;
}

function createContactDiv(entry, firstLetter) {
  const contactDiv = document.createElement("div");
  contactDiv.classList.add("contact-item");

  contactDiv.innerHTML = `
      <div class="contact-icon" style="background-color: ${getRandomColor()};">
        ${firstLetter}
      </div>
      <div class="contact-details">
        <h3>${entry.name}</h3>
        <a href="mailto:${entry.email}">${entry.email}</a>
      </div>
    `;

  contactDiv.addEventListener("click", () => {
    highlightSelectedContact(contactDiv, entry);
  });

  return contactDiv;
}

function updateContactDetails(contactData) {
  const contactDetailsDiv = document.getElementById("contactDate");
  contactDetailsDiv.innerHTML = createContactDetailsTemplate(contactData);
}

function createContactDetailsTemplate(contactData) {
  return `
      <div class="contact-info">
      <div class="contact-name">
        
        <div class="contact-icon-large" style="background-color: ${getRandomColor()};">
          ${contactData.name[0].toUpperCase()}
        </div>

        <div class=contact-name-actions>
        <h2>${contactData.name}</h2>
        <div class="contact-actions">
          <button class="edit-btn" onclick='openEditContactOverlay(${JSON.stringify(
            contactData
          ).replace(
            /'/g,
            "\\'"
          )})'><img src="../img/SubtasksEdit.png"> Edit </button>
          <button class="delete-bt delete-button" onclick="deleteContact('${
            contactData.id
          }', '${
    contactData.name
  }')"> <img src="../img/SubtasksDel.png"> Delete </button>
        </div>
        </div>
        </div>
        <p class="contact-email"><strong>Email:</strong> <a href="mailto:${
          contactData.email
        }">${contactData.email}</a></p>
        ${
          contactData.telefonnummer
            ? `<p class="contact-telefonnummer"><strong>Telefon:</strong> ${contactData.telefonnummer}</p>`
            : `<p class="contact-telefonnummer" ><strong>Telefon:</strong> Keine Nummer verfügbar</p>`
        }
        
      </div>
    `;
}

function getRandomColor() {
  const hue = Math.floor(Math.random() * 360);
  const saturation = Math.floor(Math.random() * 50) + 50;
  const lightness = Math.floor(Math.random() * 40) + 40;
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

// CSS für Kontakte
function injectContactStyles() {
  const css = `
      .contact-item {
        cursor: pointer;
        transition: background-color 0.3s;
        border-radius: 10px;
      }
      .contact-item.selected {
        background-color: rgb(42, 54, 71) !important;
        color: white;
        
      }
      .contact-icon-large {
        width: 120px;
        height: 120px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 47px;
        color: white;
        font-weight: 500;
      }
    `;
  const style = document.createElement("style");
  style.innerHTML = css;
  document.head.appendChild(style);
}

injectContactStyles();

function getContactOverlayTemplate(contactData, isEditMode) {
  const name = isEditMode ? contactData.name : "";
  const email = isEditMode ? contactData.email : "";
  const phone = isEditMode ? contactData.telefonnummer || "" : "";

  // Wähle, was angezeigt wird: erster Buchstabe oder Bild
  const placeholder = name
    ? `<p style="background-color: ${getRandomColor()};">${name[0].toUpperCase()}</p>`
    : `<img src="../img/personLogo.png" alt="Logo" class="placeholder-image">`;

  return /*html*/`
    <div class="overlay-content">
      <!-- Platzhalter für Bild und Text -->
      <div class="overlay-header">
        <div class="header-style-responsive">
          <img src="../img/Capa2.png" alt="Logo" class="overlay-image">
          <img class="edit-logo addLogo" src="../img/add-contact.png" alt="Add Contact">
        </div>
      </div>
  
      <!-- Erster Buchstabe oder Bild als Platzhalter -->
      <div class="overlay-placeholder">
        ${placeholder}
      </div>
  
      <!-- Formular -->
      <div class="overlay-form">
        <button class="close-overlay-btn" onclick="closeAddContactOverlay()">✖</button>
        <form id="contactForm">
          <div class="input-container">
            <input type="text" id="contactName" value="${name}" placeholder="Name">
            <img src="../img/person.png" alt="Person Icon" class="input-icon">
          </div>
          <p id="errorName" class="error-message"></p>
  
          <div class="input-container">
            <input type="email" id="contactEmail" value="${email}" placeholder="Email">
            <img src="../img/mail.png" alt="Mail Icon" class="input-icon">
          </div>
          <p id="errorEmail" class="error-message"></p>
  
          <div class="input-container">
            <input type="text" id="contactPhone" value="${phone}" placeholder="Telefonnummer">
            <img src="../img/call.png" alt="Phone Icon" class="input-icon">
          </div>
          <p id="errorPhone" class="error-message"></p>
          
          <div class="form-buttons">
            ${
              isEditMode
                ? `<button type="button" class="delete-btn" onclick="deleteContact('${contactData.id}', '${contactData.name}')">Löschen</button>
                   <button type="button" class="save-btn" disabled onclick="saveEditedContact('${contactData.id}')">Speichern</button>`
                : `<button type="button" class="cancel-btn" onclick="closeAddContactOverlay()">Cancel</button>
                   <button type="button" class="create-btn" id="createContactButton" disabled onclick="createContact()">Create contact</button>`
            }
          </div>
        </form>
      </div>
    </div>
  `;
}
