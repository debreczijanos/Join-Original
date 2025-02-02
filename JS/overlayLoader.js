/**
 * Opens the "Add Task" overlay and loads the content dynamically.
 *
 * The HTML content is loaded from a file and filtered to include only the relevant content
 * in the overlay.
 */
function openAddTaskOverlay() {
  const overlay = document.getElementById("add-task-overlay");
  const overlayContent = document.getElementById("add-task-overlay-content");
  overlay.classList.add("active");
  fetch("../html/addTaskOverlay.html")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Error loading the file");
      }
      return response.text();
    })
    .then((html) => {
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = html;

      const relevantContent = tempDiv.querySelectorAll(".background-box");

      overlayContent.innerHTML = "";
      relevantContent.forEach((el) =>
        overlayContent.appendChild(el.cloneNode(true))
      );
    })
    .catch((error) => {
      overlayContent.innerHTML = `<p>Error: ${error.message}</p>`;
    });
}

/**
 * Closes the "Add Task" overlay and removes its visibility.
 */
function closeAddTaskOverlay() {
  const overlay = document.getElementById("add-task-overlay");
  overlay.classList.remove("active");
}
