/**
 * Die URL zur Firebase-API für Aufgaben.
 */
const API_URL =
  "https://join-388-default-rtdb.europe-west1.firebasedatabase.app/tasks";

/**
 * Die URL zur Firebase-API für Benutzer.
 */
const API_CONTACTS =
  "https://join-388-default-rtdb.europe-west1.firebasedatabase.app/users.json";

/**
 * Enthält alle geladenen Aufgaben.
 * @type {Array<Object>}
 */
let allTasksData = [];

/**
 * Öffnet das "Aufgabe hinzufügen"-Fenster basierend auf der Fensterbreite.
 *
 * - Mobile Geräte: Weiterleitung zur Seite "addTask.html".
 * - Desktop: Zeigt ein Popup zum Hinzufügen von Aufgaben.
 */
function openTaskField() {
  let screenWidth = window.innerWidth;

  if (screenWidth < 950) {
    window.location.href = "../html/addTask.html";
  } else {
    let iframeOverlay = document.getElementById("iframeOverlay");
    let iframe = document.getElementById("overlayFrame");

    if (iframe && iframeOverlay) {
      iframe.src = "./addTaskPartial.html";
      iframeOverlay.classList.remove("d-none");
    } else {
      console.error("Das IFrame-Overlay konnte nicht gefunden werden.");
    }
  }
}

/**
 * Überwacht die Fenstergröße und leitet um, wenn die Größe unter 950px fällt
 */
window.addEventListener("resize", function () {
  let screenWidth = window.innerWidth;
  let iframeOverlay = document.getElementById("iframeOverlay");

  if (screenWidth < 950 && !iframeOverlay.classList.contains("d-none")) {
    closeAddTask();
    window.location.href = "../html/addTask.html";
  }
});

/**
 * Schließt das "Aufgabe hinzufügen"-Fenster und setzt das Formular zurück.
 */
function closeTaskWindow() {
  const taskWindow = document.getElementById("show-hide-class");
  taskWindow.classList.add("d-none");
  clearFormFields();
}

/**
 * Lädt alle Aufgaben aus der Firebase-API und rendert das Kanban-Board.
 */
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

/**
 * Wandelt die empfangenen Aufgaben in ein standardisiertes Format um.
 *
 * @param {Object} tasks - Die empfangenen Aufgaben.
 */
function prepareTasksData(tasks) {
  allTasksData = Object.entries(tasks).map(([id, task]) => ({
    id,
    ...task,
    subtasks: transformSubtasks(task.subtasks || {}),
  }));
}

/**
 * Wandelt die Subtasks in ein standardisiertes Format um.
 *
 * @param {Object} subtasks - Die Subtasks einer Aufgabe.
 * @returns {Array<Object>} Die transformierten Subtasks.
 */
function transformSubtasks(subtasks) {
  return Object.entries(subtasks).map(([key, value]) => {
    if (typeof value === "string") {
      return { name: value, completed: false };
    } else if (typeof value === "object") {
      return value;
    }
    return { name: "Unbekannt", completed: false };
  });
}

/**
 * Rendert die Aufgaben im Kanban-Board.
 */
function renderKanbanBoard() {
  const containers = getTaskContainers();
  clearTaskContainers(containers);
  distributeTasks(containers);

  checkEmptyColumns();
}

/**
 * Holt die Container-Elemente für die verschiedenen Status im Kanban-Board.
 *
 * @returns {Object} Ein Objekt mit den Containern für "To Do", "In Progress", "Feedback" und "Done".
 */
function getTaskContainers() {
  return {
    toDo: document.querySelectorAll(".tasks")[0],
    inProgress: document.querySelectorAll(".tasks")[1],
    feedback: document.querySelectorAll(".tasks")[2],
    done: document.querySelectorAll(".tasks")[3],
  };
}

/**
 * Löscht den Inhalt aller Kanban-Board-Container.
 *
 * @param {Object} containers - Die Container-Elemente des Kanban-Boards.
 */
function clearTaskContainers(containers) {
  Object.values(containers).forEach((container) => (container.innerHTML = ""));
}

/**
 * Verteilt die Aufgaben basierend auf ihrem Status in die entsprechenden Kanban-Container.
 *
 * @param {Object} containers - Die Container-Elemente des Kanban-Boards.
 */
function distributeTasks(containers) {
  allTasksData.forEach((task) => {
    const taskElement = createTaskElement(task);
    appendTaskToContainer(taskElement, containers, task.status || "To Do");
  });
}

/**
 * Fügt eine Aufgabe in den entsprechenden Kanban-Container basierend auf ihrem Status ein.
 *
 * @param {HTMLElement} taskElement - Das Element der Aufgabe.
 * @param {Object} containers - Die Container-Elemente des Kanban-Boards.
 * @param {string} status - Der Status der Aufgabe.
 */
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

/**
 * Formatiert die Liste der zugewiesenen Personen für die Anzeige.
 *
 * - Zeigt die Initialen der ersten zwei Personen mit zufälligen Farben an.
 * - Fügt eine zusätzliche Anzeige hinzu, wenn weitere Teilnehmer vorhanden sind.
 *
 * @param {Array<string>} assignedTo - Liste der zugewiesenen Personen.
 * @returns {string} HTML-String mit formatierten Teilnehmern.
 */
function formatAssignedTo(assignedTo) {
  if (!assignedTo || assignedTo.length === 0) {
    return "Nicht zugewiesen";
  }
  const visibleParticipants = assignedTo.slice(0, 2);
  const remainingCount = assignedTo.length - visibleParticipants.length;
  const formattedParticipants = visibleParticipants.map((person) => {
    const initials = person
      .split(" ")
      .map((namePart) => namePart[0].toUpperCase())
      .join("");

    const randomColor = getRandomColor();
    return `
      <span class="participant" style="background-color: ${randomColor};">
        ${initials}
      </span>
    `;
  });

  if (remainingCount > 0) {
    formattedParticipants.push(
      `<span class="participant extra-count">+${remainingCount}</span>`
    );
  }

  return formattedParticipants.join(" ");
}

