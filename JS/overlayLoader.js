// Funktion zum Öffnen des Overlays und Laden der Inhalte
// Funktion zum Öffnen des "Add Task"-Overlays
function openAddTaskOverlay() {
  const overlay = document.getElementById("add-task-overlay");
  const overlayContent = document.getElementById("add-task-overlay-content");

  // Overlay sichtbar machen
  overlay.classList.add("active");

  // Lade die gewünschte HTML-Datei und filtere die relevanten Inhalte
  fetch("../html/addTaskOverlay.html")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Fehler beim Laden der Datei");
      }
      return response.text();
    })
    .then((html) => {
      // Temporäres DOM-Element erstellen, um den HTML-Inhalt zu parsen
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = html;

      // Extrahiere nur die gewünschten Elemente
      const relevantContent = tempDiv.querySelectorAll(".background-box");

      // Setze die relevanten Inhalte ins Overlay
      overlayContent.innerHTML = "";
      relevantContent.forEach((el) =>
        overlayContent.appendChild(el.cloneNode(true))
      );
    })
    .catch((error) => {
      overlayContent.innerHTML = `<p>Fehler: ${error.message}</p>`;
    });
}

// Funktion zum Schließen des "Add Task"-Overlays
function closeAddTaskOverlay() {
  const overlay = document.getElementById("add-task-overlay");
  overlay.classList.remove("active");
}

// Funktionen für Overlay Add Tasks
