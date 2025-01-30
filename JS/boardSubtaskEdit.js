// Selektoren für Subtask-Funktionen
const subtaskInput = document.getElementById("subtaskInput");
const iconAdd = document.getElementById("iconAdd");
const iconCancel = document.getElementById("iconCancel");
const iconConfirm = document.getElementById("iconConfirm");
const subtasksWrapper = document.querySelector(".subtasks-wrapper");
const subtaskList = document.getElementById("subtaskList");

let currentSubtaskTaskId = null;
let isAddingSubtask = false;

document.addEventListener("DOMContentLoaded", setupEventListeners);

/**
 * Initialisiert Event-Listener.
 */
function setupEventListeners() {
  subtasksWrapper.removeEventListener("click", focusInput);
  subtasksWrapper.addEventListener("click", focusInput);

  iconCancel.removeEventListener("click", clearInput);
  iconCancel.addEventListener("click", clearInput);

  iconConfirm.removeEventListener("click", addSubtask);
  iconConfirm.addEventListener("click", addSubtask);
}

/**
 * Fokussiert das Eingabefeld.
 */
function focusInput() {
  subtaskInput.focus();
}

/**
 * Richtet die Event-Listener für das Eingabefeld ein.
 */
function setupInputFocusListeners() {
  subtaskInput.addEventListener("focus", showInputIcons);
  subtaskInput.addEventListener("blur", hideInputIconsIfEmpty);
}

/**
 * Zeigt Eingabe-Icons.
 */
function showInputIcons() {
  subtasksWrapper.classList.add("focused");
  toggleIconsVisibility(false);
}

/**
 * Versteckt Icons bei leerem Input.
 */
function hideInputIconsIfEmpty() {
  if (subtaskInput.value.trim() === "") {
    subtasksWrapper.classList.remove("focused");
    toggleIconsVisibility(true);
  }
}

/**
 * Schaltet Icon-Sichtbarkeit.
 * @param {boolean} showAddIcon - Ob das Add-Icon angezeigt wird.
 */
function toggleIconsVisibility(showAddIcon) {
  iconAdd.classList.toggle("hidden", !showAddIcon);
  iconCancel.classList.toggle("hidden", showAddIcon);
  iconConfirm.classList.toggle("hidden", showAddIcon);
}

/**
 * Leert das Eingabefeld.
 * @param {Event} event - Das Event-Objekt.
 */
function clearInput(event) {
  event.stopPropagation();
  subtaskInput.value = "";
  subtaskInput.focus();
}

/**
 * Setzt die Task-ID für Subtasks.
 * @param {string} taskId - Die ID des Tasks.
 */
function openEditTaskOverlay(taskId) {
  if (currentSubtaskTaskId === taskId) return;
  currentSubtaskTaskId = taskId;
  loadExistingSubtasks(taskId);
}

/**
 * Lädt Subtasks von der API.
 * @param {string} taskId - Die ID des Tasks.
 */
async function loadExistingSubtasks(taskId) {
  if (!taskId) {
    console.error("Task ID fehlt.");
    return;
  }

  subtaskList.innerHTML = ""; // Vorherigen Inhalt leeren

  try {
    const response = await fetch(`${API_URL}/${taskId}/subtasks.json`);
    if (!response.ok) throw new Error("Fehler beim Abrufen der Subtasks");

    const subtasks = await response.json();

    // Falls subtasks `null` oder leer sind, abbrechen
    if (
      !subtasks ||
      typeof subtasks !== "object" ||
      Object.keys(subtasks).length === 0
    ) {
      return; // Macht einfach nichts
    }

    const subtaskArray = Object.values(subtasks);

    if (subtaskArray.length === 0) {
      console.warn("Keine Subtasks gefunden.");
      return;
    }

    // Subtasks rendern
    subtaskArray.forEach((subtask) => {
      if (!subtask || !subtask.name) {
        console.warn("Ungültige Subtask-Daten", subtask);
        return;
      }
      subtaskList.appendChild(createSubtaskElement(subtask.name));
    });
  } catch (error) {
    console.error("Fehler beim Laden der Subtasks:", error);
    alert("Fehler beim Laden der Subtasks.");
  }
}

/**
 * Fügt einen neuen Subtask hinzu.
 */
