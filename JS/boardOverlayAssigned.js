const USERS_API_URL =
  "https://join-388-default-rtdb.europe-west1.firebasedatabase.app/users.json";
const CONTACTS_API_URL =
  "https://join-388-default-rtdb.europe-west1.firebasedatabase.app/contact.json";

/**
 * List of selected contacts.
 */
let selectedContacts = [];
let currentTaskId = null; // Stores the current task ID

/**
 * Closes the dropdown when clicking outside of it.
 */
document.addEventListener("click", (event) => {
  const dropdown = document.querySelector(".dropdown");
  if (!dropdown.contains(event.target)) {
    document.getElementById("dropdownMenu").classList.add("d-none");
  }
});

/**
 * Populates the dropdown with loaded contacts.
 * @param {Array} contacts - The list of loaded contacts.
 * @param {Array} [assignedContacts=[]] - List of already assigned contacts (optional).
 */
function populateDropdown(contacts, assignedContacts = []) {
  const dropdownMenu = document.getElementById("dropdownMenu");
  dropdownMenu.innerHTML = "";

  contacts.forEach((contact) => {
    const contactElement = createDropdownItem(contact, assignedContacts);
    dropdownMenu.appendChild(contactElement);
  });
}

/**
 * Creates a dropdown item for a contact.
 * @param {Object} contact - The contact object.
 * @param {Array} assignedContacts - List of assigned contacts.
 * @returns {HTMLElement} The dropdown item element.
 */
function createDropdownItem(contact, assignedContacts) {
  const contactElement = document.createElement("label");
  contactElement.className = "dropdown-item";

  const checkbox = createCheckbox(contact.name);
  checkbox.checked = assignedContacts.includes(contact.name);

  checkbox.onchange = () => handleCheckboxChange(checkbox, contact.name);

  const button = createContactButton(contact.name);

  contactElement.appendChild(checkbox);
  contactElement.appendChild(button);
  contactElement.appendChild(document.createTextNode(contact.name));

  updateDropdownStyle(contactElement, checkbox.checked);

  return contactElement;
}

/**
 * Handles the change event for a contact checkbox.
 * @param {HTMLElement} checkbox - The checkbox element.
 * @param {string} contactName - The name of the contact.
 */
function handleCheckboxChange(checkbox, contactName) {
  if (checkbox.checked) {
    addToSelectedContacts(contactName);
  } else {
    removeFromSelectedContacts(contactName);
  }

  updateSelectedContactsDisplay();
  updateTaskAssignments(selectedContacts);
}

/**
 * Adds a contact to the selected contacts list.
 * @param {string} contactName - The name of the contact.
 */
function addToSelectedContacts(contactName) {
  if (!selectedContacts.includes(contactName)) {
    selectedContacts.push(contactName);
  }
}

/**
 * Removes a contact from the selected contacts list.
 * @param {string} contactName - The name of the contact.
 */
function removeFromSelectedContacts(contactName) {
  const index = selectedContacts.indexOf(contactName);
  if (index > -1) {
    selectedContacts.splice(index, 1);
  }
}

/**
 * Updates the list of selected contacts.
 * @param {string} contactName - The name of the contact.
 * @param {boolean} isChecked - Whether the contact is selected.
 */
function updateSelectedContacts(contactName, isChecked) {
  updateContactSelection(contactName, isChecked);
  refreshSelectedContactsDisplay();

  if (currentTaskId) {
    updateTaskAssignmentsInData();
  }
}

/**
 * Adds or removes a contact from the selected list.
 * @param {string} contactName - The name of the contact.
 * @param {boolean} isChecked - Whether the contact is selected.
 */
function updateContactSelection(contactName, isChecked) {
  if (isChecked) {
    if (!selectedContacts.includes(contactName)) {
      selectedContacts.push(contactName);
    }
  } else {
    removeContactFromSelection(contactName);
  }
}

/**
 * Removes a contact from the selected list.
 * @param {string} contactName - The name of the contact.
 */
function removeContactFromSelection(contactName) {
  const index = selectedContacts.indexOf(contactName);
  if (index > -1) {
    selectedContacts.splice(index, 1);
  }
}

/**
 * Refreshes the display of selected contacts.
 */
function refreshSelectedContactsDisplay() {
  const selectedContactsContainer = document.getElementById("selectedContacts");
  renderSelectedContacts(selectedContactsContainer);
}

/**
 * Updates the assigned contacts in the task data.
 */
function updateTaskAssignmentsInData() {
  const task = allTasksData.find((task) => task.id === currentTaskId);
  if (task) {
    task.assignedTo = [...selectedContacts];
  }
}

/**
 * Loads the assignments of a specific task and marks the assigned contacts.
 * @param {string} taskId - The ID of the task.
 */