/**
 * Startet den Drag-and-Drop-Vorgang für eine Aufgabe.
 *
 * @param {DragEvent} event - Das Drag-Event.
 * @param {string} taskId - Die ID der zu ziehenden Aufgabe.
 */
function dragStart(event, taskId) {
  event.dataTransfer.setData("text/plain", taskId);
}

/**
 * Generiert eine zufällige HEX-Farbe.
 *
 * @returns {string} Eine zufällige Farbe im HEX-Format (z. B. "#A1B2C3").
 */
function getRandomColor() {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

/**
 * Füllt die Liste der Subtasks in einem Overlay aus.
 *
 * - Zeigt die Subtasks mit Checkboxen an.
 * - Aktualisiert die Fortschrittsleiste basierend auf den Subtasks.
 *
 * @param {Array<Object>} subtasks - Liste der Subtasks mit ihren Eigenschaften.
 */
function populateSubtasks(subtasks) {
  const container = document.getElementById("overlay-subtasks");
  container.innerHTML = "";

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

  updateOverlayProgressBar(subtasks);
}

/**
 * Wechselt den Status eines Subtasks zwischen abgeschlossen und nicht abgeschlossen.
 *
 * @param {number} index - Der Index des Subtasks in der Liste.
 */
function toggleSubtaskCompletion(index) {
  const task = getTaskById(draggedTaskId);
  if (!task || !task.subtasks || index >= task.subtasks.length) {
    console.error(`Subtask mit Index ${index} nicht gefunden.`);
    return;
  }

  task.subtasks[index].completed = !task.subtasks[index].completed;
  updateTaskProgress(draggedTaskId);
  saveSubtaskStatusToBackend(draggedTaskId, task.subtasks);
}

/**
 * Speichert den aktuellen Status der Subtasks in der Backend-Datenbank.
 *
 * @param {string} taskId - Die ID der Aufgabe.
 * @param {Array<Object>} subtasks - Die aktualisierten Subtasks.
 */
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

/**
 * Aktualisiert die Fortschrittsleiste basierend auf dem Status der Subtasks.
 *
 * - Berechnet den Prozentsatz der abgeschlossenen Subtasks.
 * - Aktualisiert die Fortschrittsleiste und den Text.
 *
 * @param {Array<Object>} subtasks - Liste der Subtasks mit ihren Eigenschaften.
 */
function updateOverlayProgressBar(subtasks) {
  const totalSubtasks = subtasks.length;
  const completedSubtasks = subtasks.filter(
    (subtask) => subtask.completed
  ).length;
  const progressPercentage =
    totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0;
  const progressBar = document.getElementById("overlay-progress");
  const progressText = document.getElementById("overlay-progress-text");

  if (progressBar && progressText) {
    progressBar.value = progressPercentage;
    progressText.innerText = `${completedSubtasks} von ${totalSubtasks} Subtasks erledigt (${progressPercentage.toFixed(
      0
    )}%)`;
  }
}

/**
 * Zeigt das Overlay für die Task-Details an.
 *
 * Entfernt die Klasse `d-none` vom Overlay, um es sichtbar zu machen.
 */
function showTaskDetailsOverlay() {
  const overlay = document.getElementById("task-details-overlay");
  if (overlay) {
    overlay.classList.remove("d-none");
  }
}

/**
 * Schließt das Overlay für die Task-Details.
 *
 * Fügt die Klasse `d-none` zum Overlay hinzu, um es auszublenden.
 */
function closeTaskDetails() {
  const overlay = document.getElementById("task-details-overlay");
  if (overlay) {
    overlay.classList.add("d-none");
  }
}

/**
 * Erstellt ein HTML-Element für eine Aufgabe.
 *
 * - Fügt Klassen, Attribute und Event-Handler hinzu.
 * - Enthält eine Funktion zum Anzeigen der Task-Details bei Klick.
 *
 * @param {Object} task - Die zu erstellende Aufgabe.
 * @returns {HTMLElement} Das HTML-Element der Aufgabe.
 */
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

/**
 * Generiert den HTML-Inhalt einer Aufgabe.
 *
 * - Zeigt Kategorie, Titel, Beschreibung, Fortschrittsanzeige und Zuweisung an.
 * - Berücksichtigt den Fortschritt der Subtasks.
 * - Nutzt unterschiedliche Stile basierend auf der Kategorie.
 *
 * @param {Object} task - Die Aufgabe, deren HTML generiert wird.
 * @returns {string} Der HTML-Inhalt der Aufgabe.
 */
function getTaskHTML(task) {
  const assignedTo = formatAssignedTo(task.assignedTo);
  const totalSubtasks = task.subtasks?.length || 0;
  const completedSubtasks =
    task.subtasks?.filter((subtask) => subtask.completed).length || 0;
  const progressPercentage =
    totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0;

  const categoryStyle =
    task.category === "User Story"
      ? "background-color: #0038FF; color: #FFF;"
      : task.category === "Technical Task"
      ? "background-color: #4CAF50; color: #FFF;"
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

/**
 * Aktualisiert die Fortschrittsanzeige einer Aufgabe basierend auf den Subtasks.
 *
 * - Berechnet den Fortschritt (in Prozent).
 * - Aktualisiert die Fortschrittsleiste und die Textanzeige im HTML.
 *
 * @param {string} taskId - Die ID der Aufgabe, deren Fortschritt aktualisiert wird.
 */
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
