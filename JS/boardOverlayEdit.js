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
      .join("") || "<li>Keine Subtasks</li>"
  );
}

function deleteTask() {
  if (!draggedTaskId) {
    console.error("Keine gültige Task-ID gefunden");
    return;
  }

  const updateUrl = `${API_URL}/${draggedTaskId}.json`;
  deleteTaskFromBackend(updateUrl);
}

function deleteTaskFromBackend(url) {
  fetch(url, { method: "DELETE" })
    .then((response) => handleDeleteResponse(response))
    .catch((error) => handleError(`Fehler beim Löschen: ${error.message}`));
}

function handleDeleteResponse(response) {
  if (!response.ok) throw new Error("Fehler beim Löschen der Aufgabe");
  removeTaskFromFrontend();
}

function removeTaskFromFrontend() {
  allTasksData = allTasksData.filter((task) => task.id !== draggedTaskId);
  renderKanbanBoard();
  closeTaskDetails();
}

function editTask() {
  if (!draggedTaskId) {
    handleError("Keine gültige Task-ID zum Bearbeiten gefunden");
    return;
  }

  const task = getTaskById(draggedTaskId);
  if (!task) {
    handleError(`Task nicht gefunden: ${draggedTaskId}`);
    return;
  }

  populateEditForm(task);
  showEditTaskOverlay();
}

function populateEditForm(task) {
  setInputValue("edit-title", task.title || "");
  setInputValue("edit-description", task.description || "");
  setInputValue("edit-due-date", task.dueDate || "");
  setInputValue("edit-priority", task.prio || "Low");
}

function setInputValue(elementId, value) {
  const element = document.getElementById(elementId);
  if (element) {
    element.value = value;
  } else {
    logError(`Element mit ID ${elementId} nicht gefunden.`);
  }
}

function showEditTaskOverlay() {
  toggleOverlay("edit-task-overlay", false);
}

function closeEditTask() {
  toggleOverlay("edit-task-overlay", true);
}

function toggleOverlay(overlayId, isHidden) {
  const overlay = document.getElementById(overlayId);
  if (overlay) {
    overlay.classList.toggle("d-none", isHidden);
  } else {
    logError(`Overlay mit ID ${overlayId} nicht gefunden.`);
  }
}

function saveEditedTask() {
  const updatedTask = getUpdatedTaskFromForm();
  if (!validateTaskData(updatedTask)) return;

  updateTaskInBackend(draggedTaskId, updatedTask);
}

function getUpdatedTaskFromForm() {
  return {
    title: getInputValue("edit-title"),
    description: getInputValue("edit-description"),
    dueDate: getInputValue("edit-due-date"),
    prio: getInputValue("edit-priority"),
  };
}

function getInputValue(elementId) {
  const element = document.getElementById(elementId);
  return element ? element.value : "";
}

function validateTaskData(task) {
  if (!task.title || !task.dueDate) {
    alert("Titel und Fälligkeitsdatum sind erforderlich!");
    return false;
  }
  return true;
}

function updateTaskInBackend(taskId, updatedTask) {
  const updateUrl = `${API_URL}/${taskId}.json`;

  fetch(updateUrl, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updatedTask),
  })
    .then((response) => handleBackendResponse(response, taskId, updatedTask))
    .catch((error) => logError(`Fehler beim Speichern der Aufgabe: ${error}`));
}

function handleBackendResponse(response, taskId, updatedTask) {
  if (!response.ok) {
    logError(`Fehler beim Aktualisieren der Aufgabe: ${response.status}`);
    return;
  }

  updateFrontendTask(taskId, updatedTask);
  renderKanbanBoard();
  closeEditTask();
}

function updateFrontendTask(taskId, updatedTask) {
  const taskIndex = allTasksData.findIndex((task) => task.id === taskId);
  if (taskIndex !== -1) {
    allTasksData[taskIndex] = { ...allTasksData[taskIndex], ...updatedTask };
  } else {
    logError(`Task im Frontend nicht gefunden: ${taskId}`);
  }
}

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

async function createTask() {
  const taskData = collectTaskData();

  if (!taskData.title || !taskData.dueDate || !taskData.category) {
    alert(
      "Bitte fülle alle erforderlichen Felder aus (Titel, Fälligkeitsdatum und Kategorie)."
    );
    return;
  }

  try {
    const response = await fetch(`${API_URL}.json`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(taskData),
    });

    if (!response.ok) {
      throw new Error(
        `Fehler beim Erstellen der Aufgabe: ${response.statusText}`
      );
    }

    const responseData = await response.json();
    console.log("Aufgabe erfolgreich erstellt:", responseData);

    const newTaskId = responseData.name;
    const newTask = { id: newTaskId, ...taskData };
    allTasksData.push(newTask);
    const miniContainer = createTaskElement(newTask);
    const toDoContainer = document.querySelector(".tasks");
    toDoContainer.appendChild(miniContainer);

    clearFormFields();
    closeTaskWindow();
    console.log("Mini-Container hinzugefügt:", miniContainer);
  } catch (error) {
    console.error("Fehler beim Erstellen der Aufgabe:", error);
  }
}

async function loadContacts() {
  const selectElement = document.getElementById("assigned");

  try {
    const response = await fetch(API_CONTACTS);
    if (!response.ok) throw new Error(`HTTP error: ${response.status}`);

    const contacts = await response.json();

    selectElement.innerHTML =
      '<option value="" disabled selected>Select a contact</option>';

    Object.values(contacts).forEach((contact) => {
      selectElement.innerHTML += `<option value="${contact.id}">${contact.name}</option>`;
    });
  } catch (error) {
    console.error("Error loading contacts:", error);
    selectElement.innerHTML =
      '<option value="" disabled>Error loading contacts</option>';
  }
}

function formatSubtasks(subtasks) {
  return (
    subtasks
      ?.map((subtask, index) => `<li>${index + 1}. ${subtask.name}</li>`)
      .join("") || "<li>Keine Subtasks</li>"
  );
}

function deleteSubtask(button) {
  const li = button.parentElement;
  li.remove();
}

window.onload = loadContacts;
