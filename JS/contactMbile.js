/**
 * Hides the content area and displays the contact list for mobile view.
 */
function showContactMobile() {
    document.getElementById('content-area').classList.add('dNone');
    document.getElementById('content-area').classList.remove('d-Block');
    document.getElementById('mycontacts').classList.remove('displayNone');

}

/**
 * Checks the screen size to determine and adjust element visibility for responsive design.
 */
function checkScreenSize() {
    const mobileWidth = 950;
    if (window.matchMedia(`(max-width: ${mobileWidth}px)`).matches) {
        document.getElementById('responsiveContactBackButton').classList.remove('displayNone');
        document.getElementById('mycontacts').classList.add('displayNone');
        document.getElementById('content-area').classList.remove('dNone');
        document.getElementById('content-area').classList.add('d-Block');
    }
}

window.addEventListener('resize', concealMobileElements)


/**
 * Toggles the visibility of the responsive back button based on window width.
 */
function concealMobileElements() {
    if (window.innerWidth > 800) {
        document.getElementById('responsiveContactBackButton').classList.add('displayNone');
    
    } else if (window.innerWidth < 800) {
        document.getElementById('responsiveContactBackButton').classList.remove('displayNone');
    }
}
/**
 * Toggles the display state of the edit/delete menu.
 */

function showEditandDelete() {
    var menu = document.getElementById("editDeleteMenu");
    if (menu.style.display === "none" || menu.style.display === "") {
        menu.style.display = "block";
    } else {
        menu.style.display = "none";
    }
}

/**
 * Hides the edit/delete menu when a click is detected outside of it.
 * 
 * @param {Event} event - The click event object.
 */
window.onclick = function (event) {
    var menu = document.getElementById("editDeleteMenu");
    if(menu){
        if (!event.target.matches('#options_edit_delete')) {
            {
                menu.style.display = "none";
            }
        }
    } 
}

/**
 * Displays a modal with the specified elements and animations.
 * 
 * @param {HTMLElement} PopUpBgElement - The background element for the modal.
 * @param {HTMLElement} show - The content element to display.
 * @param {HTMLElement} header - The header element to animate.
 */
function showModal(PopUpBgElement, show, header) {
    PopUpBgElement.classList.remove('displayNone', 'hide');
    PopUpBgElement.classList.add('show');
    show.classList.remove('slide-out');
    show.classList.add('slide-in');
    header.classList.add('stretch');
}

/**
 * Hides a modal by reversing its animations.
 * 
 * @param {HTMLElement} bgPopUp - The background element for the modal.
 * @param {HTMLElement} popUp - The content element to hide.
 * @param {HTMLElement} header - The header element to animate.
 */
function hideModal(bgPopUp, popUp, header) {
    popUp.classList.remove('slide-in');
    popUp.classList.add('slide-out');
    bgPopUp.classList.remove('show');
    bgPopUp.classList.add('hide');
    setTimeout(() => {
        bgPopUp.classList.add('displayNone');
    }, 500);
    header.classList.remove('stretch');
}

/**
 * Displays an error message for a specific element.
 * 
 * @param {string} errorElementId - The ID of the error message element.
 * @param {string} message - The message to display.
 */
function showErrorMessage(errorElementId, message) {
    const errorElement = document.getElementById(errorElementId);
    errorElement.innerText = message;
    errorElement.style.color = 'red';
    errorElement.style.display = 'block';
}

/**
 * Hides an error message for a specific element.
 * 
 * @param {string} errorElementId - The ID of the error message element.
 */
function hideErrorMessage(errorElementId) {
    const errorElement = document.getElementById(errorElementId);
    errorElement.innerText = '';
}

/**
 * Resets all displayed error messages.
 */
function resetErrorMessages() {
    const errorElements = document.querySelectorAll('.error-message');
    errorElements.forEach(element => {
        element.innerText = '';
        element.style.display = 'none';
    });
}

/**
 * Checks if all fields in the edit form contain values and updates the state of the submit button.
 */
function checkFormFields() {
    const field1 = document.getElementById('editName').value.trim();
    const field2 = document.getElementById('editEmail').value.trim();
    const field3 = document.getElementById('editTel').value.trim();
    const submitButton = document.getElementById('editSubmit');
    submitButton.disabled = !(field1 && field2 && field3);
  }

/**
 * Checks if all fields in the create contact form contain values and updates the state of the submit button.
 */
  function checkFormFields2() {
    const field1 = document.getElementById('name').value.trim();
    const field2 = document.getElementById('email').value.trim();
    const field3 = document.getElementById('tel').value.trim();
    const submitButton = document.getElementById('createSubmit');
    submitButton.disabled = !(field1 && field2 && field3);
  }

