// URL deiner API
const API_URL =
  "https://join-388-default-rtdb.europe-west1.firebasedatabase.app/tasks";

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
  taskElement.setAttribute("ondragstart", `dragStart(event, '${task.id}')`);
  taskElement.innerHTML = getTaskHTML(task);
  return taskElement;
}

// HTML-Inhalt einer Aufgabe
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

// Drag-and-Drop-Logik
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
