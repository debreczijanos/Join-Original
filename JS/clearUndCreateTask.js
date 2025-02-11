/**
 * Clears the form and resets all fields to their default values.
 */
function clearForm() {
  resetTextInputs([
    "title",
    "description",
    "dropdownInput",
    "customDropdownInput",
    "subtaskInput",
  ]);
  clearInnerHTML(["selectedContacts", "subtaskList"]);
  resetDateInput();
  resetPrioButtons();
  resetCategoryDropdown();
  uncheckCheckboxes(".dropdown-menu input[type='checkbox']");
}

/**
 * Resets the values of text input fields.
 *
 * @param {Array<string>} inputIds - The IDs of the text input fields.
 */
function resetTextInputs(inputIds) {
  inputIds.forEach((id) => (document.getElementById(id).value = ""));
}

/**
 * Clears the inner HTML content of elements.
 *
 * @param {Array<string>} elementIds - The IDs of the elements.
 */
function clearInnerHTML(elementIds) {
  elementIds.forEach((id) => (document.getElementById(id).innerHTML = ""));
}

/**
 * Resets the date field.
 */
function resetDateInput() {
  const dateInput = document.querySelector("input[type='date']");
  if (dateInput) dateInput.value = "";
}

/**
 * Resets the priority buttons and activates the default value.
 */
function resetPrioButtons() {
  const buttons = document.querySelectorAll(".prio-btn button");
  clearActiveStates(buttons);
  const defaultActiveIndex = 1;
  activateButton(buttons[defaultActiveIndex]);
}

/**
 * Resets the category dropdown menu.
 */
function resetCategoryDropdown() {
  const categoryDropdown = document.getElementById("customDropdownMenu");
  if (categoryDropdown) categoryDropdown.style.display = "none";
}

/**
 * Unchecks checkboxes.
 *
 * @param {string} selector - The CSS selector for the checkboxes.
 */
function uncheckCheckboxes(selector) {
  document
    .querySelectorAll(selector)
    .forEach((checkbox) => (checkbox.checked = false));
}

/**
 * Creates a new task and sends it to the API.
 */
function createTask() {
  const requiredFields = getRequiredFields();
  removeErrorMessages(requiredFields);
  if (validateFields(requiredFields)) return;
  const task = buildTaskObject();
  task.subtasks = getSubtasks().map((subtask) => ({
    name: subtask,
    completed: false,
  }));

  sendTaskToAPI(task);
}

/**
 * Returns the required form fields and their validation information.
 *
 * @returns {Array<Object>} A list of required fields.
 */
function getRequiredFields() {
  return [
    {
      input: document.getElementById("title"),
      errorMessage: "This field is required",
      errorClass: "error-title",
    },
    {
      input: document.querySelector("input[type='date']"),
      errorMessage: "Please select a due date",
      errorClass: "error-due-date",
    },
    {
      input: document.getElementById("customDropdownInput"),
      errorMessage: "Please select a category",
      errorClass: "error-category",
    },
  ];
}

/**
 * Removes all error messages from the form.
 *
 * @param {Array<Object>} fields - The fields with errors.
 */
function removeErrorMessages(fields) {
  document.querySelectorAll(".error-message").forEach((el) => el.remove());
  fields.forEach(({ input }) => input.classList.remove("error"));
}

/**
 * Validates the specified fields.
 *
 * @param {Array<Object>} fields - The fields to be validated.
 * @returns {boolean} Returns true if errors are found.
 */
function validateFields(fields) {
  let hasErrors = false;
  const today = new Date().toISOString().split("T")[0];

  fields.forEach(({ input, errorMessage, errorClass }) => {
    if (!input.value.trim()) {
      hasErrors = true;
      displayError(input, errorMessage, errorClass);
    }
    if (input.type === "date" && input.value < today) {
      hasErrors = true;
      displayError(input, "The date cannot be before today!", "error-due-date");
    }
  });

  return hasErrors;
}

/**
 * Displays an error message for a specific field.
 *
 * @param {HTMLElement} input - The input field with an error.
 * @param {string} errorMessage - The error message to display.
 * @param {string} errorClass - The CSS class for the error message.
 */
function displayError(input, errorMessage, errorClass) {
  input.classList.add("error");
  if (!document.querySelector(`.${errorClass}`)) {
    const errorText = document.createElement("div");
    errorText.className = `error-message ${errorClass}`;
    errorText.textContent = errorMessage;
    input.parentElement.appendChild(errorText);
  }
  toggleButtonState();
}

/**
 * Retrieves the selected contacts from the form.
 *
 * @returns {Array<string>} A list of the names of the selected contacts.
 */
function getSelectedContacts() {
  return Array.from(document.getElementById("selectedContacts").children).map(
    (button) => button.textContent.trim()
  );
}

/**
 * Retrieves the active priority level from the buttons.
 *
 * @returns {string|null} The active priority or null if none is active.
 */
