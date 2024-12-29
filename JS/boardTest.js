// URL deiner API
const API_URL =
  "https://join-388-default-rtdb.europe-west1.firebasedatabase.app/tasks";

const API_CONTACTS =
  "https://join-388-default-rtdb.europe-west1.firebasedatabase.app/users.json";

function openTaskField() {
  if (window.innerWidth < 900) {
    window.location.href = "../html/addTask.html";
  } else {
    const element = document.getElementById("show-hide-class");
    if (element) {
      element.classList.remove("d-none");
    }
  }
}

function closeTaskWindow() {
  const taskWindow = document.getElementById("show-hide-class");
  taskWindow.classList.add("d-none");
  clearFormFields();
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
    handleError("Fehler beim Laden der Aufgaben");
  }
}

// Aufgaben in ein Array konvertieren
function prepareTasksData(tasks) {
  allTasksData = Object.entries(tasks).map(([id, task]) => ({
    id,
    ...task,
    subtasks: transformSubtasks(task.subtasks || {}),
  }));
}

function transformSubtasks(subtasks) {
  return Object.entries(subtasks).map(([key, value]) => {
    if (typeof value === "string") {
      return { name: value, completed: false };
    } else if (typeof value === "object") {
      return value;
    }
    return { name: "Unbekannt", completed: false }; // Fallback
  });
}

// Kanban-Board rendern
function renderKanbanBoard() {
  const containers = getTaskContainers();
  clearTaskContainers(containers);
  distributeTasks(containers);

  // Überprüfe leere Spalten und zeige die Nachricht
  checkEmptyColumns();
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
  }
}

// Teilnehmer formatieren
function formatAssignedTo(assignedTo) {
  if (!assignedTo || assignedTo.length === 0) {
    return "Nicht zugewiesen";
  }

  // Nur die ersten zwei Namen für die Anzeige
  const visibleParticipants = assignedTo.slice(0, 2);
  const remainingCount = assignedTo.length - visibleParticipants.length;

  const formattedParticipants = visibleParticipants.map((person) => {
    const initials = person
      .split(" ")
      .map((namePart) => namePart[0].toUpperCase())
      .join("");

    const randomColor = getRandomColor(); // Dynamische Hintergrundfarbe
    return `
      <span class="participant" style="background-color: ${randomColor};">
        ${initials}
      </span>
    `;
  });

  if (remainingCount > 0) {
    // "+x" für weitere Personen
    formattedParticipants.push(
      `<span class="participant extra-count">+${remainingCount}</span>`
    );
  }

  return formattedParticipants.join(" ");
}

// Subtasks formatieren
function formatSubtasks(subtasks) {
  return (
    subtasks
      ?.map((subtask, index) => `<li>${index + 1}. ${subtask.name}</li>`)
      .join("") || "<li>Keine Subtasks</li>"
  );
}
// Funktion für den Drag-Start
function dragStart(event, taskId) {
  event.dataTransfer.setData("text/plain", taskId);
}

// Funktion zum Sammeln von Task-Daten aus dem Formular
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
  ).map((item) => ({
    name: item.textContent,
    completed: false, // Subtasks sind standardmäßig nicht abgeschlossen
  }));

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

// Subtask hinzufügen
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

// Subtask bearbeiten
function editSubtask(button) {
  const subtaskText = button.parentElement.querySelector(".subtask-text");
  const newText = prompt("Edit your subtask:", subtaskText.textContent);

  if (newText?.trim()) {
    subtaskText.textContent = newText.trim();
  }
}

// Subtask löschen
function deleteSubtask(button) {
  const li = button.parentElement;
  li.remove();
}

// Formularfelder leeren
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
  event.dataTransfer.effectAllowed = "move";
}

function allowDrop(event) {
  event.preventDefault();

  // Finde die nächste gültige Zielspalte
  const target = event.target.closest(".kanban-column");

  // Alle Spalten zurücksetzen, um visuelle Verwirrung zu vermeiden
  document.querySelectorAll(".kanban-column").forEach((column) => {
    column.style.backgroundColor = ""; // Zurücksetzen der Hintergrundfarbe
  });

  // Wenn eine gültige Spalte gefunden wurde, ändere die Hintergrundfarbe
  if (target) {
    target.style.backgroundColor = "#E7E7E7"; // Hintergrund abdunkeln
  }
}

