/**
 * Öffnet das "Add Task"-Overlay und lädt die Inhalte dynamisch.
 *
 * Die HTML-Inhalte werden von einer Datei geladen und gefiltert,
 * um nur die relevanten Inhalte in das Overlay zu setzen.
 */
function openAddTaskOverlay() {
  const overlay = document.getElementById("add-task-overlay");
  const overlayContent = document.getElementById("add-task-overlay-content");
  overlay.classList.add("active");
  fetch("../html/addTaskOverlay.html")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Fehler beim Laden der Datei");
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
      overlayContent.innerHTML = `<p>Fehler: ${error.message}</p>`;
    });
}

/**
 * Schließt das "Add Task"-Overlay und entfernt die Sichtbarkeit.
 */
function closeAddTaskOverlay() {
  const overlay = document.getElementById("add-task-overlay");
  overlay.classList.remove("active");
}
