/**
 * Collects the data for a new task from the form.
 *
 * @returns {Object} The collected task data.
 */
function collectTaskData() {
  return {
    title: getInputValue("title"),
    description: getInputValue("description"),
    dueDate: getInputValue("due-date"),
    assigned: getInputValue("assigned"),
    category: getInputValue("category"),
    priority: getSelectedPriority(),
    subtasks: collectSubtasks(),
  };
}

/**
 * Gets the value of an input field by its ID.
 *
 * @param {string} id - The ID of the input field.
 * @returns {string} The value of the input field.
 */
function getInputValue(id) {
  return document.getElementById(id)?.value || "";
}

/**
 * Gets the selected priority from the priority buttons.
 *
 * @returns {string} The selected priority or "Low" if none is selected.
 */
function getSelectedPriority() {
  return (
    document.querySelector(".priority-buttons .selected")?.textContent || "Low"
  );
}

/**
 * Collects subtasks from the subtask list.
 *
 * @returns {Array<Object>} An array of subtasks.
 */
function collectSubtasks() {
  return Array.from(
    document.querySelectorAll("#subtask-list li .subtask-text")
  ).map((item) => ({
    name: item.textContent,
    completed: false,
  }));
}

/**
 * Adds a new subtask to the list.
 */
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
    input.value = "";
  }
}

/**
 * Edits the text of a subtask.
 *
 * @param {HTMLElement} button - The button that triggers the edit function.
 */
function editSubtask(button) {
  const subtaskText = button.parentElement.querySelector(".subtask-text");
  const newText = prompt("Edit your subtask:", subtaskText.textContent);

  if (newText?.trim()) {
    subtaskText.textContent = newText.trim();
  }
}

/**
 * Clears the form fields and resets them.
 */
function clearFormFields() {
  document.getElementById("titlel").value = "";
  document.getElementById("descriptions").value = "";
  document.getElementById("due-date").value = "";
  document.getElementById("assigned").value = "";
  document.getElementById("category").value = "";
  document.getElementById("subtask-list").innerHTML = "";

  const priorityButtons = document.querySelectorAll(".priority-button");
  priorityButtons.forEach((btn) => btn.classList.remove("selected"));
}

/**
 * Opens the details of a task in an overlay.
 *
 * @param {string} taskId - The ID of the task to display.
 */
function openTaskDetails(taskId) {
  draggedTaskId = taskId;
  const task = getTaskById(taskId);

  if (!task) {
    handleError(`Task not found: ${taskId}`);
    return;
  }
  populateTaskDetailsOverlay(task);
  populateAssignedTo(task.assignedTo);
  populateSubtasks(task.subtasks || []);

  showTaskDetailsOverlay();
}

/**
 * Searches for a task by its ID.
 *
 * @param {string} taskId - The ID of the task to search for.
 * @returns {Object|null} The found task or null if not found.
 */
function getTaskById(taskId) {
  return allTasksData.find((task) => task.id === taskId);
}

/**
 * Populates the overlay with task details.
 *
 * @param {Object} task - The task data to display.
 */
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

/**
 * Populates the assigned participants in the overlay.
 *
 * @param {Array<string>} assignedTo - A list of assigned participants.
 */
function populateAssignedTo(assignedTo) {
  const container = document.getElementById("overlay-assigned-to");
  container.innerHTML = "";

  (assignedTo || []).forEach((person) => {
    const participantContainer = createParticipantElement(person);
    container.appendChild(participantContainer);
  });
}

/**
 * Creates a participant container with initials and name.
 *
 * @param {string} person - The participant's full name.
 * @returns {HTMLElement} The created participant container.
 */
function createParticipantElement(person) {
  const initials = extractInitials(person);
  const backgroundColor = getRandomColor();

  const container = document.createElement("div");
  container.classList.add("participant-container");

  const initialsElement = createInitialsElement(initials, backgroundColor);
  const nameElement = createNameElement(person);

  container.appendChild(initialsElement);
  container.appendChild(nameElement);

  return container;
}

/**
 * Extracts initials from a full name.
 *
 * @param {string} name - The full name of the participant.
 * @returns {string} The extracted initials.
 */
function extractInitials(name) {
  return name
    .split(" ")
    .map((word) => word[0]?.toUpperCase())
    .join("");
}

/**
 * Creates an element displaying the participant's initials.
 *
 * @param {string} initials - The initials of the participant.
 * @param {string} backgroundColor - The background color for the initials.
 * @returns {HTMLElement} The initials element.
 */
function createInitialsElement(initials, backgroundColor) {
  const initialsElement = document.createElement("p");
  initialsElement.classList.add("participant-initials");
  initialsElement.innerText = initials;
  initialsElement.style.backgroundColor = backgroundColor;

  return initialsElement;
}

/**
 * Creates an element displaying the participant's name.
 *
 * @param {string} person - The participant's full name.
 * @returns {HTMLElement} The name element.
 */
function createNameElement(person) {
  const nameElement = document.createElement("span");
  nameElement.classList.add("participant");
  nameElement.innerText = person;

  return nameElement;
}
