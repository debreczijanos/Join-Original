/**
 * Toggles the dropdown menu (open/close).
 */
function toggleDropdown() {
  const dropdownMenu = document.getElementById("dropdownMenu");

  if (dropdownMenu.classList.contains("d-none")) {
    dropdownMenu.classList.remove("d-none");
    dropdownMenu.style.display = "block";
  } else {
    dropdownMenu.classList.add("d-none");
    dropdownMenu.style.display = "none";
  }
}

/**
 * Creates a checkbox element.
 *
 * @param {string} name - Name of the contact.
 * @returns {HTMLInputElement} The created checkbox.
 */
function createCheckbox(name) {
  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.value = name;
  return checkbox;
}

/**
 * Generates a color based on the first letter of a name.
 *
 * @param {string} letter - The first letter of the name.
 * @returns {string} The generated color.
 */
function generateColorFromLetter(letter) {
  const charCode = letter.toUpperCase().charCodeAt(0);
  const hue = (charCode - 65) * 15;
  return `hsl(${hue}, 70%, 50%)`;
}

/**
 * Updates the style of a dropdown label based on its selection state.
 *
 * @param {HTMLElement} contactElement - The contact element.
 * @param {boolean} isChecked - Whether the contact is selected.
 */
function updateDropdownStyle(contactElement, isChecked) {
  contactElement.style.backgroundColor = isChecked ? "#2A3647" : "#f9f9f9";
  contactElement.style.color = isChecked ? "#ffffff" : "#000000";

  if (!isChecked) {
    contactElement.onmouseover = () => setDropdownHover(contactElement, true);
    contactElement.onmouseout = () => setDropdownHover(contactElement, false);
  } else {
    contactElement.onmouseover = null;
    contactElement.onmouseout = null;
  }
}

/**
 * Sets hover styles for the dropdown.
 *
 * @param {HTMLElement} element - The contact element.
 * @param {boolean} isHover - Whether the element is hovered.
 */
function setDropdownHover(element, isHover) {
  element.style.backgroundColor = isHover ? "#a8a3a666" : "#f9f9f9";
  element.style.color = "#000000";
}

/**
 * Updates task assignments in the backend.
 *
 * @param {string[]} updatedAssignments - The updated list of assigned contacts.
 */
async function updateTaskAssignments(updatedAssignments) {
  try {
    await fetch(
      `https://join-388-default-rtdb.europe-west1.firebasedatabase.app/tasks/${currentTaskId}/assignedTo.json`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedAssignments),
      }
    );
  } catch {}
}

/**
 * Creates a button with the initial of the contact's name.
 *
 * @param {string} name - Name of the contact.
 * @returns {HTMLButtonElement} The created button.
 */
function createContactButton(name) {
  const button = document.createElement("button");
  button.textContent = name.charAt(0).toUpperCase();
  button.style.marginRight = "10px";
  button.style.width = "30px";
  button.style.height = "30px";
  button.style.borderRadius = "50%";
  button.style.backgroundColor = generateColorFromLetter(name.charAt(0));
  button.style.color = "#ffffff";
  button.style.border = "none";
  return button;
}
