/**
 * Formats subtasks with checkboxes and returns the HTML structure.
 *
 * @param {Array} subtasks - A list of subtasks containing `name` and `completed` status.
 * @returns {string} The HTML structure of formatted subtasks.
 */
function formatSubtasksWithCheckboxes(subtasks) {
  return (
    subtasks
      ?.map(
        (subtask, index) => `
            <li>
              <label>
                <input type="checkbox" ${subtask.completed ? "checked" : ""}>
                ${subtask}
              </label>
            </li>`
      )
      .join("") || "<li>No subtasks</li>"
  );
}

/**
 * Deletes a task based on the `draggedTaskId`.
 */
function deleteTask() {
  if (!draggedTaskId) {
    console.error("No valid task ID found");
    return;
  }

  const updateUrl = `${API_URL}/${draggedTaskId}.json`;
  deleteTaskFromBackend(updateUrl);
}

/**
 * Deletes a task from the backend.
 *
 * @param {string} url - The API URL of the task to be deleted.
 */
function deleteTaskFromBackend(url) {
  fetch(url, { method: "DELETE" })
    .then((response) => handleDeleteResponse(response))
    .catch((error) => handleError(`Error deleting task: ${error.message}`));
}

/**
 * Handles the backend response after deleting a task.
 *
 * @param {Response} response - The fetch response.
 */
function handleDeleteResponse(response) {
  if (!response.ok) throw new Error("Error deleting task");
  removeTaskFromFrontend();
}

/**
 * Removes a task from the UI and updates the Kanban board.
 */
function removeTaskFromFrontend() {
  allTasksData = allTasksData.filter((task) => task.id !== draggedTaskId);
  renderKanbanBoard();
  closeTaskDetails();
}

/**
 * Opens the form to edit a task.
 */
function editTask() {
  if (!draggedTaskId) {
    handleError("No valid task ID found for editing");
    return;
  }

  const task = getTaskById(draggedTaskId);
  if (!task) {
    handleError(`Task not found: ${draggedTaskId}`);
    return;
  }

  currentSubtaskTaskId = draggedTaskId;
  populateEditForm(task);
  loadExistingSubtasks(currentSubtaskTaskId);
  showEditTaskOverlay();
  closeTaskDetails();
}

/**
 * Populates the edit form with task data.
 *
 * @param {Object} task - The task data.
 */
async function populateEditForm(task) {
  setInputValue("edit-title", task.title || "");
  setInputValue("edit-description", task.description || "");
  setInputValue("edit-due-date", task.dueDate || "");
  setInputValue("edit-priority", task.prio || "Low");

  await loadContactsForEditForm(task.assignedTo || []);

  populateEditTaskForm(task);
}

/**
 * Loads contacts and marks assigned ones in the edit form.
 *
 * @param {Array<string>} assignedContacts - The list of assigned contacts.
 */
async function loadContactsForEditForm(assignedContacts = []) {
  const dropdownMenu = document.getElementById("dropdownMenu");
  dropdownMenu.innerHTML = "Loading...";
  try {
    const [usersResponse, contactsResponse] = await Promise.all([
      fetch(USERS_API_URL),
      fetch(CONTACTS_API_URL),
    ]);
    if (!usersResponse.ok || !contactsResponse.ok) {
      throw new Error("Failed to fetch contacts from APIs");
    }
    const users = await usersResponse.json();
    const contacts = await contactsResponse.json();
    const allContacts = [...Object.values(users), ...Object.values(contacts)];
    renderContactsDropdown(allContacts, dropdownMenu, assignedContacts);
  } catch (error) {
    dropdownMenu.innerHTML = "Error loading contacts";
    console.error("Error:", error);
  }
}

/**
 * Sets the value of a form field.
 *
 * @param {string} elementId - The ID of the form field.
 * @param {string} value - The value to be set.
 */
function setInputValue(elementId, value) {
  const element = document.getElementById(elementId);
  if (element) {
    element.value = value;
  } else {
    logError(`Element with ID ${elementId} not found.`);
  }
}