/**
 * Resets all displayed error messages for edit form fields.
 */
function resetEditErrorMessages() {
    const errorElements = document.querySelectorAll('.error-message');
    errorElements.forEach(element => {
        element.innerText = '';
    });
}

/**
 * Creates a new contact.
 * 
 * @param {Event} event - The form submit event.
 */
function createNewContact(event) {
    event.preventDefault();
    let name = document.getElementById('name').value;
    let email = document.getElementById('email').value;
    let tel = document.getElementById('tel').value;
     resetErrorMessages();
    let isValid = true;
    pushCreateNewContact(name, email, tel, isValid)
}

/**
 * This function adds contact to the list if valid.
 * 
 * @param {*} name 
 * @param {*} email 
 * @param {*} tel 
 * @param {*} isValid 
 */
function pushCreateNewContact(name, email, tel, isValid){
    if (isValid) {
        let button = document.getElementById("createSubmit");
        button.disabled = true;
        const nextColor = selectNextColor();
        let data = {'name': name, 'email': email, 'telefonnummer': tel, 'color': nextColor};
        contactList.push(data);
        submitContact('contact');
        openClosePopUp('close');
    }
}

/**
 * Prevents form submission for specified form types.
 * 
 * @param {string} key - The form type key ('new' or 'update').
 */
function preventFormSubmit(key) {
    let target;
    if (key == 'new') {
        target = 'addContactForm';
    } else if (key == 'update') {
        target = 'editContactForm';
    }
    document.getElementById(target), addEventListener('submit', function (event) {
        event.preventDefault();
    });
}

/**
 * Fetches data from the server and updates `storedData`.
 * Displays contacts and updates the color counter if data is retrieved successfully.
 * 
 * @async
 * @function
 */
async function fetchData() {
    storedData = [];
    try {
        let returnValue = await fetch(BASE_URL + '.json');
        let returnValueAsJson = await returnValue.json();
        let info = returnValueAsJson.contact;
        storedData.push(returnValueAsJson.contact);
        displayContacts(info);
        let colorCounterResponse = await fetch(BASE_URL + 'colorIndex.json');
        let colorCounterData = await colorCounterResponse.json();
        if (colorCounterData !== null) {
            colorCounter = colorCounterData;
        }
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

/**
 * Removes a contact from the server and updates the contact list.
 * 
 * @async
 * @param {string} [path='contact'] - The endpoint path for deleting the contact.
 * @param {string} id - The ID of the contact to remove.
 */
async function removeContact(path = 'contact', id) {
    try {
        const url = `${BASE_URL}${path}/${id}.json`;
        let response = await fetch(url, {
            method: "DELETE",
            headers: {
                "content-type": "application/json", },
        });
        if (!response.ok) {
            throw new Error('Löschfehler des Kontakts');}
        await fetchData();
        clearDetailedView();       
        currentEditKey = null;
    } catch (error) {
        console.error('Löschfehler des Kontakts:', error.message);
    }
}

/**
 * Submits contact data to the server.
 * 
 * @async
 * @param {string} path - The server endpoint path for submission.
 */
async function submitContact(path) {
    for (const element of contactList) {
        selectedContact = element;
        saveHighlight();
        const response = await fetch(`${BASE_URL}${path}.json`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(element)
        });
        response.ok ? updateColorCounter() : console.error('Failed to save contact');
    }
    fetchData();
}

/**
 * Applies highlight to a newly added contact.
 */
function applyNewContactHighlight() {
    let serializedContact = localStorage.getItem('highlightKey')
    if (serializedContact === null) {
        return
    } else
        selectedContact = JSON.parse(serializedContact)
    currentEditKey = findContactInStoredData();
    showDetailedContact(currentEditKey);
    localStorage.removeItem('highlightKey');
}

/**
 * Opens or closes a popup window based on the provided parameter.
 * 
 * @param {string} param - The action ('open' or 'close') to perform.
 * @param {boolean} key - Whether to validate a specific popup type.
 */
function openClosePopUp(param, key) {
    concealMobileElements();
    let target = validatePopUp(key);
    let bgPopUp = document.getElementById(target);
    let popUp = bgPopUp.querySelector('.popUp');
    let header = document.getElementById('header');
    if (param === 'open') {
        showModal(bgPopUp, popUp, header);
    } else if (param === 'close') {
        hideModal(bgPopUp, popUp, header)
    } else {
        param.stopPropagation();
    }

}