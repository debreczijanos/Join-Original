// Selectors for Subtask functions
const subtaskInput = document.getElementById("subtaskInput");
const iconAdd = document.getElementById("iconAdd");
const iconCancel = document.getElementById("iconCancel");
const iconConfirm = document.getElementById("iconConfirm");
const subtasksWrapper = document.querySelector(".subtasks-wrapper");
const subtaskList = document.getElementById("subtaskList");

let currentSubtaskTaskId = null;
let isAddingSubtask = false;

document.addEventListener("DOMContentLoaded", setupEventListeners);

/**
 * Initializes event listeners.
 */
function setupEventListeners() {
  subtasksWrapper.removeEventListener("click", focusInput);
  subtasksWrapper.addEventListener("click", focusInput);

  iconCancel.removeEventListener("click", clearInput);
  iconCancel.addEventListener("click", clearInput);

  iconConfirm.removeEventListener("click", addSubtask);
  iconConfirm.addEventListener("click", addSubtask);
}

/**
 * Focuses on the input field.
 */
function focusInput() {
  subtaskInput.focus();
}

/**
 * Sets up event listeners for the input field.
 */
function setupInputFocusListeners() {
  subtaskInput.addEventListener("focus", showInputIcons);
  subtaskInput.addEventListener("blur", hideInputIconsIfEmpty);
}

/**
 * Shows input icons.
 */
function showInputIcons() {
  subtasksWrapper.classList.add("focused");
  toggleIconsVisibility(false);
}

/**
 * Hides icons if input is empty.
 */
function hideInputIconsIfEmpty() {
  if (subtaskInput.value.trim() === "") {
    subtasksWrapper.classList.remove("focused");
    toggleIconsVisibility(true);
  }
}

/**
 * Toggles icon visibility.
 * @param {boolean} showAddIcon - Whether the add icon should be shown.
 */
function toggleIconsVisibility(showAddIcon) {
  iconAdd.classList.toggle("hidden", !showAddIcon);
  iconCancel.classList.toggle("hidden", showAddIcon);
  iconConfirm.classList.toggle("hidden", showAddIcon);
}

/**
 * Clears the input field.
 * @param {Event} event - The event object.
 */
function clearInput(event) {
  event.stopPropagation();
  subtaskInput.value = "";
  subtaskInput.focus();
}

/**
 * Sets the task ID for subtasks.
 * @param {string} taskId - The task ID.
 */
function openEditTaskOverlay(taskId) {
  if (currentSubtaskTaskId === taskId) return;
  currentSubtaskTaskId = taskId;
  loadExistingSubtasks(taskId);
}

/**
 * Loads subtasks from the API.
 * @param {string} taskId - The task ID.
 */
async function loadExistingSubtasks(taskId) {
  if (!taskId) {
    console.error("Task ID missing.");
    return;
  }

  subtaskList.innerHTML = ""; // Clear previous content

  try {
    const response = await fetch(`${API_URL}/${taskId}/subtasks.json`);
    if (!response.ok) throw new Error("Error fetching subtasks");

    const subtasks = await response.json();

    // If subtasks are `null` or empty, exit
    if (
      !subtasks ||
      typeof subtasks !== "object" ||
      Object.keys(subtasks).length === 0
    ) {
      return; // Do nothing
    }

    const subtaskArray = Object.values(subtasks);

    if (subtaskArray.length === 0) {
      console.warn("No subtasks found.");
      return;
    }

    // Render subtasks
    subtaskArray.forEach((subtask) => {
      if (!subtask || !subtask.name) {
        console.warn("Invalid subtask data", subtask);
        return;
      }
      subtaskList.appendChild(createSubtaskElement(subtask.name));
    });
  } catch (error) {
    console.error("Error loading subtasks:", error);
    alert("Error loading subtasks.");
  }
}

/**
 * Adds a new subtask.
 */
