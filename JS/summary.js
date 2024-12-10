// Firebase-Datenbank-URL (ersetze dies mit deiner eigenen URL)
const databaseURL =
  "https://join-388-default-rtdb.europe-west1.firebasedatabase.app/tasks.json";

// Hauptfunktion zum Laden der Tasks und Aktualisieren der UI
async function loadSummaryData() {
  try {
    const tasks = await fetchTasksFromDatabase();
    if (!tasks) return;

    const counts = calculateTaskCounts(tasks);
    updateUI(counts);
  } catch (error) {
    console.error("Fehler beim Abrufen der Daten:", error);
  }
}

// Funktion zum Abrufen der Daten aus Firebase
async function fetchTasksFromDatabase() {
  const response = await fetch(databaseURL);
  const tasks = await response.json();
  if (!tasks) console.log("Keine Tasks gefunden.");
  return tasks;
}

// Funktion zur Berechnung der Zählerstände
function calculateTaskCounts(tasks) {
  let toDoCount = 0,
    doneCount = 0,
    urgentCount = 0,
    allTasksCount = 0,
    inProgressCount = 0,
    awaitingFeedbackCount = 0;

  Object.values(tasks).forEach((task) => {
    const status = task.status?.trim();
    const priority = task.priority?.trim();

    if (status === "To Do") toDoCount++;
    if (status === "Done") doneCount++;
    if (status === "In Progress") inProgressCount++;
    if (status === "Await Feedback") awaitingFeedbackCount++;
    if (priority === "Urgent") urgentCount++;

    allTasksCount++;
  });

  return {
    toDoCount,
    doneCount,
    urgentCount,
    allTasksCount,
    inProgressCount,
    awaitingFeedbackCount,
  };
}

// Funktion zum Aktualisieren der UI
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

// Daten laden, wenn die Seite fertig geladen ist
document.addEventListener("DOMContentLoaded", loadSummaryData);
