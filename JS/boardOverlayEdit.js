/**
 * Formatiert Subtasks mit Checkboxen und gibt die HTML-Struktur zurück.
 *
 * @param {Array} subtasks - Eine Liste von Subtasks mit `name` und `completed`.
 * @returns {string} Die HTML-Struktur der formatierten Subtasks.
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
      .join("") || "<li>Keine Subtasks</li>"
  );
}

/**
 * Löscht eine Task basierend auf der `draggedTaskId`.
 */
function deleteTask() {
  if (!draggedTaskId) {
    console.error("Keine gültige Task-ID gefunden");
    return;
  }

  const updateUrl = `${API_URL}/${draggedTaskId}.json`;
  deleteTaskFromBackend(updateUrl);
}

/**
 * Löscht eine Task aus dem Backend.
 *
 * @param {string} url - Die API-URL der zu löschenden Task.
 */
function deleteTaskFromBackend(url) {
  fetch(url, { method: "DELETE" })
    .then((response) => handleDeleteResponse(response))
    .catch((error) => handleError(`Fehler beim Löschen: ${error.message}`));
}

/**
 * Behandelt die Antwort des Backends nach dem Löschen einer Task.
 *
 * @param {Response} response - Die Fetch-Antwort.
 */
function handleDeleteResponse(response) {
  if (!response.ok) throw new Error("Fehler beim Löschen der Aufgabe");
  removeTaskFromFrontend();
}

/**
 * Entfernt eine Task aus der UI und aktualisiert die Kanban-Tafel.
 */
function removeTaskFromFrontend() {
  allTasksData = allTasksData.filter((task) => task.id !== draggedTaskId);
  renderKanbanBoard();
  closeTaskDetails();
}

/**
 * Öffnet das Formular zur Bearbeitung einer Task.
 */
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

  // Task-ID für Subtasks speichern
  currentSubtaskTaskId = draggedTaskId;
  populateEditForm(task);
  loadExistingSubtasks(currentSubtaskTaskId); // Vorhandene Subtasks laden
  showEditTaskOverlay();
  closeTaskDetails();
}

/**
 * Füllt das Bearbeitungsformular mit den Daten einer Task.
 *
 * @param {Object} task - Die Task-Daten.
 */
async function populateEditForm(task) {
  setInputValue("edit-title", task.title || "");
  setInputValue("edit-description", task.description || "");
  setInputValue("edit-due-date", task.dueDate || "");
  setInputValue("edit-priority", task.prio || "Low");

  // Kontakte laden und Dropdown synchronisieren
  await loadContactsForEditForm(task.assignedTo || []);

  populateEditTaskForm(task);
}

/**
 * Lädt Kontakte und markiert die zugewiesenen im Bearbeitungsformular.
 * @param {Array<string>} assignedContacts - Die Liste der zugewiesenen Kontakte.
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
 * Setzt den Wert eines Formularfelds.
 *
 * @param {string} elementId - Die ID des Formularfelds.
 * @param {string} value - Der zu setzende Wert.
 */
function setInputValue(elementId, value) {
  const element = document.getElementById(elementId);
  if (element) {
    element.value = value;
  } else {
    logError(`Element mit ID ${elementId} nicht gefunden.`);
  }
}

/**
 * Zeigt das Overlay zum Bearbeiten einer Task an.
 */
function showEditTaskOverlay() {
  toggleOverlay("edit-task-overlay", false);
}

/**
 * Schließt das Overlay zum Bearbeiten einer Task.
 */
function closeEditTask() {
  toggleOverlay("edit-task-overlay", true);
}

/**
 * Blendet ein Overlay ein oder aus.
 *
 * @param {string} overlayId - Die ID des Overlays.
 * @param {boolean} isHidden - Ob das Overlay versteckt werden soll.
 */
function toggleOverlay(overlayId, isHidden) {
  const overlay = document.getElementById(overlayId);
  if (overlay) {
    overlay.classList.toggle("d-none", isHidden);
  } else {
    logError(`Overlay mit ID ${overlayId} nicht gefunden.`);
  }
}

/**
 * Speichert die bearbeitete Task.
 */
function saveEditedTask() {
  const updatedTask = getUpdatedTaskFromForm();
  if (!validateTaskData(updatedTask)) return;
  updateTaskInBackend(draggedTaskId, updatedTask);
  closeTaskDetails();
}

