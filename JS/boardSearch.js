/**
 * Filtert die angezeigten Aufgaben basierend auf einer Suchanfrage.
 *
 * Die Funktion durchsucht alle Aufgaben (`.task`) im DOM und zeigt
 * nur die Aufgaben an, deren Titel den Suchbegriff enthält.
 *
 * - Der Suchbegriff wird aus dem Eingabefeld mit der ID `task-search` geholt.
 * - Die Titel der Aufgaben werden in Kleinbuchstaben verglichen, um die Suche case-insensitive zu machen.
 */
function filterTasks() {
  const searchInput = document
    .getElementById("task-search")
    .value.toLowerCase();
  const tasks = document.querySelectorAll(".task");

  tasks.forEach((task) => {
    // Hole den Textinhalt von h4, h3 und p innerhalb der Aufgabe
    const taskTitleH4 = task.querySelector("h4")?.innerText.toLowerCase() || "";
    const taskTitleH3 = task.querySelector("h3")?.innerText.toLowerCase() || "";
    const taskParagraph =
      task.querySelector("p")?.innerText.toLowerCase() || "";

    // Prüfe, ob einer der Texte die Suchanfrage enthält
    if (
      taskTitleH4.includes(searchInput) ||
      taskTitleH3.includes(searchInput) ||
      taskParagraph.includes(searchInput)
    ) {
      task.style.display = "block"; // Zeige die Aufgabe an
    } else {
      task.style.display = "none"; // Verberge die Aufgabe
    }
  });
}
