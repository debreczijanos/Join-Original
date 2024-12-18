const subtaskInput = document.getElementById("subtaskInput");
const iconAdd = document.getElementById("iconAdd");
const iconCancel = document.getElementById("iconCancel");
const iconConfirm = document.getElementById("iconConfirm");
const subtasksWrapper = document.querySelector(".subtasks-wrapper");
const subtaskList = document.getElementById("subtaskList");

// Eingabefocus und Icon-Management

// Funktion: Input beim Klicken auf die Wrapper-Fläche fokussieren
function focusInput() {
  subtaskInput.focus();
}

// Funktion: Icons basierend auf Fokus aktualisieren
function setupInputFocusListeners() {
  subtaskInput.addEventListener("focus", () => showInputIcons());
  subtaskInput.addEventListener("blur", () => hideInputIconsIfEmpty());
}

function showInputIcons() {
  subtasksWrapper.classList.add("focused");
  toggleIconsVisibility(false);
}

function hideInputIconsIfEmpty() {
  if (subtaskInput.value.trim() === "") {
    subtasksWrapper.classList.remove("focused");
    toggleIconsVisibility(true);
  }
}

function toggleIconsVisibility(showAddIcon) {
  iconAdd.classList.toggle("hidden", !showAddIcon);
  iconCancel.classList.toggle("hidden", showAddIcon);
  iconConfirm.classList.toggle("hidden", showAddIcon);
}

//Eingabe löschen
function clearInput(event) {
  event.stopPropagation(); // Fokus nicht auf Wrapper verschieben
  subtaskInput.value = ""; // Eingabefeld leeren
  subtaskInput.focus(); // Fokus zurücksetzen
}

//Subtask hinzufügen
function addSubtask(event) {
  event.stopPropagation();

  const subtaskText = subtaskInput.value.trim();
  if (!subtaskText) return;

  const subtaskItem = createSubtaskElement(subtaskText);
  subtaskList.appendChild(subtaskItem);

  resetSubtaskInput();
}

function createSubtaskElement(text) {
  const subtaskItem = document.createElement("div");
  subtaskItem.classList.add("subtask-item");

  const subtaskTextElement = createSubtaskText(text);
  const subtaskActions = createSubtaskActions(subtaskItem, subtaskTextElement);

  subtaskItem.appendChild(subtaskTextElement);
  subtaskItem.appendChild(subtaskActions);

  return subtaskItem;
}

function createSubtaskText(text) {
  const textElement = document.createElement("li");
  textElement.textContent = text;
  return textElement;
}

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

function createIcon(src, alt, clickHandler) {
  const icon = document.createElement("img");
  icon.src = src;
  icon.alt = alt;
  icon.classList.add("subtask-icon-action");
  icon.addEventListener("click", clickHandler);
  return icon;
}

function createDivider() {
  const divider = document.createElement("div");
  divider.classList.add("divider");
  return divider;
}

function resetSubtaskInput() {
  subtaskInput.value = "";
  subtaskInput.focus();
}

//Subtask bearbeiten
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

function createEditInput(value) {
  const input = document.createElement("input");
  input.type = "text";
  input.value = value;
  input.classList.add("edit-input");
  return input;
}

function handleEditSave(event, saveHandler) {
  if (event.key === "Enter") {
    saveHandler();
  }
}

function saveSubtaskEdit(editInput, subtaskTextElement) {
  subtaskTextElement.textContent = editInput.value.trim();
  editInput.replaceWith(subtaskTextElement);
}

//Subtask löschen
function deleteSubtask(subtaskItem) {
  subtaskItem.remove();
}

//Initialisierung
function setupEventListeners() {
  subtasksWrapper.addEventListener("click", focusInput);
  setupInputFocusListeners();
  iconCancel.addEventListener("click", clearInput);
  iconConfirm.addEventListener("click", addSubtask);
}
