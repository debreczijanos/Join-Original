const subtaskInput = document.getElementById("subtaskInput");
const iconAdd = document.getElementById("iconAdd");
const iconCancel = document.getElementById("iconCancel");
const iconConfirm = document.getElementById("iconConfirm");
const subtasksWrapper = document.querySelector(".subtasks-wrapper");
const subtaskList = document.getElementById("subtaskList");

// Funktion: Input beim Klicken auf die Wrapper-Fläche fokussieren
function focusInput() {
  subtaskInput.focus();
}

// Funktion: Icons anzeigen/verstecken
subtaskInput.addEventListener("focus", () => {
  subtasksWrapper.classList.add("focused");
  iconAdd.classList.add("hidden");
  iconCancel.classList.remove("hidden");
  iconConfirm.classList.remove("hidden");
});

subtaskInput.addEventListener("blur", () => {
  if (subtaskInput.value.trim() === "") {
    subtasksWrapper.classList.remove("focused");
    iconAdd.classList.remove("hidden");
    iconCancel.classList.add("hidden");
    iconConfirm.classList.add("hidden");
  }
});

// Funktion: Eingabe löschen (Cancel-Icon)
function clearInput(event) {
  event.stopPropagation(); // Verhindert, dass der Wrapper den Fokus erneut erhält
  subtaskInput.value = ""; // Eingabefeld leeren
  subtaskInput.focus(); // Fokus auf Eingabefeld zurücksetzen
}

// Funktion: Subtask hinzufügen (Confirm-Icon)
function addSubtask(event) {
  event.stopPropagation(); // Verhindert, dass der Wrapper den Fokus erneut erhält

  const subtaskText = subtaskInput.value.trim(); // Hol den Text aus dem Eingabefeld
  if (subtaskText === "") return; // Wenn leer, mache nichts

  // Neues Subtask-Element erstellen
  const subtaskItem = document.createElement("div");
  subtaskItem.classList.add("subtask-item");

  // Text-Element erstellen
  const subtaskTextElement = document.createElement("li");
  subtaskTextElement.textContent = subtaskText;

  // Aktionen (Stift & Korb) erstellen
  const subtaskActions = document.createElement("div");
  subtaskActions.classList.add("subtask-actions");

  // Bearbeiten-Icon
  const editIcon = document.createElement("img");
  editIcon.src = "../img/SubtasksEdit.png"; // Pfad zum Stift-Icon
  editIcon.alt = "Edit";
  editIcon.classList.add("subtask-icon-action");
  editIcon.addEventListener("click", () =>
    editSubtask(subtaskItem, subtaskTextElement)
  );

  // Trennlinie hinzufügen
  const divider = document.createElement("div");
  divider.classList.add("divider");

  // Löschen-Icon
  const deleteIcon = document.createElement("img");
  deleteIcon.src = "../img/SubtasksDel.png"; // Pfad zum Korb-Icon
  deleteIcon.alt = "Delete";
  deleteIcon.classList.add("subtask-icon-action");
  deleteIcon.addEventListener("click", () => deleteSubtask(subtaskItem));

  // Icons und Trennlinie zu den Aktionen hinzufügen
  subtaskActions.appendChild(editIcon);
  subtaskActions.appendChild(divider); // Trennlinie einfügen
  subtaskActions.appendChild(deleteIcon);

  // Subtask-Element zusammensetzen
  subtaskItem.appendChild(subtaskTextElement);
  subtaskItem.appendChild(subtaskActions);

  // Subtask zur Liste hinzufügen
  subtaskList.appendChild(subtaskItem);

  // Eingabefeld leeren und zurücksetzen
  subtaskInput.value = "";
  subtaskInput.focus();
}

// Funktion: Subtask bearbeiten
function editSubtask(subtaskItem, subtaskTextElement) {
  const currentText = subtaskTextElement.textContent;

  // Eingabefeld innerhalb des Subtasks einfügen
  const editInput = document.createElement("input");
  editInput.type = "text";
  editInput.value = currentText;
  editInput.classList.add("edit-input");
  subtaskTextElement.replaceWith(editInput);

  // Bei Enter speichern
  editInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      subtaskTextElement.textContent = editInput.value.trim();
      editInput.replaceWith(subtaskTextElement);
    }
  });

  // Bei Blur speichern
  editInput.addEventListener("blur", () => {
    subtaskTextElement.textContent = editInput.value.trim();
    editInput.replaceWith(subtaskTextElement);
  });

  editInput.focus();
}

// Funktion: Subtask löschen
function deleteSubtask(subtaskItem) {
  subtaskItem.remove(); // Entfernt das Subtask-Element aus der Liste
}