function getActivePrio() {
  const activeButton = document.querySelector(".prio-btn button.active");
  return activeButton ? activeButton.textContent.trim() : null;
}

/**
 * Retrieves the subtasks from the list.
 *
 * @returns {Array<string>} A list of subtasks.
 */
function getSubtasks() {
  return Array.from(
    document.querySelectorAll("#subtaskList .subtask-item li")
  ).map((li) => li.textContent.trim());
}

function isInIframe() {
  return window.self !== window.top;
}

/**
 * Sends a task to the API and displays the result in the UI.
 *
 * @param {Object} task - The task object to be sent.
 */
let isRequestInProgress = false;

function sendTaskToAPI(task) {
  if (isRequestInProgress) return;

  isRequestInProgress = true;
  fetch(
    "https://join-388-default-rtdb.europe-west1.firebasedatabase.app/tasks.json",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(task),
    }
  )
    .then((response) => {
      if (response.ok) {
        if (isInIframe()) {
          parent.postMessage({ type: "taskSuccess" }, "*");
        } else {
          const overlay = document.getElementById("overlay");
          overlay.style.display = "flex";

          setTimeout(() => {
            overlay.style.display = "none";
            clearForm();
            window.location.href = "../html/board.html";
          }, 3000);
        }
      } else {
        console.error("Error creating task.");
      }
    })
    .catch((error) => console.error("API Error:", error))
    .finally(() => {
      isRequestInProgress = false;
    });
}

/**
 * Adds event listeners to remove error messages when input changes.
 */
function addInputListeners() {
  const fieldsToValidate = getRequiredFields();

  fieldsToValidate.forEach(({ input, errorClass }) => {
    addErrorRemovalListeners(input, errorClass);
    if (input.type === "date") {
      input.addEventListener("change", () => {
        const today = new Date().toISOString().split("T")[0];
        if (input.value < today) {
          displayError(
            input,
            "The date cannot be before today!",
            "error-due-date"
          );
        } else {
          removeError(input, "error-due-date");
        }
      });
    }
  });

  handleCategoryDropdown();
}

/**
 * Adds event listeners to an input field to remove errors.
 *
 * @param {HTMLElement} input - The input field.
 * @param {string} errorClass - The CSS class of the error message.
 */
function addErrorRemovalListeners(input, errorClass) {
  input.addEventListener("input", () => removeError(input, errorClass));
  if (input.type === "date") {
    input.addEventListener("change", () => removeError(input, errorClass));
  }
}

/**
 * Handles interactions with the category dropdown and removes error messages.
 */
function handleCategoryDropdown() {
  const categoryInput = document.getElementById("customDropdownInput");
  const dropdownMenu = document.getElementById("customDropdownMenu");

  ["input", "focus"].forEach((event) =>
    categoryInput.addEventListener(event, () =>
      removeError(categoryInput, "error-category")
    )
  );

  dropdownMenu.addEventListener("click", (event) => {
    if (event.target.classList.contains("custom-dropdown-item")) {
      removeError(categoryInput, "error-category");
    }
  });
}

/**
 * Removes the error display from an input field if it contains valid input.
 *
 * @param {HTMLElement} input - The input field.
 * @param {string} errorClass - The CSS class of the error message.
 */
function removeError(input, errorClass) {
  if (input.value.trim()) {
    input.classList.remove("error");
    const errorText = document.querySelector(`.${errorClass}`);
    if (errorText) errorText.remove();

    toggleButtonState();
  }
}

function setMinDateForDateInput() {
  const dateInput = document.querySelector("input[type='date']");
  if (dateInput) {
    const today = new Date().toISOString().split("T")[0];
    dateInput.setAttribute("min", today);
  }
}

function toggleButtonState() {
  const createTaskButton = document.querySelector(".create-task-btn");
  const errorMessages = document.querySelectorAll(".error-message");

  const requiredFields = getRequiredFields();
  const hasEmptyFields = requiredFields.some(
    ({ input }) => !input.value.trim()
  );

  if (errorMessages.length === 0 && !hasEmptyFields) {
    createTaskButton.classList.add("active");
    createTaskButton.classList.remove("inactive");
  } else {
    createTaskButton.classList.add("inactive");
    createTaskButton.classList.remove("active");
  }
}

document.querySelector(".create-task-btn").addEventListener("click", (e) => {
  const createTaskButton = e.target;

  if (!createTaskButton.classList.contains("active")) {
    return;
  }

  createTask();
});

/**
 * Event listener to add when the page loads.
 */
window.onload = () => {
  addInputListeners();
  setMinDateForDateInput();
  toggleButtonState();
};

/**
 * Event listener for the buttons.
 */
document.querySelector(".clear-btn").addEventListener("click", clearForm);
document
  .querySelector(".create-task-btn")
  .addEventListener("click", createTask);
