/**
 * URL of the Firebase database (replace with your own URL).
 */
const databaseURL =
  "https://join-388-default-rtdb.europe-west1.firebasedatabase.app/tasks.json";

/**
 * Main function to load the tasks and update the UI.
 *
 * This function fetches the tasks from the database, calculates the task counts,
 * and updates the user interface.
 */
async function loadSummaryData() {
  try {
    const tasks = await fetchTasksFromDatabase();
    if (!tasks) return;

    const counts = calculateTaskCounts(tasks);
    updateUI(counts);
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

/**
 * Fetches the task data from the Firebase database.
 *
 * @returns {Object|null} The fetched tasks or null if no data was found.
 */
async function fetchTasksFromDatabase() {
  const response = await fetch(databaseURL);
  const tasks = await response.json();
  if (!tasks) console.log("No tasks found.");
  return tasks;
}

/**
 * Calculates the counts based on the task data.
 *
 * @param {Object} tasks - The task data from the database.
 * @returns {Object} An object with the counts for different categories.
 */
function calculateTaskCounts(tasks) {
  const counts = initializeCounts();

  Object.values(tasks).forEach(({ status = "", prio = "" }) => {
    updateStatusCounts(counts, status.trim());
    updatePriorityCounts(counts, prio.trim());
    counts.allTasksCount++;
  });

  return counts;
}

/**
 * Initializes the counts object.
 *
 * @returns {Object} An object with all counters set to 0.
 */
function initializeCounts() {
  return {
    toDoCount: 0,
    doneCount: 0,
    urgentCount: 0,
    allTasksCount: 0,
    inProgressCount: 0,
    awaitingFeedbackCount: 0,
  };
}

/**
 * Updates the task count based on the status.
 *
 * @param {Object} counts - The counts object.
 * @param {string} status - The task status.
 */
function updateStatusCounts(counts, status) {
  switch (status) {
    case "To Do":
      counts.toDoCount++;
      break;
    case "Done":
      counts.doneCount++;
      break;
    case "In Progress":
      counts.inProgressCount++;
      break;
    case "Await Feedback":
      counts.awaitingFeedbackCount++;
      break;
  }
}

/**
 * Updates the task count based on priority.
 *
 * @param {Object} counts - The counts object.
 * @param {string} prio - The task priority.
 */
function updatePriorityCounts(counts, prio) {
  if (prio === "Urgent") counts.urgentCount++;
}

/**
 * Updates the user interface with the calculated counts.
 *
 * @param {Object} counts - An object with the counts.
 */
function updateUI(counts) {
  document.querySelector(".summary-to-do").textContent = counts.toDoCount;
  document.querySelector(".summary-done").textContent = counts.doneCount;
  document.querySelector(".urgent-number").textContent = counts.urgentCount;
  document.querySelector(".all-tasks-board").textContent = counts.allTasksCount;
  document.querySelector(".tasks-in-progress").textContent =
    counts.inProgressCount;
  document.querySelector(".awaiting-feedback").textContent =
    counts.awaitingFeedbackCount;
}

/**
 * Loads data when the page has finished loading.
 */
document.addEventListener("DOMContentLoaded", loadSummaryData);
