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
  if (isChecked) {
    contactElement.style.backgroundColor = "#2A3647";
    contactElement.style.color = "#ffffff";

    contactElement.onmouseover = null;
    contactElement.onmouseout = null;
  } else {
    contactElement.style.backgroundColor = "#f9f9f9";
    contactElement.style.color = "#000000";

    contactElement.onmouseover = () => {
      contactElement.style.backgroundColor = "#a8a3a666";
      contactElement.style.color = "#000000";
    };

    contactElement.onmouseout = () => {
      contactElement.style.backgroundColor = "#f9f9f9";
      contactElement.style.color = "#000000";
    };
  }
}

/**
 * Updates task assignments in the backend.
 *
 * @param {string[]} updatedAssignments - The updated list of assigned contacts.
 */
async function updateTaskAssignments(updatedAssignments) {
  try {
    const response = await fetch(
      `https://join-388-default-rtdb.europe-west1.firebasedatabase.app/tasks/${currentTaskId}/assignedTo.json`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedAssignments),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to update task assignments");
    }

    console.log("Task assignments updated successfully!");
  } catch (error) {
    console.error("Error updating task assignments:", error);
  }
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
