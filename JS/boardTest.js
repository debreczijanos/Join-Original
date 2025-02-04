/**
 * The URL to the Firebase API for tasks.
 */
const API_URL =
  "https://join-388-default-rtdb.europe-west1.firebasedatabase.app/tasks";

/**
 * The URL to the Firebase API for users.
 */
const API_CONTACTS =
  "https://join-388-default-rtdb.europe-west1.firebasedatabase.app/users.json";

/**
 * Contains all the loaded tasks.
 * @type {Array<Object>}
 */
let allTasksData = [];

/**
 * Opens the "Add Task" window based on the window width.
 *
 * - Mobile devices: Redirects to the "addTask.html" page.
 * - Desktop: Shows a popup for adding tasks.
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
      console.error("The iframe overlay could not be found.");
    }
  }
}

/**
 * Monitors the window size and redirects if the size falls below 950px.
 */
window.addEventListener("resize", function () {
  let screenWidth = window.innerWidth;
  let iframeOverlay = document.getElementById("iframeOverlay");

  if (screenWidth < 950 && !iframeOverlay.classList.contains("d-none")) {
    closeAddTask();
    window.location.href = "../html/addTask.html";
  }
  // showDropdownOnMobile();
});

/**
 * Closes the "Add Task" window and resets the form.
 */
function closeTaskWindow() {
  const taskWindow = document.getElementById("show-hide-class");
  taskWindow.classList.add("d-none");
  clearFormFields();
}

/**
 * Loads all tasks from the Firebase API and renders the Kanban board.
 */
async function loadTasks() {
  try {
    const response = await fetch(`${API_URL}.json`);
    if (!response.ok)
      handleError(`Error fetching data: ${response.statusText}`);
    const tasks = await response.json();
    prepareTasksData(tasks);
    renderKanbanBoard();
  } catch (error) {
    handleError("Error loading tasks");
  }
}

/**
 * Converts the received tasks into a standardized format.
 *
 * @param {Object} tasks - The received tasks.
 */
function prepareTasksData(tasks) {
  allTasksData = Object.entries(tasks).map(([id, task]) => ({
    id,
    ...task,
    subtasks: transformSubtasks(task.subtasks || {}),
  }));
}

/**
 * Converts the subtasks into a standardized format.
 *
 * @param {Object} subtasks - The subtasks of a task.
 * @returns {Array<Object>} The transformed subtasks.
 */
function transformSubtasks(subtasks) {
  return Object.entries(subtasks).map(([key, value]) => {
    if (typeof value === "string") {
      return { name: value, completed: false };
    } else if (typeof value === "object") {
      return value;
    }
    return { name: "Unknown", completed: false };
  });
}

/**
 * Renders the tasks in the Kanban board.
 */
function renderKanbanBoard() {
  const containers = getTaskContainers();
  clearTaskContainers(containers);
  distributeTasks(containers);

  checkEmptyColumns();
}

/**
 * Gets the container elements for the different statuses in the Kanban board.
 *
 * @returns {Object} An object with the containers for "To Do", "In Progress", "Feedback", and "Done".
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
 * Clears the contents of all Kanban board containers.
 *
 * @param {Object} containers - The container elements of the Kanban board.
 */
function clearTaskContainers(containers) {
  Object.values(containers).forEach((container) => (container.innerHTML = ""));
}

/**
 * Distributes the tasks based on their status into the corresponding Kanban containers.
 *
 * @param {Object} containers - The container elements of the Kanban board.
 */
function distributeTasks(containers) {
  allTasksData.forEach((task) => {
    const taskElement = createTaskElement(task);
    appendTaskToContainer(taskElement, containers, task.status || "To Do");
  });
}

/**
 * Adds a task to the appropriate Kanban container based on its status.
 *
 * @param {HTMLElement} taskElement - The task element.
 * @param {Object} containers - The container elements of the Kanban board.
 * @param {string} status - The status of the task.
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
 * Formats the list of assigned persons for display.
 *
 * - Shows the initials of the first two people with random colors.
 * - Adds extra display if more participants are present.
 *
 * @param {Array<string>} assignedTo - List of assigned persons.
 * @returns {string} HTML string with formatted participants.
 */
