let draggedTaskId = null;

/**
 * Startet den Drag-Vorgang für einen Task.
 *
 * @param {DragEvent} event - Das Drag-Event.
 * @param {string} taskId - Die ID des zu ziehenden Tasks.
 */
function dragStart(event, taskId) {
  draggedTaskId = taskId;
  event.dataTransfer.effectAllowed = "move";
}

/**
 * Erlaubt das Ablegen eines Tasks in einer Kanban-Spalte.
 *
 * @param {DragEvent} event - Das Drag-Over-Event.
 */
function allowDrop(event) {
  event.preventDefault();

  const target = event.target.closest(".kanban-column");

  // Alle Spalten auf Standardstil zurücksetzen
  document.querySelectorAll(".kanban-column").forEach((column) => {
    column.style.backgroundColor = "";
    column.style.borderRadius = "";
  });

  // Falls ein gültiges Ziel existiert, wende den Stil an
  if (target) {
    target.style.backgroundColor = "#E7E7E7"; // Hintergrundfarbe
    target.style.borderRadius = "16px"; // Abgerundete Ecken
  }
}

/**
 * Behandelt das Ablegen eines Tasks in einer neuen Spalte.
 *
 * @param {DragEvent} event - Das Drop-Event.
 * @param {string} newStatus - Der neue Status, in den der Task verschoben wird.
 */
function drop(event, newStatus) {
  event.preventDefault();

  const targetColumn = event.target.closest(".kanban-column");
  if (!targetColumn) {
    console.error("Ungültiges Drop-Ziel: Kanban-Column nicht gefunden");
    return;
  }

  document.querySelectorAll(".kanban-column").forEach((column) => {
    column.style.backgroundColor = "";
  });

  const targetStatus = targetColumn.getAttribute("data-status");
  if (targetStatus !== newStatus.toLowerCase().replace(/\s+/g, "-")) {
    console.error(
      `Ungültiges Drop-Ziel oder Status stimmt nicht überein: erwartet "${newStatus}", gefunden "${targetStatus}"`
    );
    return;
  }

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

/**
 * Verschiebt einen Task in einen neuen Container.
 *
 * @param {HTMLElement} targetColumn - Die Zielspalte, in die der Task verschoben werden soll.
 * @param {string} newStatus - Der neue Status des Tasks.
 */
function moveTaskToNewContainer(targetColumn, newStatus) {
  const taskElement = document.querySelector(`[data-id="${draggedTaskId}"]`);
  if (taskElement) {
    const tasksContainer = targetColumn.querySelector(".tasks");
    if (tasksContainer) {
      tasksContainer.appendChild(taskElement);
    }
  }
}

/**
 * Aktualisiert den Status eines Tasks.
 *
 * @param {string} taskId - Die ID des Tasks.
 * @param {string} newStatus - Der neue Status des Tasks.
 */
function updateTaskStatus(taskId, newStatus) {
  const task = findTaskById(taskId);
  if (task) {
    task.status = newStatus;
    sendStatusUpdate(taskId, newStatus);
  }
}

/**
 * Findet einen Task anhand seiner ID.
 *
 * @param {string} taskId - Die ID des Tasks.
 * @returns {Object|null} Der gefundene Task oder null, falls nicht vorhanden.
 */
function findTaskById(taskId) {
  return allTasksData.find((task) => task.id === taskId);
}

/**
 * Sendet eine Anfrage, um den Status eines Tasks zu aktualisieren.
 *
 * @param {string} taskId - Die ID des Tasks.
 * @param {string} newStatus - Der neue Status des Tasks.
 */
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
    .catch((error) => {});
}

function findTaskById(taskId) {
  return allTasksData.find((task) => task.id === taskId);
}

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
    .catch((error) => {});
}

/**
 * Überprüft, ob Spalten leer sind, und zeigt eine Nachricht an.
 */
function checkEmptyColumns() {
  const columns = document.querySelectorAll(".kanban-column");

  columns.forEach((column) => {
    const tasksContainer = column.querySelector(".tasks");
    const status = column.getAttribute("data-status");
    const existingMessage = column.querySelector(".no-tasks-message");
    if (existingMessage) existingMessage.remove();

    if (tasksContainer && tasksContainer.children.length === 0) {
      const noTasksMessage = document.createElement("div");
      noTasksMessage.classList.add("no-tasks-message");
      noTasksMessage.textContent = `No tasks ${status.replace("-", " ")}`;
      tasksContainer.appendChild(noTasksMessage);
    }
  });
}

/**
 * Behandelt die Antwort auf eine Status-Aktualisierungsanfrage.
 *
 * @param {Response} response - Die Antwort des Fetch-Requests.
 * @param {string} newStatus - Der neue Status des Tasks.
 * @throws {Error} Wenn die Anfrage fehlschlägt.
 */
function handleUpdateResponse(response, newStatus) {
  if (!response.ok)
    throw new Error(`Fehler beim Aktualisieren des Status: ${response.status}`);
}

/**
 * Behandelt Fehler, indem eine Nachricht angezeigt wird.
 *
 * @param {string} message - Die Fehlermeldung.
 */
function handleError(message) {
  alert(message);
}
