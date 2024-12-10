// URL deiner API
const API_URL =
  "https://join-388-default-rtdb.europe-west1.firebasedatabase.app/tasks";

  function openTaskField() {
    document.getElementById("show-hide-class").classList.remove("d-none");
  }
  
  function closeTaskWindow() {
    const taskWindow = document.getElementById("show-hide-class");
    taskWindow.classList.add("d-none");
    clearFormFields(); // Felder leeren (auch bei Schließen)
  }

// Globale Variable für alle Aufgaben
let allTasksData = [];

// Daten von der API abrufen
async function loadTasks() {
  try {
    const response = await fetch(`${API_URL}.json`);
    if (!response.ok)
      handleError(`Fehler beim Abrufen der Daten: ${response.statusText}`);
    const tasks = await response.json();
    prepareTasksData(tasks);
    renderKanbanBoard();
  } catch (error) {
    console.error("Fehler beim Laden der Aufgaben:", error);
  }
}

// Aufgaben in ein Array konvertieren
function prepareTasksData(tasks) {
  allTasksData = Object.entries(tasks).map(([id, task]) => ({
    id,
    ...task,
  }));
}

// Kanban-Board rendern
function renderKanbanBoard() {
  const containers = getTaskContainers();
  clearTaskContainers(containers);
  distributeTasks(containers);
}

// Hol die Container für die Kanban-Spalten
function getTaskContainers() {
  return {
    toDo: document.querySelectorAll(".tasks")[0],
    inProgress: document.querySelectorAll(".tasks")[1],
    feedback: document.querySelectorAll(".tasks")[2],
    done: document.querySelectorAll(".tasks")[3],
  };
}

// Leere alle Container
function clearTaskContainers(containers) {
  Object.values(containers).forEach((container) => (container.innerHTML = ""));
}

// Aufgaben in die entsprechenden Container einfügen
function distributeTasks(containers) {
  allTasksData.forEach((task) => {
    const taskElement = createTaskElement(task);
    appendTaskToContainer(taskElement, containers, task.status || "To Do");
  });
}

// Aufgabe in den richtigen Container einfügen
function appendTaskToContainer(taskElement, containers, status) {
  switch (status) {
    case "To Do":
      containers.toDo.appendChild(taskElement);
      break;
    case "In Progress":
      containers.inProgress.appendChild(taskElement);
      break;
    case "Await Feedback":
      containers.feedback.appendChild(taskElement);
      break;
    case "Done":
      containers.done.appendChild(taskElement);
      break;
    default:
      console.warn("Unbekannter Status:", status);
      containers.toDo.appendChild(taskElement);
  }
}


// HTML für eine Aufgabe erstellen
function createTaskElement(task) {
  const taskElement = document.createElement("div");

  taskElement.classList.add("task");
  taskElement.setAttribute("draggable", "true");
  taskElement.setAttribute("data-id", task.id);
  
  // Hinzufügen des ondragstart-Attributes mit Template-Literal
  taskElement.setAttribute("ondragstart", `dragStart(event, '${task.id}')`);
  
  // Setzen des HTML-Inhalts
  taskElement.innerHTML = getTaskHTML(task);

  return taskElement;
}

// HTML-Inhalt einer Aufgabe
function getTaskHTML(task) {
  const assignedTo = formatAssignedTo(task.assignedTo);
  const subtasks = formatSubtasks(task.subtasks);

  return `
    <h4>${task.title || "Kein Titel"}</h4>
    <p class="description">${task.description || "Keine Beschreibung"}</p>
    <p><strong>Fällig:</strong> ${task.dueDate || "Kein Datum"}</p>
    <p><strong>Kategorie:</strong> ${task.category || "Keine Kategorie"}</p>
    <p><strong>Priorität:</strong> ${task.prio || "Keine Priorität"}</p>
    <p><strong>Zugeteilt an:</strong> ${assignedTo}</p>
    <p><strong>Subtasks:</strong></p>
    <ul>${subtasks}</ul>
  `;
}

// Teilnehmer formatieren
function formatAssignedTo(assignedTo) {
  return (
    assignedTo
      ?.map(
        (person) =>
          `<span class="participant">${person[0].toUpperCase()}</span>`
      )
      .join(", ") || "Nicht zugewiesen"
  );
}

// Subtasks formatieren
function formatSubtasks(subtasks) {
  return (
    subtasks
      ?.map((subtask, index) => `<li>${index + 1}. ${subtask}</li>`)
      .join("") || "<li>Keine Subtasks</li>"
  );
}

// Funktion für den Drag-Start (Beispielimplementierung)
function dragStart(event, taskId) {
  event.dataTransfer.setData("text/plain", taskId);
  console.log(`Drag gestartet für Task ID: ${taskId}`);
}


function collectTaskData() {
  const title = document.getElementById("title").value;
  const description = document.getElementById("description").value;
  const dueDate = document.getElementById("due-date").value;
  const assigned = document.getElementById("assigned").value;
  const category = document.getElementById("category").value;

  const priority =
    document.querySelector(".priority-buttons .selected")?.textContent || "Low";

  const subtasks = Array.from(
    document.querySelectorAll("#subtask-list li .subtask-text")
  ).map((item) => item.textContent);

  return {
    title,
    description,
    dueDate,
    assigned,
    priority,
    category,
    subtasks,
  };
}