async function addSubtask(event) {
  if (isAddingSubtask) return;
  isAddingSubtask = true;
  event.stopPropagation();

  const subtaskText = subtaskInput.value.trim();
  if (!currentSubtaskTaskId || !subtaskText) return resetState();

  try {
    await saveNewSubtask(subtaskText);
    updateUIAfterAdd(subtaskText);
  } catch (error) {
    alert("Subtask could not be added");
  } finally {
    resetState();
  }
}

/**
 * Saves a new subtask to the database.
 */
async function saveNewSubtask(subtaskText) {
  const response = await fetch(
    `${API_URL}/${currentSubtaskTaskId}/subtasks.json`
  );
  const subtasks = (await response.json()) || [];
  const newIndex = Object.keys(subtasks).length;

  await fetch(`${API_URL}/${currentSubtaskTaskId}/subtasks/${newIndex}.json`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: subtaskText, completed: false }),
  });
}

/**
 * Updates the UI after adding a subtask.
 */
function updateUIAfterAdd(subtaskText) {
  subtaskList.appendChild(createSubtaskElement(subtaskText));
  subtaskInput.value = "";
  subtaskInput.focus();
}

/**
 * Resets the subtask state.
 */
function resetState() {
  isAddingSubtask = false;
  iconConfirm.disabled = false;
}

/**
 * Creates a subtask element with edit and delete functions.
 * @param {string} text - The name of the subtask.
 * @returns {HTMLElement} The created element.
 */
function createSubtaskElement(text) {
  const subtaskItem = document.createElement("div");
  subtaskItem.classList.add("subtask-item");

  const subtaskTextElement = document.createElement("li");
  subtaskTextElement.textContent = text;

  const actions = document.createElement("div");
  actions.classList.add("subtask-actions");

  const editIcon = createIcon("../img/SubtasksEdit.png", "Edit", () =>
    editSubtask(subtaskItem, subtaskTextElement)
  );

  const deleteIcon = createIcon("../img/SubtasksDel.png", "Delete", () =>
    deleteSubtask(subtaskItem)
  );

  actions.appendChild(editIcon);
  actions.appendChild(deleteIcon);

  subtaskItem.appendChild(subtaskTextElement);
  subtaskItem.appendChild(actions);

  return subtaskItem;
}

/**
 * Creates action icons for the subtask.
 * @param {HTMLElement} subtaskItem - The subtask element.
 * @param {HTMLElement} subtaskTextElement - The subtask text element.
 * @returns {HTMLElement} The action elements.
 */
function createSubtaskActions(subtaskItem, subtaskTextElement) {
  const actions = document.createElement("div");
  actions.classList.add("subtask-actions");

  const editIcon = createIcon("../img/SubtasksEdit.png", "Edit", () =>
    editSubtask(subtaskItem, subtaskTextElement)
  );
  const deleteIcon = createIcon("../img/SubtasksDel.png", "Delete", () =>
    deleteSubtask(subtaskItem)
  );

  actions.append(editIcon, deleteIcon);
  return actions;
}

/**
 * Creates an icon for the action.
 * @param {string} src - The image path.
 * @param {string} alt - The alt text.
 * @param {Function} clickHandler - The click handler function.
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
 * Edits a subtask.
 */
function editSubtask(subtaskItem, subtaskTextElement) {
  // Check if already in edit mode
  if (subtaskItem.querySelector(".edit-input")) {
    return;
  }

  const input = createEditInput(subtaskTextElement);
  setupEditListeners(input, subtaskItem, subtaskTextElement);
  replaceTextWithInput(subtaskItem, input, subtaskTextElement);
}

/**
 * Creates an input element for editing.
 */
function createEditInput(textElement) {
  const input = document.createElement("input");
  input.type = "text";
  input.value = textElement.textContent.trim();
  input.classList.add("edit-input");
  return input;
}

/**
 * Sets up event listeners for editing.
 */