/**
 * Holt die aktualisierten Task-Daten aus dem Bearbeitungsformular.
 *
 * @returns {Object} Die aktualisierten Task-Daten.
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
    assignedTo: assignedContacts, // Hinzugefügte Kontakte
  };
}

function getInputValue(elementId) {
  const element = document.getElementById(elementId);
  return element ? element.value : "";
}

/**
 * Validiert die Daten einer Task.
 *
 * @param {Object} task - Die Task-Daten.
 * @returns {boolean} True, wenn die Daten gültig sind, sonst false.
 */
function validateTaskData(task) {
  if (!task.title || !task.dueDate) {
    alert("Titel und Fälligkeitsdatum sind erforderlich!");
    return false;
  }
  return true;
}

/**
 * Aktualisiert eine Task im Backend.
 *
 * @param {string} taskId - Die ID der zu aktualisierenden Task.
 * @param {Object} updatedTask - Die neuen Task-Daten.
 */
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

/**
 * Behandelt die Antwort des Backends nach einer Aktualisierung.
 *
 * @param {Response} response - Die Fetch-Antwort.
 * @param {string} taskId - Die ID der Task.
 * @param {Object} updatedTask - Die neuen Task-Daten.
 */
function handleBackendResponse(response, taskId, updatedTask) {
  if (!response.ok) {
    logError(`Fehler beim Aktualisieren der Aufgabe: ${response.status}`);
    return;
  }

  updateFrontendTask(taskId, updatedTask);
  renderKanbanBoard();
  closeEditTask();
}

/**
 * Aktualisiert die Task-Daten im Frontend.
 *
 * @param {string} taskId - Die ID der Task.
 * @param {Object} updatedTask - Die neuen Task-Daten.
 */
function updateFrontendTask(taskId, updatedTask) {
  const taskIndex = allTasksData.findIndex((task) => task.id === taskId);
  if (taskIndex !== -1) {
    allTasksData[taskIndex] = { ...allTasksData[taskIndex], ...updatedTask };
  } else {
    logError(`Task im Frontend nicht gefunden: ${taskId}`);
  }
}

/**
 * Protokolliert einen Fehler in der Konsole.
 *
 * @param {string} message - Die Fehlermeldung.
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
 * Speichert eine neue Aufgabe im Backend und aktualisiert die Oberfläche.
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
 * Erstellt eine neue Aufgabe, prüft auf erforderliche Felder und fügt sie hinzu.
 */
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

/**
 * Lädt Kontakte aus beiden APIs und kombiniert sie.
 */
async function loadContacts() {
  const dropdownMenu = document.getElementById("dropdownMenu");
  dropdownMenu.innerHTML = "Loading...";

  try {
    const [usersResponse, contactsResponse] = await Promise.all([
      fetch(USERS_API_URL),
      fetch(API_CONTACTS),
    ]);

    if (!usersResponse.ok || !contactsResponse.ok) {
      throw new Error("Fehler beim Laden der Kontakte von den APIs.");
    }

    const users = await usersResponse.json();
    const contacts = await contactsResponse.json();

    const allContacts = [...Object.values(users), ...Object.values(contacts)];
    renderContactsDropdown(allContacts, dropdownMenu);
  } catch (error) {
    dropdownMenu.innerHTML = "Fehler beim Laden der Kontakte.";
    console.error("Fehler:", error);
  }
}

/**
 * Formatiert Subtasks als HTML-Liste.
 *
 * @param {Array} subtasks - Eine Liste der Subtasks mit `name`.
 * @returns {string} Eine HTML-Liste der Subtasks.
 */
function formatSubtasks(subtasks) {
  return (
    subtasks
      ?.map((subtask, index) => `<li>${index + 1}. ${subtask.name}</li>`)
      .join("") || "<li>Keine Subtasks</li>"
  );
}

/**
 * Löscht eine Subtask aus der Liste.
 *
 * @param {HTMLElement} button - Der Button, der die Subtask löschen soll.
 */
function deleteSubtask(button) {
  const li = button.parentElement;
  li.remove();
}

/**
 * Lädt Kontakte, wenn die Seite geladen wird.
 */
window.onload = loadContacts;
