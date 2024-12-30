let draggedTaskId = null;

function dragStart(event, taskId) {
  draggedTaskId = taskId;
  event.dataTransfer.effectAllowed = "move";
}

function allowDrop(event) {
  event.preventDefault();

  const target = event.target.closest(".kanban-column");

  document.querySelectorAll(".kanban-column").forEach((column) => {
    column.style.backgroundColor = "";
  });

  if (target) {
    target.style.backgroundColor = "#E7E7E7";
  }
}

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

function moveTaskToNewContainer(targetColumn, newStatus) {
  const taskElement = document.querySelector(`[data-id="${draggedTaskId}"]`);
  if (taskElement) {
    const tasksContainer = targetColumn.querySelector(".tasks");
    if (tasksContainer) {
      tasksContainer.appendChild(taskElement);
    }
  }
}

function updateTaskStatus(taskId, newStatus) {
  const task = findTaskById(taskId);
  if (task) {
    task.status = newStatus;
    sendStatusUpdate(taskId, newStatus);
  }
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

function handleUpdateResponse(response, newStatus) {
  if (!response.ok)
    throw new Error(`Fehler beim Aktualisieren des Status: ${response.status}`);
}

function handleError(message) {
  alert(message);
}
