const API_URL =
  "https://join-388-default-rtdb.europe-west1.firebasedatabase.app/tasks";

const API_CONTACTS =
  "https://join-388-default-rtdb.europe-west1.firebasedatabase.app/users.json";

let allTasksData = [];

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
    return { name: "Unbekannt", completed: false };
  });
}

function renderKanbanBoard() {
  const containers = getTaskContainers();
  clearTaskContainers(containers);
  distributeTasks(containers);

  checkEmptyColumns();
}

function getTaskContainers() {
  return {
    toDo: document.querySelectorAll(".tasks")[0],
    inProgress: document.querySelectorAll(".tasks")[1],
    feedback: document.querySelectorAll(".tasks")[2],
    done: document.querySelectorAll(".tasks")[3],
  };
}

function clearTaskContainers(containers) {
  Object.values(containers).forEach((container) => (container.innerHTML = ""));
}

function distributeTasks(containers) {
  allTasksData.forEach((task) => {
    const taskElement = createTaskElement(task);
    appendTaskToContainer(taskElement, containers, task.status || "To Do");
  });
}

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

function dragStart(event, taskId) {
  event.dataTransfer.setData("text/plain", taskId);
}

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