/**
 * Displays the overlay for editing a task.
 */
function showEditTaskOverlay() {
  toggleOverlay("edit-task-overlay", false);
}

/**
 * Closes the overlay for editing a task.
 */
function closeEditTask() {
  toggleOverlay("edit-task-overlay", true);
  document.removeEventListener("mousedown", handleOutsideClick);
  loadTasks();
}

/**
 * Toggles an overlay's visibility.
 *
 * @param {string} overlayId - The ID of the overlay.
 * @param {boolean} isHidden - Whether the overlay should be hidden.
 */
function toggleOverlay(overlayId, isHidden) {
  const overlay = document.getElementById(overlayId);

  if (overlay) {
    overlay.classList.toggle("d-none", isHidden);

    if (!isHidden) {
      document.addEventListener("mousedown", handleOutsideClick);
    } else {
      document.removeEventListener("mousedown", handleOutsideClick);
    }
  }
}

/**
 * Handles clicks outside of the overlay.
 *
 * @param {Event} event - The click event.
 */
function handleOutsideClick(event) {
  const editOverlay = document.getElementById("edit-task-overlay");
  const detailsOverlay = document.getElementById("task-details-overlay");

  if (editOverlay && !editOverlay.classList.contains("d-none")) {
    const editContent = editOverlay.querySelector(".overlay-content");
    if (
      !editContent.contains(event.target) &&
      event.target !== document.querySelector(".edit-button")
    ) {
      closeEditTask();
    }
  }

  if (detailsOverlay && !detailsOverlay.classList.contains("d-none")) {
    const detailsContent = detailsOverlay.querySelector(".overlay-content");
    if (!detailsContent.contains(event.target)) {
      closeTaskDetails();
    }
  }
}

/**
 * Saves the edited task.
 */
function saveEditedTask() {
  const updatedTask = getUpdatedTaskFromForm();
  if (!validateTaskData(updatedTask)) return;
  updateTaskInBackend(draggedTaskId, updatedTask);
  closeTaskDetails();
  loadTasks();
}

/**
 * Retrieves the updated task data from the edit form.
 *
 * @returns {Object} The updated task data.
 */
function getUpdatedTaskFromForm() {
  const assignedContacts = Array.from(
    document.querySelectorAll("#dropdownMenu input[type='checkbox']:checked")
  ).map((checkbox) => checkbox.value);

  return {
    title: getInputValue("edit-title"),
    description: getInputValue("edit-description"),
    dueDate: getInputValue("edit-due-date"),
    prio: getInputValue("edit-priority"),
    assignedTo: assignedContacts,
  };
}

/**
 * Retrieves the value of an input field.
 *
 * @param {string} elementId - The ID of the input field.
 * @returns {string} The input value or an empty string if the element is not found.
 */
function getInputValue(elementId) {
  const element = document.getElementById(elementId);
  return element ? element.value : "";
}

/**
 * Validates task data.
 *
 * @param {Object} task - The task data.
 * @returns {boolean} True if the data is valid, otherwise false.
 */
function validateTaskData(task) {
  if (!task.title || !task.dueDate) {
    alert("Title and due date are required!");
    return false;
  }
  return true;
}

/**
 * Updates a task in the backend.
 *
 * @param {string} taskId - The ID of the task to be updated.
 * @param {Object} updatedTask - The new task data.
 */
function updateTaskInBackend(taskId, updatedTask) {
  const updateUrl = `${API_URL}/${taskId}.json`;

  fetch(updateUrl, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updatedTask),
  })
    .then((response) => handleBackendResponse(response, taskId, updatedTask))
    .catch((error) => logError(`Error saving the task: ${error}`));
}

/**
 * Handles the backend response after an update.
 *
 * @param {Response} response - The fetch response.
 * @param {string} taskId - The ID of the task.
 * @param {Object} updatedTask - The new task data.
 */
