let draggedTaskId = null;

/**
 * Starts the drag process for a task.
 *
 * @param {DragEvent} event - The drag event.
 * @param {string} taskId - The ID of the task being dragged.
 */
function dragStart(event, taskId) {
  draggedTaskId = taskId;
  event.dataTransfer.effectAllowed = "move";
}

/**
 * Allows a task to be dropped into a Kanban column.
 *
 * @param {DragEvent} event - The drag-over event.
 */
function allowDrop(event) {
  event.preventDefault();

  const target = event.target.closest(".kanban-column");

  document.querySelectorAll(".kanban-column").forEach((column) => {
    column.style.backgroundColor = "";
    column.style.borderRadius = "";
  });

  if (target) {
    target.style.backgroundColor = "#E7E7E7";
    target.style.borderRadius = "16px";
  }
}

/**
 * Handles dropping a task into a new column.
 *
 * @param {DragEvent} event - The drop event.
 * @param {string} newStatus - The new status to which the task is moved.
 */
function drop(event, newStatus) {
  event.preventDefault();

  const targetColumn = getTargetColumn(event);
  if (!targetColumn) return;

  resetColumnStyles();
  if (!isValidDropTarget(targetColumn, newStatus)) return;

  moveTaskToColumn(targetColumn, newStatus);
  draggedTaskId = null;
  checkEmptyColumns();
}

/**
 * Retrieves the target Kanban column from the event.
 *
 * @param {DragEvent} event - The drop event.
 * @returns {HTMLElement|null} The target column or null if not found.
 */
function getTargetColumn(event) {
  const targetColumn = event.target.closest(".kanban-column");
  if (!targetColumn) {
    console.error("Invalid drop target: Kanban column not found");
    return null;
  }
  return targetColumn;
}

/**
 * Resets the background styles of all Kanban columns.
 */
function resetColumnStyles() {
  document.querySelectorAll(".kanban-column").forEach((column) => {
    column.style.backgroundColor = "";
  });
}

/**
 * Validates if the drop target matches the expected new status.
 *
 * @param {HTMLElement} targetColumn - The target Kanban column.
 * @param {string} newStatus - The expected new status.
 * @returns {boolean} True if valid, otherwise false.
 */
function isValidDropTarget(targetColumn, newStatus) {
  const targetStatus = targetColumn.getAttribute("data-status");
  if (targetStatus !== newStatus.toLowerCase().replace(/\s+/g, "-")) {
    console.error(
      `Invalid drop target or status mismatch: expected "${newStatus}", found "${targetStatus}"`
    );
    return false;
  }
  return true;
}

/**
 * Moves the dragged task to the target column.
 *
 * @param {HTMLElement} targetColumn - The target Kanban column.
 * @param {string} newStatus - The new status of the task.
 */
function moveTaskToColumn(targetColumn, newStatus) {
  const taskElement = document.querySelector(`[data-id="${draggedTaskId}"]`);
  if (taskElement) {
    targetColumn.querySelector(".tasks").appendChild(taskElement);
    updateTaskStatus(draggedTaskId, newStatus);
  } else {
    console.error("Task element not found:", draggedTaskId);
  }
}

/**
 * Moves a task to a new container.
 *
 * @param {HTMLElement} targetColumn - The target column where the task should be moved.
 * @param {string} newStatus - The new status of the task.
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
 * Updates the status of a task.
 *
 * @param {string} taskId - The ID of the task.
 * @param {string} newStatus - The new status of the task.
 */
function updateTaskStatus(taskId, newStatus) {
  const task = findTaskById(taskId);
  if (task) {
    task.status = newStatus;
    sendStatusUpdate(taskId, newStatus);
  }
}

/**
 * Finds a task by its ID.
 *
 * @param {string} taskId - The ID of the task.
 * @returns {Object|null} The found task or null if not found.
 */
function findTaskById(taskId) {
  return allTasksData.find((task) => task.id === taskId);
}

/**
 * Sends a request to update the status of a task.
 *
 * @param {string} taskId - The ID of the task.
 * @param {string} newStatus - The new status of the task.
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
        throw new Error(`Error updating status: ${response.status}`);
      }
    })
    .catch((error) => {});
}

/**
 * Finds a task by its ID.
 *
 * @param {string} taskId - The ID of the task.
 * @returns {Object|null} The found task or null if not found.
 */
function findTaskById(taskId) {
  return allTasksData.find((task) => task.id === taskId);
}

/**
 * Sends a request to update the status of a task.
 *
 * @param {string} taskId - The ID of the task.
 * @param {string} newStatus - The new status of the task.
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
        throw new Error(`Error updating status: ${response.status}`);
      }
    })
    .catch((error) => {});
}

/**
 * Checks if columns are empty and displays a message.
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
 * Handles the response for a status update request.
 *
 * @param {Response} response - The response from the fetch request.
 * @param {string} newStatus - The new status of the task.
 * @throws {Error} If the request fails.
 */
function handleUpdateResponse(response, newStatus) {
  if (!response.ok)
    throw new Error(`Error updating status: ${response.status}`);
}

/**
 * Handles errors by displaying a message.
 *
 * @param {string} message - The error message.
 */
function handleError(message) {
  alert(message);
}
