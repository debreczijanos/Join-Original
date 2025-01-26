/**
 * Prüft, ob das Gerät ein mobiles oder Tablet-Gerät ist.
 * @returns {boolean} - `true` wenn das Gerät ein Mobilgerät ist, sonst `false`.
 */
function isMobileOrTablet() {
  return /Mobi|Tablet|iPad|iPhone|Android/i.test(navigator.userAgent);
}

/**
 * Zeigt oder versteckt Dropdown-Pfeile basierend auf der Bildschirmgröße.
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
 * Aktualisiert den Task-Status und speichert ihn im Backend.
 * @param {Event} event - Das Klick-Event.
 * @param {string} newStatus - Der neue Status (z.B. 'Done').
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
    if (!response.ok) throw new Error("Fehler beim Aktualisieren.");
    renderKanbanBoard();
    showDropdownOnMobile();
  } catch (error) {
    console.error("Backend-Fehler:", error);
  }
}

/**
 * Schaltet das mobile Dropdown-Menü um.
 * @param {Event} event - Das Klick-Event.
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
 * Blendet den aktuellen Status-Button aus.
 * @param {HTMLElement} taskMenu - Das Task-Menü.
 * @param {string} taskStatus - Der aktuelle Status des Tasks.
 */
function hideCurrentStatusButton(taskMenu, taskStatus) {
  const button = taskMenu.querySelector(
    `.${taskStatus.replace(" ", "-")}-move`
  );
  if (button) button.classList.add("display-none");
}

/**
 * Zeigt oder versteckt das Task-Menü.
 * @param {HTMLElement} taskMenu - Das Task-Menü.
 * @param {HTMLElement} arrow - Der Dropdown-Pfeil.
 */
function toggleMenuVisibility(taskMenu, arrow) {
  const isHidden = taskMenu.classList.toggle("display-none");
  arrow.style.transform = isHidden ? "rotate(0deg)" : "rotate(180deg)";
}

/**
 * Gibt eine Mapping-Tabelle für die Statusnamen zurück.
 * @returns {Object} - Statusnamen-Mapping.
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
 * Beobachtet Änderungen im DOM und aktualisiert die Dropdown-Pfeile.
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

// Initialisierung nach Laden der Seite
document.addEventListener("DOMContentLoaded", () =>
  setTimeout(showDropdownOnMobile, 1000)
);
window.addEventListener("resize", showDropdownOnMobile);
observeDOMChanges();

/**
 * Schließt offene Dropdown-Menüs beim Klick außerhalb.
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