function handleBackendResponse(response, taskId, updatedTask) {
  if (!response.ok) {
    logError(`Error updating task: ${response.status}`);
    return;
  }

  updateFrontendTask(taskId, updatedTask);
  renderKanbanBoard();
  closeEditTask();
}

/**
 * Updates task data in the frontend.
 *
 * @param {string} taskId - The ID of the task.
 * @param {Object} updatedTask - The new task data.
 */
function updateFrontendTask(taskId, updatedTask) {
  const taskIndex = allTasksData.findIndex((task) => task.id === taskId);
  if (taskIndex !== -1) {
    allTasksData[taskIndex] = { ...allTasksData[taskIndex], ...updatedTask };
  } else {
    logError(`Task not found in the frontend: ${taskId}`);
  }
}

/**
 * Logs an error message to the console.
 *
 * @param {string} message - The error message.
 */
function logError(message) {
  console.error(message);
}

document.addEventListener("DOMContentLoaded", loadTasks);

document.addEventListener("DOMContentLoaded", function () {
  const priorityButtons = document.querySelectorAll(".priority-button");
  priorityButtons.forEach((button) => {
    button.addEventListener("click", function () {
      priorityButtons.forEach((btn) => btn.classList.remove("selected"));
      button.classList.add("selected");
    });
  });
});

/**
 * Saves a new task to the backend and updates the UI.
 */
function saveTask() {
  const taskData = collectTaskData();

  fetch(`${API_URL}.json`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(taskData),
  })
    .then((response) => {
      if (!response.ok) throw new Error("Fehler beim Speichern der Aufgabe");
      console.log("Aufgabe erfolgreich gespeichert");
      clearFormFields();
      loadTasks();
    })
    .catch((error) =>
      console.error("Fehler beim Speichern der Aufgabe:", error)
    );
}

/**
 * Creates a new task, validates required fields, and adds it to the task list.
 */
async function createTask() {
  const taskData = collectTaskData();
  if (!taskData.title || !taskData.dueDate || !taskData.category) {
    alert(
      "Please fill in all required fields (Title, Due Date, and Category)."
    );
    return;
  }

  try {
    const taskId = await saveTaskToBackend(taskData);
    addTaskToUI(taskId, taskData);
  } catch (error) {
    console.error("Error creating task:", error);
  }
}

/**
 * Saves the task to the backend and returns the task ID.
 * @param {Object} taskData - The task data.
 * @returns {string} - The new task ID.
 */
async function saveTaskToBackend(taskData) {
  const response = await fetch(`${API_URL}.json`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(taskData),
  });

  if (!response.ok)
    throw new Error(`Error creating task: ${response.statusText}`);
  const responseData = await response.json();
  return responseData.name;
}

/**
 * Adds the new task to the UI and updates the list.
 * @param {string} taskId - The task ID.
 * @param {Object} taskData - The task data.
 */
function addTaskToUI(taskId, taskData) {
  const newTask = { id: taskId, ...taskData };
  allTasksData.push(newTask);

  const miniContainer = createTaskElement(newTask);
  document.querySelector(".tasks").appendChild(miniContainer);
  finalizeTaskCreation();
}

/**
 * Clears form fields and closes the task window.
 */
function finalizeTaskCreation() {
  clearFormFields();
  closeTaskWindow();
  loadContacts();
}

/**
 * Formats subtasks as an HTML list.
 *
 * @param {Array} subtasks - A list of subtasks with `name`.
 * @returns {string} An HTML list of subtasks.
 */
function formatSubtasks(subtasks) {
  return (
    subtasks
      ?.map((subtask, index) => `<li>${index + 1}. ${subtask.name}</li>`)
      .join("") || "<li>Keine Subtasks</li>"
  );
}

/**
 * Deletes a subtask from the list.
 *
 * @param {HTMLElement} button - The button that triggers the subtask deletion.
 */
function deleteSubtask(button) {
  const li = button.parentElement;
  li.remove();
}