function addSubtask() {
  const input = document.getElementById("subtask-input");
  const subtaskList = document.getElementById("subtask-list");

  if (input.value.trim() !== "") {
    const li = document.createElement("li");

    li.innerHTML = `
            <span class="subtask-text">${input.value}</span>
            <button class="edit-subtask" onclick="editSubtask(this)">Edit</button>
            <button class="delete-subtask" onclick="deleteSubtask(this)">Delete</button>
        `;

    subtaskList.appendChild(li);
    input.value = ""; // Leeren des Input-Felds nach Hinzufügen
  }
}

function editSubtask(button) {
  const subtaskText = button.parentElement.querySelector(".subtask-text");
  const newText = prompt("Edit your subtask:", subtaskText.textContent);

  if (newText !== null && newText.trim() !== "") {
    subtaskText.textContent = newText.trim();
  }
}

function deleteSubtask(button) {
  const li = button.parentElement;
  li.remove();
}

// Diese FUnktion entleert die Felder nach dem Abesnde

function clearFormFields() {
  document.getElementById("title").value = "";
  document.getElementById("description").value = "";
  document.getElementById("due-date").value = "";
  document.getElementById("assigned").value = "";
  document.getElementById("category").value = "";
  document.getElementById("subtask-list").innerHTML = "";

  const priorityButtons = document.querySelectorAll(".priority-button");
  priorityButtons.forEach((btn) => btn.classList.remove("selected"));
}


// Drag-and-Drop-Logik ----------------------------------------------------------------------------------------------------------
let draggedTaskId = null;

function dragStart(event, taskId) {
  draggedTaskId = taskId;
  console.log("Task wird gezogen:", taskId);
}

function allowDrop(event) {
  event.preventDefault();
}

function drop(event, newStatus) {
  event.preventDefault();
  moveTaskToNewContainer(event, newStatus);
  updateTaskStatus(draggedTaskId, newStatus);
  draggedTaskId = null;
}

// Aufgabe visuell verschieben
function moveTaskToNewContainer(event, newStatus) {
  const taskElement = document.querySelector(`[data-id="${draggedTaskId}"]`);
  if (taskElement) event.target.appendChild(taskElement);
}

// Status im Backend aktualisieren
function updateTaskStatus(taskId, newStatus) {
  const task = findTaskById(taskId);
  if (task) sendStatusUpdate(taskId, newStatus);
  else console.error("Task mit der ID nicht gefunden:", taskId);
}

// Aufgabe anhand der ID suchen
function findTaskById(taskId) {
  return allTasksData.find((task) => task.id === taskId);
}

// Status-Update an das Backend senden
function sendStatusUpdate(taskId, newStatus) {
  const updateUrl = `${API_URL}/${taskId}.json`;
  const body = JSON.stringify({ status: newStatus });
  fetch(updateUrl, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body,
  })
    .then((response) => handleUpdateResponse(response, newStatus))
    .catch((error) => console.error("Backend-Update fehlgeschlagen:", error));
}

// Backend-Update-Response prüfen
function handleUpdateResponse(response, newStatus) {
  if (!response.ok)
    throw new Error(`Fehler beim Aktualisieren des Status: ${response.status}`);
  console.log("Status erfolgreich aktualisiert:", newStatus);
}

// Fehlerbehandlung
function handleError(message) {
  console.error(message);
  alert(message);
}

function openTaskDetails(taskId) {
  draggedTaskId = taskId;
  const task = getTaskById(taskId);

  if (!task) {
    console.error("Task nicht gefunden:", taskId);
    return;
  }

  populateTaskDetailsOverlay(task);
  populateAssignedTo(task.assignedTo);
  populateSubtasks(task.subtasks);

  showTaskDetailsOverlay();
}

function getTaskById(taskId) {
  return allTasksData.find((task) => task.id === taskId);
}

function populateTaskDetailsOverlay(task) {
  document.getElementById("overlay-category").innerText =
    task.category || "No Category";
  document.getElementById("overlay-title").innerText = task.title || "No Title";
  document.getElementById("overlay-description").innerText =
    task.description || "No Description";
  document.getElementById("overlay-due-date").innerText =
    task.dueDate || "No Due Date";
  document.getElementById("overlay-priority").innerText =
    task.prio || "No Priority";
}

function populateAssignedTo(assignedTo) {
  const container = document.getElementById("overlay-assigned-to");
  container.innerHTML = "";

  (assignedTo || []).forEach((person) => {
    const participant = document.createElement("span");
    participant.classList.add("participant");
    participant.innerText = person;
    container.appendChild(participant);
  });
}

function populateSubtasks(subtasks) {
  const container = document.getElementById("overlay-subtasks");
  container.innerHTML = "";

  (subtasks || []).forEach((subtask, index) => {
    const li = document.createElement("li");
    li.innerText = `${index + 1}. ${subtask}`;
    container.appendChild(li);
  });
}

