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
 * Generates the HTML for a participant's initials.
 *
 * @param {string} person - The name of the participant.
 * @returns {string} HTML span element with initials and background color.
 */
function generateParticipantSpan(person) {
  const initials = extractInitials(person);
  const randomColor = getRandomColor();

  return `<span class="participant" style="background-color: ${randomColor};">
              ${initials}
            </span>`;
}
