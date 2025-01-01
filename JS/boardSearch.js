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
    const taskTitle = task.querySelector("h4").innerText.toLowerCase(); // Titel in Kleinbuchstaben
    if (taskTitle.includes(searchInput)) {
      task.style.display = "block";
    } else {
      task.style.display = "none";
    }
  });
}