async function addSubtask(event) {
  if (isAddingSubtask) return;
  isAddingSubtask = true;
  event.stopPropagation();

  const subtaskText = subtaskInput.value.trim();
  if (!currentSubtaskTaskId || !subtaskText) return resetState();

  try {
    await saveNewSubtask(subtaskText);
    updateUIAfterAdd(subtaskText);
  } catch (error) {
    alert("Subtask konnte nicht hinzugefügt werden");
  } finally {
    resetState();
  }
}

/**
 * Speichert einen neuen Subtask in der Datenbank.
 */
async function saveNewSubtask(subtaskText) {
  const response = await fetch(
    `${API_URL}/${currentSubtaskTaskId}/subtasks.json`
  );
  const subtasks = (await response.json()) || [];
  const newIndex = Object.keys(subtasks).length;

  await fetch(`${API_URL}/${currentSubtaskTaskId}/subtasks/${newIndex}.json`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: subtaskText, completed: false }),
  });
}

/**
 * Aktualisiert die UI nach Hinzufügen eines Subtasks.
 */
function updateUIAfterAdd(subtaskText) {
  subtaskList.appendChild(createSubtaskElement(subtaskText));
  subtaskInput.value = "";
  subtaskInput.focus();
}

/**
 * Setzt die Subtask-Bearbeitung zurück.
 */
function resetState() {
  isAddingSubtask = false;
  iconConfirm.disabled = false;
}

/**
 * Erstellt ein Subtask-Element mit Bearbeitungs- und Löschfunktionen.
 * @param {string} text - Der Name des Subtasks.
 * @returns {HTMLElement} Das erstellte Element.
 */
function createSubtaskElement(text) {
  const subtaskItem = document.createElement("div");
  subtaskItem.classList.add("subtask-item");

  const subtaskTextElement = document.createElement("li");
  subtaskTextElement.textContent = text;

  const actions = document.createElement("div");
  actions.classList.add("subtask-actions");

  const editIcon = createIcon("../img/SubtasksEdit.png", "Edit", () =>
    editSubtask(subtaskItem, subtaskTextElement)
  );

  const deleteIcon = createIcon("../img/SubtasksDel.png", "Delete", () =>
    deleteSubtask(subtaskItem)
  );

  actions.appendChild(editIcon);
  actions.appendChild(deleteIcon);

  subtaskItem.appendChild(subtaskTextElement);
  subtaskItem.appendChild(actions);

  return subtaskItem;
}

/**
 * Erstellt Aktions-Icons.
 * @param {HTMLElement} subtaskItem - Das Subtask-Element.
 * @param {HTMLElement} subtaskTextElement - Der Subtask-Text.
 * @returns {HTMLElement} Die Aktionselemente.
 */
function createSubtaskActions(subtaskItem, subtaskTextElement) {
  const actions = document.createElement("div");
  actions.classList.add("subtask-actions");

  const editIcon = createIcon("../img/SubtasksEdit.png", "Edit", () =>
    editSubtask(subtaskItem, subtaskTextElement)
  );
  const deleteIcon = createIcon("../img/SubtasksDel.png", "Delete", () =>
    deleteSubtask(subtaskItem)
  );

  actions.append(editIcon, deleteIcon);
  return actions;
}

/**
 * Erstellt ein Icon.
 * @param {string} src - Der Bildpfad.
 * @param {string} alt - Der Alternativtext.
 * @param {Function} clickHandler - Klick-Handler-Funktion.
 * @returns {HTMLElement} Das Icon-Element.
 */
function createIcon(src, alt, clickHandler) {
  const icon = document.createElement("img");
  icon.src = src;
  icon.alt = alt;
  icon.classList.add("subtask-icon-action");
  icon.addEventListener("click", clickHandler);
  return icon;
}

/**
 * Bearbeitet einen Subtask.
 */
function editSubtask(subtaskItem, subtaskTextElement) {
  // Prüfen ob bereits im Bearbeitungsmodus
  if (subtaskItem.querySelector(".edit-input")) {
    return;
  }

  const input = createEditInput(subtaskTextElement);
  setupEditListeners(input, subtaskItem, subtaskTextElement);
  replaceTextWithInput(subtaskItem, input, subtaskTextElement);
}

/**
 * Erstellt Input-Element für die Bearbeitung.
 */
