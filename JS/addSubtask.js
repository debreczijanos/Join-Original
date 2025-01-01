const subtaskInput = document.getElementById("subtaskInput");
const iconAdd = document.getElementById("iconAdd");
const iconCancel = document.getElementById("iconCancel");
const iconConfirm = document.getElementById("iconConfirm");
const subtasksWrapper = document.querySelector(".subtasks-wrapper");
const subtaskList = document.getElementById("subtaskList");

/**
 * Funktion: Input beim Klicken auf die Wrapper-Fläche fokussieren
 */
function focusInput() {
  subtaskInput.focus();
}

/**
 * Funktion: Icons basierend auf Fokus aktualisieren
 */
function setupInputFocusListeners() {
  subtaskInput.addEventListener("focus", () => showInputIcons());
  subtaskInput.addEventListener("blur", () => hideInputIconsIfEmpty());
}

/**
 * Zeigt die Icons für das Eingabefeld an.
 */
function showInputIcons() {
  subtasksWrapper.classList.add("focused");
  toggleIconsVisibility(false);
}

/**
 * Versteckt die Icons für das Eingabefeld, wenn es leer ist.
 */
function hideInputIconsIfEmpty() {
  if (subtaskInput.value.trim() === "") {
    subtasksWrapper.classList.remove("focused");
    toggleIconsVisibility(true);
  }
}

/**
 * Schaltet die Sichtbarkeit von Icons basierend auf dem Zustand.
 *
 * @param {boolean} showAddIcon - Wenn true, wird das "Hinzufügen"-Icon angezeigt.
 */
function toggleIconsVisibility(showAddIcon) {
  iconAdd.classList.toggle("hidden", !showAddIcon);
  iconCancel.classList.toggle("hidden", showAddIcon);
  iconConfirm.classList.toggle("hidden", showAddIcon);
}

/**
 * Löscht den Inhalt des Eingabefelds und setzt den Fokus darauf.
 *
 * @param {event} event - Das Klick-Event.
 */
function clearInput(event) {
  event.stopPropagation();
  subtaskInput.value = "";
  subtaskInput.focus();
}

/**
 *  Fügt einen neuen Subtask zur Liste hinzu.
 *
 * @param {event} event - Das Klick-Event.
 */
function addSubtask(event) {
  event.stopPropagation();

  const subtaskText = subtaskInput.value.trim();
  if (!subtaskText) return;

  const subtaskItem = createSubtaskElement(subtaskText);
  subtaskList.appendChild(subtaskItem);

  resetSubtaskInput();
}

/**
 * Erstellt ein neues Subtask-Element.
 *
 * @param {string} text - Der Text des Subtasks.
 * @returns {HTMLElement} Das Subtask-Element.
 */
function createSubtaskElement(text) {
  const subtaskItem = document.createElement("div");
  subtaskItem.classList.add("subtask-item");

  const subtaskTextElement = createSubtaskText(text);
  const subtaskActions = createSubtaskActions(subtaskItem, subtaskTextElement);

  subtaskItem.appendChild(subtaskTextElement);
  subtaskItem.appendChild(subtaskActions);

  return subtaskItem;
}

/**
 * Erstellt ein Text-Element für den Subtask.
 *
 * @param {string} text - Der Text des Subtasks.
 * @returns {HTMLElement} Das Text-Element.
 */
function createSubtaskText(text) {
  const textElement = document.createElement("li");
  textElement.textContent = text;
  return textElement;
}

/**
 * Erstellt die Aktions-Icons für einen Subtask.
 *
 * @param {HTMLElement} subtaskItem - Das Subtask-Element.
 * @param {HTMLElement} subtaskTextElement - Das Text-Element des Subtasks.
 * @returns {HTMLElement} Der Container mit den Aktionen.
 */
function createSubtaskActions(subtaskItem, subtaskTextElement) {
  const actions = document.createElement("div");
  actions.classList.add("subtask-actions");
  const editIcon = createIcon("../img/SubtasksEdit.png", "Edit", () =>
    editSubtask(subtaskItem, subtaskTextElement)
  );
  const divider = createDivider();
  const deleteIcon = createIcon("../img/SubtasksDel.png", "Delete", () =>
    deleteSubtask(subtaskItem)
  );

  actions.appendChild(editIcon);
  actions.appendChild(divider);
  actions.appendChild(deleteIcon);

  return actions;
}

/**
 * Erstellt ein Icon-Element mit einem Klick-Handler.
 *
 * @param {string} src - Der Pfad zur Icon-Datei.
 * @param {string} alt - Der Alternativtext für das Icon.
 * @param {Function} clickHandler - Der Klick-Handler für das Icon.
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
 * Erstellt einen Trenner für die Subtask-Aktionen.
 *
 * @returns {HTMLElement} Das Trenner-Element.
 */
function createDivider() {
  const divider = document.createElement("div");
  divider.classList.add("divider");
  return divider;
}

/**
 * Setzt das Eingabefeld zurück.
 */
function resetSubtaskInput() {
  subtaskInput.value = "";
  subtaskInput.focus();
}

/**
 * Ermöglicht das Bearbeiten eines Subtasks.
 *
 * @param {HTMLElement} subtaskItem - Das Subtask-Element.
 * @param {HTMLElement} subtaskTextElement - Das Text-Element des Subtasks.
 */
function editSubtask(subtaskItem, subtaskTextElement) {
  const editInput = createEditInput(subtaskTextElement.textContent);
  subtaskTextElement.replaceWith(editInput);
  let hasSaved = false;
  const saveHandler = () => {
    if (!hasSaved) {
      hasSaved = true;
      saveSubtaskEdit(editInput, subtaskTextElement);
    }
  };

  editInput.addEventListener("keypress", (e) => handleEditSave(e, saveHandler));
  editInput.addEventListener("blur", saveHandler);
  editInput.focus();
}

/**
 * Erstellt ein Eingabefeld für das Bearbeiten eines Subtasks.
 *
 * @param {string} value - Der aktuelle Text des Subtasks.
 * @returns {HTMLElement} Das Eingabefeld.
 */
function createEditInput(value) {
  const input = document.createElement("input");
  input.type = "text";
  input.value = value;
  input.classList.add("edit-input");
  return input;
}

/**
 * Speichert die Bearbeitung eines Subtasks.
 *
 * @param {KeyboardEvent} event - Das Keyboard-Event.
 * @param {Function} saveHandler - Die Funktion, die das Speichern ausführt.
 */
function handleEditSave(event, saveHandler) {
  if (event.key === "Enter") {
    saveHandler();
  }
}

/**
 * Speichert den bearbeiteten Subtask.
 *
 * @param {HTMLElement} editInput - Das Eingabefeld für die Bearbeitung.
 * @param {HTMLElement} subtaskTextElement - Das Text-Element des Subtasks.
 */
function saveSubtaskEdit(editInput, subtaskTextElement) {
  subtaskTextElement.textContent = editInput.value.trim();
  editInput.replaceWith(subtaskTextElement);
}

/**
 * Löscht einen Subtask aus der Liste.
 *
 * @param {HTMLElement} subtaskItem - Das Subtask-Element, das gelöscht werden soll.
 */
function deleteSubtask(subtaskItem) {
  subtaskItem.remove();
}

/**
 * Initialisiert die Event-Listener für das Subtask-Management.
 */
function setupEventListeners() {
  subtasksWrapper.addEventListener("click", focusInput);
  setupInputFocusListeners();
  iconCancel.addEventListener("click", clearInput);
  iconConfirm.addEventListener("click", addSubtask);
}