function showTaskDetailsOverlay() {
  document.getElementById("task-details-overlay").classList.remove("d-none");
}

function closeTaskDetails() {
  document.getElementById("task-details-overlay").classList.add("d-none");
}

function createTaskElement(task) {
  const taskElement = document.createElement("div");
  taskElement.classList.add("task");
  taskElement.setAttribute("draggable", "true");
  taskElement.setAttribute("data-id", task.id);
  taskElement.setAttribute("ondragstart", `dragStart(event, '${task.id}')`);
  taskElement.onclick = () => openTaskDetails(task.id);

  taskElement.innerHTML = getTaskHTML(task);
  return taskElement;
}

function getTaskHTML(task) {
  const assignedTo = formatAssignedTo(task.assignedTo);
  const subtasks = formatSubtasks(task.subtasks);
  return `
        <h4>${task.title || "Kein Titel"}</h4>
        <p>${task.description || "Keine Beschreibung"}</p>
        <p><strong>Fällig:</strong> ${task.dueDate || "Kein Datum"}</p>
        <p><strong>Kategorie:</strong> ${task.category || "Keine Kategorie"}</p>
        <p><strong>Priorität:</strong> ${task.prio || "Keine Priorität"}</p>
        <p><strong>Zugeteilt an:</strong> ${assignedTo}</p>
        <p><strong>Subtasks:</strong></p>
        <ul>${subtasks}</ul>
    `;
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
    .catch((error) => console.error("Fehler beim Löschen:", error));
}

function handleDeleteResponse(response) {
  if (!response.ok) throw new Error("Fehler beim Löschen der Aufgabe");
  console.log("Aufgabe gelöscht:", draggedTaskId);
  removeTaskFromFrontend();
}

function removeTaskFromFrontend() {
  allTasksData = allTasksData.filter((task) => task.id !== draggedTaskId);
  renderKanbanBoard();
  closeTaskDetails();
}
function editTask() {
  if (!draggedTaskId) {
    logError("Keine gültige Task-ID zum Bearbeiten gefunden");
    return;
  }

  const task = getTaskById(draggedTaskId);
  if (!task) {
    logError(`Task nicht gefunden: ${draggedTaskId}`);
    return;
  }

  console.log("Task zum Bearbeiten:", task);
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
  console.log("Aufgabe erfolgreich aktualisiert:", taskId);
  updateFrontendTask(taskId, updatedTask);
  renderKanbanBoard();
  closeEditTask();
}

function updateFrontendTask(taskId, updatedTask) {
  const taskIndex = allTasksData.findIndex((task) => task.id === taskId);
  if (taskIndex !== -1) {
    allTasksData[taskIndex] = { ...allTasksData[taskIndex], ...updatedTask };
    console.log("Frontend-Daten aktualisiert:", allTasksData[taskIndex]);
  } else {
    logError(`Task im Frontend nicht gefunden: ${taskId}`);
  }
}

function logError(message) {
  console.error(message);
}

// Daten laden, wenn die Seite geladen wird
document.addEventListener("DOMContentLoaded", loadTasks);

/**
 * Veröndert die Farbe und die Priorität der Buttons
 */

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

  // Task speichern im Backend
  fetch(`${API_URL}.json`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(taskData),
  })
    .then((response) => {
      if (!response.ok) throw new Error("Fehler beim Speichern der Aufgabe");
      console.log("Aufgabe erfolgreich gespeichert");
      clearFormFields(); // Felder nach dem Speichern leeren
      loadTasks(); // Aufgaben neu laden
    })
    .catch((error) => console.error("Fehler beim Speichern der Aufgabe:", error));
}





async function createTask() {
  // Sammle die Daten aus dem Formular
  const taskData = collectTaskData();

  // Überprüfe, ob die Pflichtfelder ausgefüllt sind
  if (!taskData.title || !taskData.dueDate || !taskData.category) {
      alert("Bitte fülle alle erforderlichen Felder aus (Titel, Fälligkeitsdatum und Kategorie).");
      return;
  }

  try {
      // Aufgabe an die API senden
      const response = await fetch(`${API_URL}.json`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(taskData),
      });

      if (!response.ok) {
          throw new Error(`Fehler beim Erstellen der Aufgabe: ${response.statusText}`);
      }

      const responseData = await response.json();
      console.log("Aufgabe erfolgreich erstellt:", responseData);

      // ID der neuen Aufgabe aus der API-Antwort extrahieren
      const newTaskId = responseData.name;

      // Die neue Aufgabe zum globalen Array hinzufügen
      const newTask = { id: newTaskId, ...taskData };
      allTasksData.push(newTask);

      // Aufgabe in den Kanban-Container einfügen
      const miniContainer = createTaskElement(newTask);
      const toDoContainer = document.querySelector(".tasks"); // Zum Beispiel der erste Container
      toDoContainer.appendChild(miniContainer);

      // Formularfelder zurücksetzen und Fenster schließen
      clearFormFields();
      closeTaskWindow();

      console.log("Mini-Container hinzugefügt:", miniContainer);
  } catch (error) {
      console.error("Fehler beim Erstellen der Aufgabe:", error);
  }
}