function setupEditListeners(input, subtaskItem, textElement) {
  input.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      saveSubtaskEdit(input, textElement, subtaskItem);
    }
  });

  input.addEventListener("blur", () => {
    saveSubtaskEdit(input, textElement, subtaskItem);
  });
}

/**
 * Replaces the text with an input element.
 */
function replaceTextWithInput(subtaskItem, input, textElement) {
  subtaskItem.replaceChild(input, textElement);
  input.focus();
}

/**
 * Saves subtask edits to the Firebase database.
 * @param {HTMLInputElement} input - The input field.
 * @param {HTMLElement} subtaskTextElement - The original text container.
 * @param {HTMLElement} subtaskItem - The subtask element.
 */
async function saveSubtaskEdit(input, subtaskTextElement, subtaskItem) {
  const newValue = input.value.trim();
  if (!newValue) {
    alert("Subtask field cannot be empty.");
    // If empty, revert to original text
    subtaskItem.replaceChild(subtaskTextElement, input);
    return;
  }

  const taskId = currentSubtaskTaskId;
  if (!taskId) {
    subtaskItem.replaceChild(subtaskTextElement, input);
    return;
  }

  try {
    const response = await fetch(`${API_URL}/${taskId}/subtasks.json`);
    const subtasks = await response.json();

    if (!subtasks) {
      subtaskItem.replaceChild(subtaskTextElement, input);
      return;
    }

    const subtaskKey = Object.keys(subtasks).find(
      (key) => subtasks[key]?.name === subtaskTextElement.textContent.trim()
    );

    if (!subtaskKey) {
      subtaskItem.replaceChild(subtaskTextElement, input);
      return;
    }

    await fetch(`${API_URL}/${taskId}/subtasks/${subtaskKey}.json`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newValue }),
    });

    subtaskTextElement.textContent = newValue;
    subtaskItem.replaceChild(subtaskTextElement, input);
  } catch (error) {
    alert("Error saving");
    subtaskItem.replaceChild(subtaskTextElement, input);
  }
}

/**
 * Deletes a subtask.
 */
async function deleteSubtask(subtaskItem) {
  if (!currentSubtaskTaskId) return;

  try {
    const subtasks = await fetchSubtasks();
    if (!subtasks) {
      subtaskItem.remove();
      return;
    }

    await deleteSubtaskFromDB(subtasks, subtaskItem);
    await reindexSubtasks(subtasks, subtaskItem);
    subtaskItem.remove();
  } catch (error) {
    alert("Subtask could not be deleted");
  }
}

/**
 * Fetches subtasks from the database.
 */
async function fetchSubtasks() {
  const response = await fetch(
    `${API_URL}/${currentSubtaskTaskId}/subtasks.json`
  );
  return await response.json();
}

/**
 * Deletes the subtask from the database.
 */
async function deleteSubtaskFromDB(subtasks, subtaskItem) {
  const subtaskText = subtaskItem.querySelector("li")?.textContent.trim();
  const subtaskKey = Object.keys(subtasks).find(
    (key) => subtasks[key]?.name === subtaskText
  );

  if (subtaskKey) {
    await fetch(
      `${API_URL}/${currentSubtaskTaskId}/subtasks/${subtaskKey}.json`,
      {
        method: "DELETE",
      }
    );
  }
}

/**
 * Reindexes the remaining subtasks after deletion.
 */
async function reindexSubtasks(subtasks, deletedItem) {
  const remainingSubtasks = {};
  let newIndex = 0;
  const deletedText = deletedItem.querySelector("li")?.textContent.trim();

  for (const key in subtasks) {
    if (subtasks[key]?.name !== deletedText) {
      remainingSubtasks[newIndex] = subtasks[key];
      newIndex++;
    }
  }

  await fetch(`${API_URL}/${currentSubtaskTaskId}/subtasks.json`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(remainingSubtasks),
  });
}
