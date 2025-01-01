/**
 * Sammelt die Daten eines neuen Tasks aus dem Formular.
 *
 * @returns {Object} Die gesammelten Task-Daten.
 */
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
    completed: false,
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

/**
 * Fügt eine neue Subtask zur Liste hinzu.
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
 * Bearbeitet den Text einer Subtask.
 *
 * @param {HTMLElement} button - Der Button, der die Edit-Funktion auslöst.
 */
function editSubtask(button) {
  const subtaskText = button.parentElement.querySelector(".subtask-text");
  const newText = prompt("Edit your subtask:", subtaskText.textContent);

  if (newText?.trim()) {
    subtaskText.textContent = newText.trim();
  }
}

/**
 * Löscht die Felder des Formulars und setzt sie zurück.
 */
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

/**
 * Öffnet die Details eines Tasks in einem Overlay.
 *
 * @param {string} taskId - Die ID des anzuzeigenden Tasks.
 */
function openTaskDetails(taskId) {
  draggedTaskId = taskId;
  const task = getTaskById(taskId);

  if (!task) {
    handleError(`Task nicht gefunden: ${taskId}`);
    return;
  }
  populateTaskDetailsOverlay(task);
  populateAssignedTo(task.assignedTo);
  populateSubtasks(task.subtasks || []);

  showTaskDetailsOverlay();
}

/**
 * Sucht einen Task anhand seiner ID.
 *
 * @param {string} taskId - Die ID des zu suchenden Tasks.
 * @returns {Object|null} Der gefundene Task oder null, falls nicht vorhanden.
 */
function getTaskById(taskId) {
  return allTasksData.find((task) => task.id === taskId);
}

/**
 * Füllt das Overlay mit den Task-Details.
 *
 * @param {Object} task - Die Daten des anzuzeigenden Tasks.
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
 * Füllt die Teilnehmer-Daten (Assigned To) im Overlay.
 *
 * @param {Array<string>} assignedTo - Eine Liste der zugewiesenen Personen.
 */
function populateAssignedTo(assignedTo) {
  const container = document.getElementById("overlay-assigned-to");
  container.innerHTML = "";

  (assignedTo || []).forEach((person) => {
    const initials = person
      .split(" ")
      .map((word) => word[0]?.toUpperCase())
      .join("");
    const backgroundColor = getRandomColor();

    const participantContainer = document.createElement("div");
    participantContainer.classList.add("participant-container");

    const initialsElement = document.createElement("p");
    initialsElement.classList.add("participant-initials");
    initialsElement.innerText = initials;
    initialsElement.style.backgroundColor = backgroundColor;

    const participant = document.createElement("span");
    participant.classList.add("participant");
    participant.innerText = person;
    participantContainer.appendChild(initialsElement);
    participantContainer.appendChild(participant);
    container.appendChild(participantContainer);
  });
}
