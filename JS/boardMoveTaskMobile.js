/**
 * Checks if the device is a mobile or tablet device.
 * @returns {boolean} - `true` if the device is mobile, otherwise `false`.
 */
function isMobileOrTablet() {
  return /Mobi|Tablet|iPad|iPhone|Android/i.test(navigator.userAgent);
}

/**
 * Shows or hides dropdown arrows based on screen size.
 */
function showDropdownOnMobile() {
  const dropdownArrows = document.querySelectorAll("#dropdown-arrow");
  if (dropdownArrows.length === 0) return;

  const isMobile = window.innerWidth <= 950 || isMobileOrTablet();
  dropdownArrows.forEach((arrow) => {
    arrow.classList.toggle("display-none", !isMobile);
    isMobile
      ? arrow.addEventListener("click", toggleMobileDropdown)
      : arrow.removeEventListener("click", toggleMobileDropdown);
  });
}

/**
 * Updates the task status and saves it in the backend.
 * @param {Event} event - The click event.
 * @param {string} newStatus - The new status (e.g., 'Done').
 */
async function moveTask(event, newStatus) {
  event.stopPropagation();
  const taskElement = event.target.closest(".task");
  if (!taskElement) return;
  const taskId = taskElement.getAttribute("data-id");
  if (!taskId) return;
  allTasksData.find((task) => task.id === taskId).status = newStatus;
  try {
    const response = await fetch(`${API_URL}/${taskId}.json`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    if (!response.ok) throw new Error("Error updating status.");
    renderKanbanBoard();
    showDropdownOnMobile();
  } catch (error) {
    console.error("Backend error:", error);
  }
}

/**
 * Toggles the mobile dropdown menu.
 * @param {Event} event - The click event.
 */
function toggleMobileDropdown(event) {
  event.stopPropagation();
  const taskElement = event.target.closest(".category-dropdown");
  const taskMenu = taskElement.querySelector(".task-mobile-move");
  const taskStatus = taskElement
    .closest(".kanban-column")
    .getAttribute("data-status");

  taskMenu.querySelectorAll("button").forEach((btn) => {
    btn.classList.remove("display-none");
    btn.onclick = (e) => moveTask(e, getStatusMap()[btn.classList[0]]);
  });

  hideCurrentStatusButton(taskMenu, taskStatus);
  toggleMenuVisibility(taskMenu, event.target);
}

/**
 * Hides the button for the current task status.
 * @param {HTMLElement} taskMenu - The task menu.
 * @param {string} taskStatus - The current task status.
 */
function hideCurrentStatusButton(taskMenu, taskStatus) {
  const button = taskMenu.querySelector(
    `.${taskStatus.replace(" ", "-")}-move`
  );
  if (button) button.classList.add("display-none");
}

/**
 * Shows or hides the task menu.
 * @param {HTMLElement} taskMenu - The task menu.
 * @param {HTMLElement} arrow - The dropdown arrow.
 */
function toggleMenuVisibility(taskMenu, arrow) {
  const isHidden = taskMenu.classList.toggle("display-none");
  arrow.style.transform = isHidden ? "rotate(0deg)" : "rotate(180deg)";
}

/**
 * Returns a mapping table for status names.
 * @returns {Object} - Status name mapping.
 */
function getStatusMap() {
  return {
    "to-do-move": "To Do",
    "in-progress-move": "In Progress",
    "await-feedback-move": "Await Feedback",
    "done-move": "Done",
  };
}

/**
 * Observes changes in the DOM and updates dropdown arrows accordingly.
 */
function observeDOMChanges() {
  const kanbanBoard = document.getElementById("kanban-board");
  if (!kanbanBoard)
    return document.addEventListener("DOMContentLoaded", observeDOMChanges);

  const observer = new MutationObserver(() => {
    showDropdownOnMobile();
  });

  observer.observe(kanbanBoard, { childList: true, subtree: true });
}

/**
 * Initialization after the page loads
 */
document.addEventListener("DOMContentLoaded", () =>
  setTimeout(showDropdownOnMobile, 1000)
);
window.addEventListener("resize", showDropdownOnMobile);
observeDOMChanges();

/**
 * Closes open dropdown menus when clicking outside.
 */
document.addEventListener("click", (event) => {
  document
    .querySelectorAll(".task-mobile-move:not(.display-none)")
    .forEach((menu) => {
      if (
        !menu.contains(event.target) &&
        !event.target.closest("#dropdown-arrow")
      ) {
        menu.classList.add("display-none");
        menu
          .closest(".category-dropdown")
          .querySelector("#dropdown-arrow").style.transform = "rotate(0deg)";
      }
    });
});
