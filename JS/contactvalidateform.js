/**
 * Validates a given phone number string.
 * 
 * @param {string} variable - The field variable to confirm.
 * @param {string or number}  value - Object string to validate. 
 * @returns {boolean} True if the object is valid, false otherwise.
 */
function validateInput(variable, value) {
    if (variable === "name" || variable === "editName") {
        const namePattern = /^[^\s@]+@[^\s@]+\.[a-z]{2,3}(\.[a-z]{2})?$/;
        return value.length >= 2 && namePattern.test(value);
    }
    if (variable === "email" || variable === "editEmail") {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[a-z]{2,3}(\.[a-z]{2})?$/;
        return emailPattern.test(value);
    }
    if (variable === "tel" || variable === "editTel") {
        const phonePattern = /^\+[1-9][0-9]{1,14}$/;
        return phonePattern.test(value);
    }
    return false;
}

/**
 * Modifies an existing contact, validates form inputs.
 * 
 * @param {Event} event - The form submit event.
 */
async function modifyContact(event) {
    event.preventDefault();
    resetEditErrorMessages();
    let isValid = true;
    if (validateEditField('editName')) {
        isValid = false;}
    if (validateEditField('editEmail')) {
        isValid = false;}
    if (validateEditField('editTel')) {
        isValid = false;}
    if (isValid) {editContact();}
}


/**
 * This function updates contact information.
 * 
 */
async function editContact() {
    let button = document.getElementById("editSubmit");
        button.disabled = true;
        preventFormSubmit('update');
        contactList.length = 0;
        contactList.push(modifyContactDetails());
        const response = await fetch(`${BASE_URL}contact/${currentEditKey}.json`, {
            method: "PUT", headers: {"content-type": "application/json",},
            body: JSON.stringify(contactList[0]),});
        openClosePopUp('close', key = true);
        await fetchData();
        updateDetail();
        button.disabled = false;
}

/**
 * Validates and displays the edit name input.
 */
function validateEditField(fieldID) {
    let errottext = checkErrorText(fieldID);
    let name = document.getElementById(`${fieldID}`).value;
    if (!validateInput(fieldID, name)) {
        showErrorMessage(`${fieldID}Error`, `${errottext}`);
    } else {
        hideErrorMessage(`${fieldID}Error`);
    }
    // updateeditSubmitButtonState();  
}

function validateRealTimeTelInput() {
    let telInput = document.getElementById("tel");
    telInput.value = telInput.value.replace(/[^0-9+]/g, ''); // Entfernt alles außer Zahlen und Plus
    if (!telInput.value.startsWith('+')) {
        telInput.value = '+' + telInput.value.replace(/\+/g, ''); // Stellt sicher, dass "+" nur am Anfang ist
    }
}

function validateRealTimeEmailInput() {
    let emailInput = document.getElementById("email");  
    let emailValue = emailInput.value;
    
    // Highlight invalid parts or provide live feedback
    const emailPattern = /^[^\s@]+@[^\s@]+\.[a-z]{2,3}(\.[a-z]{2})?$/;
    if (!emailPattern.test(emailValue)) {
        showErrorMessage("emailError", "Invalid email format.");
    } else {
        hideErrorMessage("emailError");
    }
}


/**
 * This function check wich Error massage to use.
 * 
 * @param {string} fieldID - The ID from the input field.
 * @returns 
 */
function checkErrorText(fieldID) {
    if (fieldID == "editName" || fieldID === "name") {
        return "Please enter a valid name.";
    } else if (fieldID == "editEmail" || fieldID === "email") {
        return "Please enter a valid email address (e.g., example@domain.de, user@domain.co.uk).";
    } else if (fieldID == "editTel" || fieldID === "tel") {
        return "Please enter a valid telephone number (starting with +).";
    }
}