function createEditInput(textElement) {
  const input = document.createElement("input");
  input.type = "text";
  input.value = textElement.textContent.trim();
  input.classList.add("edit-input");
  return input;
}

/**
 * Richtet Event-Listener für die Bearbeitung ein.
 */
function setupEditListeners(input, subtaskItem, textElement) {
  input.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      saveSubtaskEdit(input, textElement, subtaskItem);
    }
  });

  input.addEventListener("blur", () => {
    saveSubtaskEdit(input, textElement, subtaskItem);
  });
}

/**
 * Ersetzt Text-Element mit Input-Element.
 */
function replaceTextWithInput(subtaskItem, input, textElement) {
  subtaskItem.replaceChild(input, textElement);
  input.focus();
}

/**
 * Speichert Subtask-Änderungen in der Firebase-Datenbank.
 * @param {HTMLInputElement} input - Das Eingabefeld.
 * @param {HTMLElement} subtaskTextElement - Der ursprüngliche Text-Container.
 * @param {HTMLElement} subtaskItem - Das Subtask-Element.
 */
async function saveSubtaskEdit(input, subtaskTextElement, subtaskItem) {
  const newValue = input.value.trim();
  if (!newValue) {
    alert("Das Subtask-Feld darf nicht leer sein.");
    // Wenn leer, zurück zum ursprünglichen Text
    subtaskItem.replaceChild(subtaskTextElement, input);
    return;
  }

  const taskId = currentSubtaskTaskId;
  if (!taskId) {
    subtaskItem.replaceChild(subtaskTextElement, input);
    return;
  }

  try {
    const response = await fetch(`${API_URL}/${taskId}/subtasks.json`);
    const subtasks = await response.json();

    if (!subtasks) {
      subtaskItem.replaceChild(subtaskTextElement, input);
      return;
    }

    const subtaskKey = Object.keys(subtasks).find(
      (key) => subtasks[key]?.name === subtaskTextElement.textContent.trim()
    );

    if (!subtaskKey) {
      subtaskItem.replaceChild(subtaskTextElement, input);
      return;
    }

    await fetch(`${API_URL}/${taskId}/subtasks/${subtaskKey}.json`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newValue }),
    });

    subtaskTextElement.textContent = newValue;
    subtaskItem.replaceChild(subtaskTextElement, input);
  } catch (error) {
    alert("Fehler beim Speichern");
    subtaskItem.replaceChild(subtaskTextElement, input);
  }
}

/**
 * Löscht einen Subtask.
 */
async function deleteSubtask(subtaskItem) {
  if (!currentSubtaskTaskId) return;

  try {
    const subtasks = await fetchSubtasks();
    if (!subtasks) {
      subtaskItem.remove();
      return;
    }

    await deleteSubtaskFromDB(subtasks, subtaskItem);
    await reindexSubtasks(subtasks, subtaskItem);
    subtaskItem.remove();
  } catch (error) {
    alert("Subtask konnte nicht gelöscht werden");
  }
}

/**
 * Holt Subtasks von der Datenbank.
 */
async function fetchSubtasks() {
  const response = await fetch(
    `${API_URL}/${currentSubtaskTaskId}/subtasks.json`
  );
  return await response.json();
}

/**
 * Löscht Subtask aus der Datenbank.
 */
async function deleteSubtaskFromDB(subtasks, subtaskItem) {
  const subtaskText = subtaskItem.querySelector("li")?.textContent.trim();
  const subtaskKey = Object.keys(subtasks).find(
    (key) => subtasks[key]?.name === subtaskText
  );

  if (subtaskKey) {
    await fetch(
      `${API_URL}/${currentSubtaskTaskId}/subtasks/${subtaskKey}.json`,
      {
        method: "DELETE",
      }
    );
  }
}

/**
 * Reindexiert die verbleibenden Subtasks.
 */
async function reindexSubtasks(subtasks, deletedItem) {
  const remainingSubtasks = {};
  let newIndex = 0;
  const deletedText = deletedItem.querySelector("li")?.textContent.trim();

  for (const key in subtasks) {
    if (subtasks[key]?.name !== deletedText) {
      remainingSubtasks[newIndex] = subtasks[key];
      newIndex++;
    }
  }

  await fetch(`${API_URL}/${currentSubtaskTaskId}/subtasks.json`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(remainingSubtasks),
  });
}
