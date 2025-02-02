const subtaskInput = document.getElementById("subtaskInput");
const iconAdd = document.getElementById("iconAdd");
const iconCancel = document.getElementById("iconCancel");
const iconConfirm = document.getElementById("iconConfirm");
const subtasksWrapper = document.querySelector(".subtasks-wrapper");
const subtaskList = document.getElementById("subtaskList");

/**
 * Function: Focuses the input field when clicking on the wrapper area.
 */
function focusInput() {
  subtaskInput.focus();
}

/**
 * Function: Updates the visibility of icons based on input focus.
 */
function setupInputFocusListeners() {
  subtaskInput.addEventListener("focus", () => showInputIcons());
  subtaskInput.addEventListener("blur", () => hideInputIconsIfEmpty());
}

/**
 * Shows the icons for the input field.
 */
function showInputIcons() {
  subtasksWrapper.classList.add("focused");
  toggleIconsVisibility(false);
}

/**
 * Hides the icons for the input field if it is empty.
 */
function hideInputIconsIfEmpty() {
  if (subtaskInput.value.trim() === "") {
    subtasksWrapper.classList.remove("focused");
    toggleIconsVisibility(true);
  }
}

/**
 * Toggles the visibility of icons based on the state.
 *
 * @param {boolean} showAddIcon - If true, the "Add" icon is displayed.
 */
function toggleIconsVisibility(showAddIcon) {
  iconAdd.classList.toggle("hidden", !showAddIcon);
  iconCancel.classList.toggle("hidden", showAddIcon);
  iconConfirm.classList.toggle("hidden", showAddIcon);
}

/**
 * Clears the input field and sets focus back on it.
 *
 * @param {Event} event - The click event.
 */
function clearInput(event) {
  event.stopPropagation();
  subtaskInput.value = "";
  subtaskInput.focus();
}

/**
 * Adds a new subtask to the list.
 *
 * @param {Event} event - The click event.
 */
function addSubtask(event) {
  event.stopPropagation();

  const subtaskText = subtaskInput.value.trim();
  if (!subtaskText) return;

  const subtaskItem = createSubtaskElement(subtaskText);
  subtaskList.appendChild(subtaskItem);

  resetSubtaskInput();
}

/**
 * Creates a new subtask element.
 *
 * @param {string} text - The subtask text.
 * @returns {HTMLElement} The subtask element.
 */
function createSubtaskElement(text) {
  const subtaskItem = document.createElement("div");
  subtaskItem.classList.add("subtask-item");

  const subtaskTextElement = createSubtaskText(text);
  const subtaskActions = createSubtaskActions(subtaskItem, subtaskTextElement);

  subtaskItem.appendChild(subtaskTextElement);
  subtaskItem.appendChild(subtaskActions);

  return subtaskItem;
}

/**
 * Creates a text element for the subtask.
 *
 * @param {string} text - The subtask text.
 * @returns {HTMLElement} The text element.
 */
function createSubtaskText(text) {
  const textElement = document.createElement("li");
  textElement.textContent = text;
  return textElement;
}

/**
 * Creates the action icons for a subtask.
 *
 * @param {HTMLElement} subtaskItem - The subtask element.
 * @param {HTMLElement} subtaskTextElement - The text element of the subtask.
 * @returns {HTMLElement} The container with action icons.
 */
function createSubtaskActions(subtaskItem, subtaskTextElement) {
  const actions = document.createElement("div");
  actions.classList.add("subtask-actions");
  const editIcon = createIcon("../img/SubtasksEdit.png", "Edit", () =>
    editSubtask(subtaskItem, subtaskTextElement)
  );
  const divider = createDivider();
  const deleteIcon = createIcon("../img/SubtasksDel.png", "Delete", () =>
    deleteSubtask(subtaskItem)
  );

  actions.appendChild(editIcon);
  actions.appendChild(divider);
  actions.appendChild(deleteIcon);

  return actions;
}

/**
 * Creates an icon element with a click handler.
 *
 * @param {string} src - The path to the icon file.
 * @param {string} alt - The alternative text for the icon.
 * @param {Function} clickHandler - The click event handler for the icon.
 * @returns {HTMLElement} The icon element.
 */
function createIcon(src, alt, clickHandler) {
  const icon = document.createElement("img");
  icon.src = src;
  icon.alt = alt;
  icon.classList.add("subtask-icon-action");
  icon.addEventListener("click", clickHandler);
  return icon;
}

/**
 * Creates a divider for the subtask actions.
 *
 * @returns {HTMLElement} The divider element.
 */
function createDivider() {
  const divider = document.createElement("div");
  divider.classList.add("divider");
  return divider;
}

/**
 * Resets the input field.
 */
function resetSubtaskInput() {
  subtaskInput.value = "";
  subtaskInput.focus();
}

/**
 * Enables editing of a subtask.
 *
 * @param {HTMLElement} subtaskItem - The subtask element.
 * @param {HTMLElement} subtaskTextElement - The text element of the subtask.
 */
function editSubtask(subtaskItem, subtaskTextElement) {
  const editInput = createEditInput(subtaskTextElement.textContent);
  subtaskTextElement.replaceWith(editInput);
  let hasSaved = false;
  const saveHandler = () => {
    if (!hasSaved) {
      hasSaved = true;
      saveSubtaskEdit(editInput, subtaskTextElement);
    }
  };

  editInput.addEventListener("keypress", (e) => handleEditSave(e, saveHandler));
  editInput.addEventListener("blur", saveHandler);
  editInput.focus();
}

/**
 * Creates an input field for editing a subtask.
 *
 * @param {string} value - The current text of the subtask.
 * @returns {HTMLElement} The input field.
 */
function createEditInput(value) {
  const input = document.createElement("input");
  input.type = "text";
  input.value = value;
  input.classList.add("edit-input");
  return input;
}

/**
 * Handles the save action when editing a subtask.
 *
 * @param {KeyboardEvent} event - The keyboard event.
 * @param {Function} saveHandler - The function that executes the save action.
 */
function handleEditSave(event, saveHandler) {
  if (event.key === "Enter") {
    saveHandler();
  }
}

/**
 * Saves the edited subtask.
 *
 * @param {HTMLElement} editInput - The input field for editing.
 * @param {HTMLElement} subtaskTextElement - The text element of the subtask.
 */
function saveSubtaskEdit(editInput, subtaskTextElement) {
  const newValue = editInput.value.trim();

  if (newValue === "") {
    editInput.replaceWith(subtaskTextElement);
    return;
  }

  subtaskTextElement.textContent = newValue;
  editInput.replaceWith(subtaskTextElement);
}

/**
 * Deletes a subtask from the list.
 *
 * @param {HTMLElement} subtaskItem - The subtask element to be deleted.
 */
function deleteSubtask(subtaskItem) {
  subtaskItem.remove();
}

/**
 * Initializes event listeners for subtask management.
 */
function setupEventListeners() {
  subtasksWrapper.addEventListener("click", focusInput);
  setupInputFocusListeners();
  iconCancel.addEventListener("click", clearInput);
  iconConfirm.addEventListener("click", addSubtask);
}