async function loadTaskAssignments(taskId) {
  currentTaskId = taskId;

  try {
    const task = await fetchTaskData(taskId);
    if (!task) return handleMissingTask();

    selectedContacts = task.assignedTo || [];
    console.log("Selected contacts for this task:", selectedContacts);

    syncDropdownWithSelectedContacts();
  } catch (error) {
    console.error("Error loading task assignments:", error);
  }
}

/**
 * Fetches task data from the API.
 * @param {string} taskId - The ID of the task.
 * @returns {Promise<Object|null>} The task data or null if not found.
 */
async function fetchTaskData(taskId) {
  const response = await fetch(
    `https://join-388-default-rtdb.europe-west1.firebasedatabase.app/tasks/${taskId}.json`
  );

  if (!response.ok) {
    console.error("Failed to load task data");
    return null;
  }

  return await response.json();
}

/**
 * Handles the case when a task is missing or null.
 */
function handleMissingTask() {
  console.warn("Task not found or response is null");
}

/**
 * Synchronizes the dropdown with the selected contacts.
 */
function syncDropdownWithSelectedContacts() {
  const dropdownMenu = document.getElementById("dropdownMenu");
  const checkboxes = dropdownMenu.querySelectorAll("input[type='checkbox']");

  checkboxes.forEach((checkbox) => {
    checkbox.checked = selectedContacts.includes(checkbox.value);
  });
}

/**
 * Initializes the loading of contacts and the specific task.
 */
document.addEventListener("DOMContentLoaded", async () => {
  const taskId = "OF604eP7v0MtTlC5Del";
  await loadContacts();
});

/**
 * Renders the dropdown menu with the loaded contacts.
 *
 * @param {Array} contacts - List of contacts.
 * @param {HTMLElement} dropdownMenu - The dropdown menu element.
 * @param {Array} assignedContacts - The list of already assigned contacts.
 */
function renderContactsDropdown(contacts, dropdownMenu, assignedContacts = []) {
  dropdownMenu.innerHTML = "";

  contacts.forEach((contact) => {
    const label = createDropdownLabel(contact, assignedContacts);
    dropdownMenu.appendChild(label);
  });
}

/**
 * Creates a dropdown label for a contact.
 *
 * @param {Object} contact - The contact object.
 * @param {Array} assignedContacts - List of assigned contacts.
 * @returns {HTMLElement} The created label element.
 */
function createDropdownLabel(contact, assignedContacts) {
  const label = document.createElement("label");
  label.className = "dropdown-item";
  label.style.display = "flex";
  label.style.alignItems = "center";
  label.style.padding = "10px";

  const checkbox = createContactCheckbox(contact, assignedContacts, label);
  const button = createContactButton(contact.name);

  label.appendChild(checkbox);
  label.appendChild(button);
  label.appendChild(document.createTextNode(contact.name));

  return label;
}

/**
 * Creates a checkbox for a contact.
 *
 * @param {Object} contact - The contact object.
 * @param {Array} assignedContacts - List of assigned contacts.
 * @param {HTMLElement} label - The parent label element.
 * @returns {HTMLElement} The created checkbox element.
 */
function createContactCheckbox(contact, assignedContacts, label) {
  const checkbox = createCheckbox(contact.name);
  checkbox.checked = assignedContacts.includes(contact.name);

  updateDropdownStyle(label, checkbox.checked);

  checkbox.onchange = () => {
    handleCheckboxChange(checkbox, contact.name, assignedContacts, label);
  };

  return checkbox;
}

/**
 * Handles the checkbox change event.
 *
 * @param {HTMLElement} checkbox - The checkbox element.
 * @param {string} contactName - The name of the contact.
 * @param {Array} assignedContacts - The assigned contacts array.
 * @param {HTMLElement} label - The label element.
 */
function handleCheckboxChange(checkbox, contactName, assignedContacts, label) {
  updateDropdownStyle(label, checkbox.checked);

  if (checkbox.checked) {
    addToAssignedContacts(contactName, assignedContacts);
  } else {
    removeFromAssignedContacts(contactName, assignedContacts);
  }

  renderSelectedContacts(document.getElementById("selectedContacts"));
}

/**
 * Adds a contact to the assigned contacts list.
 *
 * @param {string} contactName - The name of the contact.
 * @param {Array} assignedContacts - The assigned contacts array.
 */
function addToAssignedContacts(contactName, assignedContacts) {
  if (!assignedContacts.includes(contactName)) {
    assignedContacts.push(contactName);
  }
}

/**
 * Removes a contact from the assigned contacts list.
 *
 * @param {string} contactName - The name of the contact.
 * @param {Array} assignedContacts - The assigned contacts array.
 */
function removeFromAssignedContacts(contactName, assignedContacts) {
  const index = assignedContacts.indexOf(contactName);
  if (index > -1) {
    assignedContacts.splice(index, 1);
  }
}

/**
 * Adds a contact to the selected contacts list.
 *
 * @param {string} name - Name of the contact.
 * @param {HTMLElement} button - Button for the contact.
 */
function addContact(name, button) {
  if (!selectedContacts.includes(name)) {
    selectedContacts.push(name);
    renderSelectedContacts();
  }
}