function formatAssignedTo(assignedTo) {
  if (!assignedTo || assignedTo.length === 0) {
    return "Not assigned";
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
 * Starts the drag-and-drop process for a task.
 *
 * @param {DragEvent} event - The drag event.
 * @param {string} taskId - The ID of the task being dragged.
 */
function dragStart(event, taskId) {
  event.dataTransfer.setData("text/plain", taskId);
}

/**
 * Generates a random HEX color.
 *
 * @returns {string} A random color in HEX format (e.g., "#A1B2C3").
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
 * Fills the list of subtasks in an overlay.
 *
 * - Displays subtasks with checkboxes.
 * - Updates the progress bar based on the subtasks.
 *
 * @param {Array<Object>} subtasks - List of subtasks with their properties.
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
 * Toggles the completion status of a subtask between completed and not completed.
 *
 * @param {number} index - The index of the subtask in the list.
 */
function toggleSubtaskCompletion(index) {
  const task = getTaskById(draggedTaskId);
  if (!task || !task.subtasks || index >= task.subtasks.length) {
    console.error(`Subtask with index ${index} not found.`);
    return;
  }

  task.subtasks[index].completed = !task.subtasks[index].completed;
  updateTaskProgress(draggedTaskId);
  saveSubtaskStatusToBackend(draggedTaskId, task.subtasks);
}

/**
 * Saves the current status of the subtasks to the backend database.
 *
 * @param {string} taskId - The ID of the task.
 * @param {Array<Object>} subtasks - The updated subtasks.
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
        throw new Error(`Error saving subtasks.`);
      }
    })
    .catch((error) =>
      console.error("Error saving subtasks:", error)
    );
}

/**
 * Updates the progress bar based on the status of the subtasks.
 *
 * - Calculates the percentage of completed subtasks.
 * - Updates the progress bar and the text.
 *
 * @param {Array<Object>} subtasks - List of subtasks with their properties.
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
    progressText.innerText = `${completedSubtasks} of ${totalSubtasks} subtasks completed (${progressPercentage.toFixed(
      0
    )}%)`;
  }
}

/**
 * Displays the overlay for task details.
 *
 * Removes the `d-none` class from the overlay to make it visible.
 */
function showTaskDetailsOverlay() {
  const overlay = document.getElementById("task-details-overlay");
  if (overlay) {
    overlay.classList.remove("d-none");
  }
}

/**
 * Closes the task details overlay.
 *
 * Adds the `d-none` class to the overlay to hide it.
 */
function closeTaskDetails() {
  const overlay = document.getElementById("task-details-overlay");
  if (overlay) {
    overlay.classList.add("d-none");
  }
}

/**
 * Closes the task details overlay if clicked outside the content area.
 * @param {MouseEvent} event - The click event.
 */
function closeTaskDetailsOnClick(event) {
  const overlay = document.getElementById("task-details-overlay");
  const overlayContent = overlay.querySelector(".overlay-content");

  // Checks if the click was outside the overlay content
  if (event.target === overlay) {
    closeTaskDetails();
  }
}

// Add event listener for the overlay
document.addEventListener("DOMContentLoaded", function () {
  const overlay = document.getElementById("task-details-overlay");
  if (overlay) {
    overlay.addEventListener("click", closeTaskDetailsOnClick);
  }
});

/**
 * Creates an HTML element for a task.
 *
 * - Adds classes, attributes, and event handlers.
 * - Includes a function to show task details on click.
 *
 * @param {Object} task - The task to create.
 * @returns {HTMLElement} The task HTML element.
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
 * Generates the HTML content for a task.
 *
 * - Displays category, title, description, progress bar, and assignment.
 * - Considers the progress of the subtasks.
 * - Uses different styles based on the category.
 *
 * @param {Object} task - The task to generate HTML for.
 * @returns {string} The HTML content for the task.
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
    <!-- Category at the top -->
    <div class= "category-dropdown">
    <h3 class= "task-category" style="${categoryStyle}"> ${
    task.category || "No Category"
  }</h3>
  <img id="dropdown-arrow" class="display-none dropdown-arrow" src="../img/arrow_drop_down.png " alt="dropdown">
  
 <div class="task-mobile-move display-none">
            <button class="to-do-move">To Do</button>
            <button class="in-progress-move">In Progress</button>
            <button class="await-feedback-move">Await Feedback</button>
            <button class="done-move">Done</button>
        </div>
  
  </div>

    <!-- Title -->
    <h4>${task.title || "No Title"}</h4>

    <!-- Description -->
    <p class= "task-description">${task.description || "No Description"}</p>

    <!-- Progress bar -->
    <div class="progress-container">
      <progress id="overlay-progress" value="${progressPercentage}" max="100"></progress>
      <p>${progressPercentage.toFixed(0)}% of subtasks completed</p>
    </div>

    <!-- Assignment -->
    <p class="initialien"><strong>Assigned to:</strong> ${assignedTo}</p>
  `;
}

/**
 * Updates the progress display of a task based on its subtasks.
 *
 * - Calculates the progress (in percentage).
 * - Updates the progress bar and the text display in HTML.
 *
 * @param {string} taskId - The ID of the task whose progress is being updated.
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
