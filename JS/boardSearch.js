/**
 * Filters displayed tasks based on a search query.
 *
 * This function searches through all tasks (`.task`) in the DOM and displays
 * only those whose title contains the search term.
 *
 * - The search term is retrieved from the input field with the ID `task-search`.
 * - Task titles are compared in lowercase to make the search case-insensitive.
 */
function filterTasks() {
  const searchInput = document
    .getElementById("task-search")
    .value.toLowerCase();
  const tasks = document.querySelectorAll(".task");

  tasks.forEach((task) => {
    const taskTitleH4 = task.querySelector("h4")?.innerText.toLowerCase() || "";
    const taskTitleH3 = task.querySelector("h3")?.innerText.toLowerCase() || "";
    const taskParagraph =
      task.querySelector("p")?.innerText.toLowerCase() || "";

    if (
      taskTitleH4.includes(searchInput) ||
      taskTitleH3.includes(searchInput) ||
      taskParagraph.includes(searchInput)
    ) {
      task.style.display = "block";
    } else {
      task.style.display = "none";
    }
  });
}
