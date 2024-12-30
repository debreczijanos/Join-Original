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