function drop(event, newStatus) {
  event.preventDefault();

  // Finde die Zielspalte basierend auf `data-status`
  const targetColumn = event.target.closest(".kanban-column");
  if (!targetColumn) {
    console.error("Ungültiges Drop-Ziel: Kanban-Column nicht gefunden");
    return;
  }

  // Entferne die Hintergrundfarbe von allen Spalten
  document.querySelectorAll(".kanban-column").forEach((column) => {
    column.style.backgroundColor = ""; // Hintergrundfarbe zurücksetzen
  });

  const targetStatus = targetColumn.getAttribute("data-status");
  if (targetStatus !== newStatus.toLowerCase().replace(/\s+/g, "-")) {
    console.error(
      `Ungültiges Drop-Ziel oder Status stimmt nicht überein: erwartet "${newStatus}", gefunden "${targetStatus}"`
    );
    return;
  }

  // Verschiebe das Task-Element in die Zielspalte
  const taskElement = document.querySelector(`[data-id="${draggedTaskId}"]`);
  if (taskElement) {
    targetColumn.querySelector(".tasks").appendChild(taskElement);
    updateTaskStatus(draggedTaskId, newStatus);
  } else {
    console.error("Task-Element nicht gefunden:", draggedTaskId);
  }

  draggedTaskId = null;
  checkEmptyColumns();
}

// Aufgabe visuell verschieben
function moveTaskToNewContainer(targetColumn, newStatus) {
  const taskElement = document.querySelector(`[data-id="${draggedTaskId}"]`);
  if (taskElement) {
    const tasksContainer = targetColumn.querySelector(".tasks");
    if (tasksContainer) {
      tasksContainer.appendChild(taskElement); // Aufgabe in die neue Spalte verschieben
    } else {
      console.error("Tasks-Container nicht gefunden im Ziel-Column");
    }
  } else {
    console.error("Task-Element nicht gefunden für ID:", draggedTaskId);
  }
}

// Status im Backend aktualisieren
function updateTaskStatus(taskId, newStatus) {
  const task = findTaskById(taskId);
  if (task) {
    task.status = newStatus;
    sendStatusUpdate(taskId, newStatus);
  } else {
    console.error("Task mit der ID nicht gefunden:", taskId);
  }
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
    .then((response) => {
      if (!response.ok) {
        throw new Error(
          `Fehler beim Aktualisieren des Status: ${response.status}`
        );
      }
    })
    .catch((error) => console.error("Backend-Update fehlgeschlagen:", error));
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
    .then((response) => {
      if (!response.ok) {
        throw new Error(
          `Fehler beim Aktualisieren des Status: ${response.status}`
        );
      }
    })
    .catch((error) => console.error("Backend-Update fehlgeschlagen:", error));
}

function checkEmptyColumns() {
  const columns = document.querySelectorAll(".kanban-column");

  columns.forEach((column) => {
    const tasksContainer = column.querySelector(".tasks");
    const status = column.getAttribute("data-status");

    // Entferne vorhandene "No tasks"-Meldungen
    const existingMessage = column.querySelector(".no-tasks-message");
    if (existingMessage) existingMessage.remove();

    // Wenn die Spalte leer ist, füge die Nachricht ein
    if (tasksContainer && tasksContainer.children.length === 0) {
      const noTasksMessage = document.createElement("div");
      noTasksMessage.classList.add("no-tasks-message");
      noTasksMessage.textContent = `No tasks ${status.replace("-", " ")}`;
      tasksContainer.appendChild(noTasksMessage);
    }
  });
}

// Backend-Update-Response prüfen
function handleUpdateResponse(response, newStatus) {
  if (!response.ok)
    throw new Error(`Fehler beim Aktualisieren des Status: ${response.status}`);
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

  // Task-Daten ins Overlay laden
  populateTaskDetailsOverlay(task);
  populateAssignedTo(task.assignedTo);
  populateSubtasks(task.subtasks || []); // Hier sicherstellen, dass subtasks existieren

  showTaskDetailsOverlay(); // Overlay anzeigen
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
    // Initialen extrahieren
    const initials = person
      .split(" ")
      .map((word) => word[0]?.toUpperCase())
      .join("");

    // Zufällige Hintergrundfarbe generieren
    const backgroundColor = getRandomColor();

    // Teilnehmer-Container erstellen
    const participantContainer = document.createElement("div");
    participantContainer.classList.add("participant-container");

    // Initialen in ein <p>-Element einfügen
    const initialsElement = document.createElement("p");
    initialsElement.classList.add("participant-initials");
    initialsElement.innerText = initials;
    initialsElement.style.backgroundColor = backgroundColor;

    // Name in ein <span>-Element einfügen
    const participant = document.createElement("span");
    participant.classList.add("participant");
    participant.innerText = person;

    // <p> und <span> zum Container hinzufügen
    participantContainer.appendChild(initialsElement);
    participantContainer.appendChild(participant);

    // Den Container in das Haupt-Container einfügen
    container.appendChild(participantContainer);
  });
}

