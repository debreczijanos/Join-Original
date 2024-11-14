function createPreContainer() {
    let taskContainer = document.createElement("div");
    taskContainer.classList.add("task-container"); // Klasse für Styling hinzufügen
    taskContainer.innerHTML = "No tasks To do"; // Textinhalt setzen
    
    document.getElementById("content").appendChild(taskContainer); // In 'content' hinzufügen
}
