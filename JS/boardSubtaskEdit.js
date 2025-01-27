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
  if (!taskId) return console.error("Task ID missing");

  subtaskList.innerHTML = "";
  try {
    const response = await fetch(`${API_URL}/${taskId}/subtasks.json`);
    if (!response.ok) throw new Error("Failed to fetch subtasks");

    const subtasks = await response.json();
    if (!subtasks) return;

    subtaskList.innerHTML = "";
    Object.values(subtasks).forEach((subtask) =>
      subtaskList.appendChild(createSubtaskElement(subtask.name))
    );
  } catch (error) {
    console.error("Error loading subtasks:", error);
  }
}

/**
 * Fügt einen neuen Subtask hinzu.
 * @param {Event} event - Das Event-Objekt.
 */
async function addSubtask(event) {
  if (isAddingSubtask) return;
  isAddingSubtask = true;
  event.stopPropagation();
  iconConfirm.disabled = true;

  const subtaskText = subtaskInput.value.trim();
  if (!currentSubtaskTaskId || !subtaskText) return resetState();

  try {
    const response = await fetch(
      `${API_URL}/${currentSubtaskTaskId}/subtasks.json`
    );
    const subtasks = (await response.json()) || [];

    const newIndex = Object.keys(subtasks).length;
    const newSubtask = { name: subtaskText, completed: false };

    await fetch(
      `${API_URL}/${currentSubtaskTaskId}/subtasks/${newIndex}.json`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSubtask),
      }
    );

    subtaskList.appendChild(createSubtaskElement(subtaskText));
    subtaskInput.value = "";
    subtaskInput.focus();
  } catch (error) {
    console.error("Error adding subtask:", error);
  } finally {
    resetState();
  }
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
 * Bearbeitet einen Subtask, indem ein Eingabefeld angezeigt wird.
 * @param {HTMLElement} subtaskItem - Das Subtask-Element.
 * @param {HTMLElement} subtaskTextElement - Der Subtask-Text.
 */
function editSubtask(subtaskItem, subtaskTextElement) {
  const input = document.createElement("input");
  input.type = "text";
  input.value = subtaskTextElement.textContent.trim();
  input.classList.add("edit-input");

  subtaskItem.replaceChild(input, subtaskTextElement);
  input.focus();

  input.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      e.preventDefault(); // Verhindert das Schließen des Overlays
      saveSubtaskEdit(input, subtaskTextElement, subtaskItem);
    }
  });

  input.addEventListener("blur", () => {
    saveSubtaskEdit(input, subtaskTextElement, subtaskItem);
  });
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
    input.focus();
    return;
  }

  const taskId = currentSubtaskTaskId;
  if (!taskId) {
    console.error("Task ID fehlt, Subtask kann nicht aktualisiert werden.");
    return;
  }

  try {
    // Hole die aktuellen Subtasks
    const response = await fetch(`${API_URL}/${taskId}/subtasks.json`);
    const subtasks = await response.json();

    // Finde den entsprechenden Subtask
    const subtaskKey = Object.keys(subtasks).find(
      (key) => subtasks[key].name === subtaskTextElement.textContent.trim()
    );

    if (subtaskKey) {
      await fetch(`${API_URL}/${taskId}/subtasks/${subtaskKey}.json`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newValue }),
      });

      console.log("Subtask erfolgreich aktualisiert:", newValue);

      // Überprüfen, ob subtaskTextElement noch im subtaskItem vorhanden ist
      if (subtaskItem.contains(input)) {
        subtaskTextElement.textContent = newValue;
        subtaskItem.replaceChild(subtaskTextElement, input);
      } else {
        console.error("Das ursprüngliche Element ist nicht mehr vorhanden.");
      }
    } else {
      console.error("Subtask nicht gefunden.");
    }
  } catch (error) {
    console.error("Fehler beim Speichern des Subtasks:", error);
  }
}

/**
 * Löscht einen Subtask aus der UI und dem Backend.
 * @param {HTMLElement} subtaskItem - Das zu löschende Subtask-Element.
 */
async function deleteSubtask(subtaskItem) {
  if (!confirm("Möchtest du diesen Subtask wirklich löschen?")) return;

  const taskId = currentSubtaskTaskId;
  if (!taskId) {
    console.error("Task ID fehlt, Subtask kann nicht gelöscht werden.");
    return;
  }

  try {
    const response = await fetch(`${API_URL}/${taskId}/subtasks.json`);
    const subtasks = await response.json();

    // Subtask anhand des Textes identifizieren
    const subtaskKey = Object.keys(subtasks).find(
      (key) =>
        subtasks[key].name ===
        subtaskItem.querySelector("li").textContent.trim()
    );

    if (subtaskKey) {
      await fetch(`${API_URL}/${taskId}/subtasks/${subtaskKey}.json`, {
        method: "DELETE",
      });

      console.log("Subtask erfolgreich gelöscht:", subtaskItem.textContent);
      subtaskItem.remove();
    } else {
      console.error("Subtask zum Löschen nicht gefunden.");
    }
  } catch (error) {
    console.error("Fehler beim Löschen des Subtasks:", error);
  }
}