/**
 * Removes a contact from the selected contacts list.
 *
 * @param {string} name - Name of the contact.
 */
function removeContact(name) {
  selectedContacts = selectedContacts.filter((contact) => contact !== name);
  renderSelectedContacts();
}

/**
 * Renders the selected contacts with a maximum visible count.
 *
 * @param {HTMLElement} container - The container displaying the selected contacts.
 */
function renderSelectedContacts(container) {
  const maxVisible = 3;
  container.innerHTML = "";

  selectedContacts.slice(0, maxVisible).forEach((contactName) => {
    const initials = contactName
      .split(" ")
      .map((namePart) => namePart[0].toUpperCase())
      .join("");

    const randomColor = generateColorFromLetter(contactName.charAt(0));

    const participantElement = document.createElement("span");
    participantElement.classList.add("participant");
    participantElement.style.backgroundColor = randomColor;
    participantElement.innerText = initials;

    container.appendChild(participantElement);
  });

  const extraCount = selectedContacts.length - maxVisible;
  if (extraCount > 0) {
    const extraCountElement = document.createElement("span");
    extraCountElement.classList.add("participant", "extra-count");
    extraCountElement.innerText = `+${extraCount}`;
    container.appendChild(extraCountElement);
  }
}

/**
 * Deselects a contact from the selected contacts list.
 *
 * @param {string} contactName - The name of the contact to be removed.
 */
function deselectContact(contactName) {
  selectedContacts = selectedContacts.filter((name) => name !== contactName);

  const checkboxes = document.querySelectorAll(".dropdown-item input");
  checkboxes.forEach((checkbox) => {
    if (checkbox.value === contactName) {
      checkbox.checked = false;
    }
  });

  const selectedContactsContainer = document.getElementById("selectedContacts");
  populateEditTaskForm(selectedContactsContainer);
}

/**
 * Generates a color based on the first letter of a name.
 *
 * @param {string} letter - The first letter of the name.
 * @returns {string} The generated color in HSL format.
 */
function generateColorFromLetter(letter) {
  const charCode = letter.toUpperCase().charCodeAt(0);
  const hue = (charCode - 65) * 15;
  return `hsl(${hue}, 70%, 50%)`;
}

/**
 * Populates the edit task form with task data.
 *
 * @param {Object} task - The task data to be edited.
 */
function populateEditTaskForm(task) {
  document.getElementById("edit-title").value = task.title || "";
  document.getElementById("edit-description").value = task.description || "";
  document.getElementById("edit-due-date").value = task.dueDate || "";
  document.getElementById("edit-priority").value = task.prio || "Medium";

  selectedContacts = task.assignedTo || [];

  updateSelectedContactsDisplay();
  const selectedContactsContainer = document.getElementById("selectedContacts");
  selectedContactsContainer.innerHTML = "";

  if (task.assignedTo && task.assignedTo.length > 0) {
    const visibleParticipants = task.assignedTo.slice(0, 3);
    const remainingCount = task.assignedTo.length - visibleParticipants.length;

    visibleParticipants.forEach((person) => {
      const initials = person
        .split(" ")
        .map((namePart) => namePart[0].toUpperCase())
        .join("");

      const randomColor = getRandomColor();

      const participantElement = document.createElement("span");
      participantElement.classList.add("participant");
      participantElement.style.backgroundColor = randomColor;
      participantElement.innerText = initials;

      selectedContactsContainer.appendChild(participantElement);
    });

    if (remainingCount > 0) {
      const extraCountElement = document.createElement("span");
      extraCountElement.classList.add("participant", "extra-count");
      extraCountElement.innerText = `+${remainingCount}`;
      selectedContactsContainer.appendChild(extraCountElement);
    }
  } else {
    selectedContactsContainer.innerHTML = `<p>No contacts assigned</p>`;
  }
}

/**
 * Updates the display of selected contacts.
 */
function updateSelectedContactsDisplay() {
  const selectedContactsContainer = document.getElementById("selectedContacts");

  selectedContactsContainer.innerHTML = "";

  const maxVisible = 3;
  const visibleContacts = selectedContacts.slice(0, maxVisible);

  visibleContacts.forEach((contactName) => {
    const initials = contactName
      .split(" ")
      .map((namePart) => namePart[0].toUpperCase())
      .join("");

    const randomColor = generateColorFromLetter(contactName.charAt(0));

    const participantElement = document.createElement("span");
    participantElement.classList.add("participant");
    participantElement.style.backgroundColor = randomColor;
    participantElement.innerText = initials;

    selectedContactsContainer.appendChild(participantElement);
  });

  const extraCount = selectedContacts.length - maxVisible;
  if (extraCount > 0) {
    const extraCountElement = document.createElement("span");
    extraCountElement.classList.add("participant", "extra-count");
    extraCountElement.innerText = `+${extraCount}`;
    selectedContactsContainer.appendChild(extraCountElement);
  }
}