// Funktion zur Generierung einer zufälligen Farbe
function getRandomColor() {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

function populateSubtasks(subtasks) {
  const container = document.getElementById("overlay-subtasks");
  container.innerHTML = ""; // Alte Inhalte löschen

  subtasks.forEach((subtask, index) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <label>
        <input type="checkbox" ${
          subtask.completed ? "checked" : ""
        } onchange="toggleSubtaskCompletion(${index})">
        ${subtask.name}
      </label>
    `;
    container.appendChild(li);
  });

  // Fortschrittsanzeige aktualisieren
  updateOverlayProgressBar(subtasks);
}

function toggleSubtaskCompletion(index) {
  const task = getTaskById(draggedTaskId);
  if (!task || !task.subtasks || index >= task.subtasks.length) {
    console.error(`Subtask mit Index ${index} nicht gefunden.`);
    return;
  }

  // Status des Subtasks umschalten
  task.subtasks[index].completed = !task.subtasks[index].completed;

  // Fortschrittsanzeige aktualisieren
  updateTaskProgress(draggedTaskId);

  // Änderungen im Backend speichern
  saveSubtaskStatusToBackend(draggedTaskId, task.subtasks);
}

function saveSubtaskStatusToBackend(taskId, subtasks) {
  const updateUrl = `${API_URL}/${taskId}.json`;

  fetch(updateUrl, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ subtasks }),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Fehler beim Speichern der Subtasks.`);
      }
    })
    .catch((error) =>
      console.error("Fehler beim Speichern der Subtasks:", error)
    );
}

function updateOverlayProgressBar(subtasks) {
  const totalSubtasks = subtasks.length;
  const completedSubtasks = subtasks.filter(
    (subtask) => subtask.completed
  ).length;
  const progressPercentage =
    totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0;

  // Progress-Bar im Overlay aktualisieren
  const progressBar = document.getElementById("overlay-progress");
  const progressText = document.getElementById("overlay-progress-text");

  if (progressBar && progressText) {
    progressBar.value = progressPercentage;
    progressText.innerText = `${completedSubtasks} von ${totalSubtasks} Subtasks erledigt (${progressPercentage.toFixed(
      0
    )}%)`;
  }
}

function showTaskDetailsOverlay() {
  const overlay = document.getElementById("task-details-overlay");
  if (overlay) {
    overlay.classList.remove("d-none");
  }
}

function closeTaskDetails() {
  const overlay = document.getElementById("task-details-overlay");
  if (overlay) {
    overlay.classList.add("d-none");
  }
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

  // Fortschritt basierend auf Subtasks berechnen
  const totalSubtasks = task.subtasks?.length || 0;
  const completedSubtasks =
    task.subtasks?.filter((subtask) => subtask.completed).length || 0;
  const progressPercentage =
    totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0;

  // Hintergrundfarbe basierend auf Kategorie
  const categoryStyle =
    task.category === "User Story"
      ? "background-color: #0038FF; color: #FFF;" // Gelb mit schwarzem Text
      : task.category === "Technical Task"
      ? "background-color: #4CAF50; color: #FFF;" // Grün mit weißem Text
      : "";

  return `
    <!-- Kategorie oben -->
    <h3 class= "task-category" style="${categoryStyle}"> ${
    task.category || "Keine Kategorie"
  }</h3>

    <!-- Titel -->
    <h4>${task.title || "Kein Titel"}</h4>

    <!-- Beschreibung -->
    <p>${task.description || "Keine Beschreibung"}</p>

    <!-- Fortschrittsanzeige -->
    <div class="progress-container">
      <progress id="overlay-progress" value="${progressPercentage}" max="100"></progress>
      <p>${progressPercentage.toFixed(0)}% der Subtasks abgeschlossen</p>
    </div>

    <!-- Zuweisung -->
    <p class="initialien"><strong>Zugeteilt an:</strong> ${assignedTo}</p>
  `;
}

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

function updateTaskProgress(taskId) {
  const task = getTaskById(taskId);
  if (!task) {
    console.error("Task nicht gefunden:", taskId);
    return;
  }

  const totalSubtasks = task.subtasks?.length || 0;
  const completedSubtasks =
    task.subtasks?.filter((subtask) => subtask.completed).length || 0;
  const progressPercentage =
    totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0;

  // Progress-Bar im Kanban-Board aktualisieren
  const taskElement = document.querySelector(`.task[data-id="${taskId}"]`);
  if (taskElement) {
    taskElement.querySelector("progress").value = progressPercentage;
    taskElement.querySelector(
      ".progress-container p"
    ).innerText = `${progressPercentage.toFixed(
      0
    )}% der Subtasks abgeschlossen`;
  }
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
    .catch((error) =>
      console.error("Fehler beim Speichern der Aufgabe:", error)
    );
}

async function createTask() {
  // Sammle die Daten aus dem Formular
  const taskData = collectTaskData();

  // Überprüfe, ob die Pflichtfelder ausgefüllt sind
  if (!taskData.title || !taskData.dueDate || !taskData.category) {
    alert(
      "Bitte fülle alle erforderlichen Felder aus (Titel, Fälligkeitsdatum und Kategorie)."
    );
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
      throw new Error(
        `Fehler beim Erstellen der Aufgabe: ${response.statusText}`
      );
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

window.onload = loadContacts;
