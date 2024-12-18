function clearForm() {
  resetTextInputs([
    "title",
    "description",
    "dropdownInput",
    "customDropdownInput",
    "subtaskInput",
  ]);
  clearInnerHTML(["selectedContacts", "subtaskList"]);
  resetDateInput();
  resetPrioButtons();
  resetCategoryDropdown();
  uncheckCheckboxes(".dropdown-menu input[type='checkbox']");
}

function resetTextInputs(inputIds) {
  inputIds.forEach((id) => (document.getElementById(id).value = ""));
}

function clearInnerHTML(elementIds) {
  elementIds.forEach((id) => (document.getElementById(id).innerHTML = ""));
}

function resetDateInput() {
  const dateInput = document.querySelector("input[type='date']");
  if (dateInput) dateInput.value = "";
}

function resetPrioButtons() {
  const buttons = document.querySelectorAll(".prio-btn button");
  clearActiveStates(buttons);
  const defaultActiveIndex = 1;
  activateButton(buttons[defaultActiveIndex]);
}

function resetCategoryDropdown() {
  const categoryDropdown = document.getElementById("customDropdownMenu");
  if (categoryDropdown) categoryDropdown.style.display = "none";
}

function uncheckCheckboxes(selector) {
  document
    .querySelectorAll(selector)
    .forEach((checkbox) => (checkbox.checked = false));
}

// Funktion: Aufgabe erstellen und an die API senden
function createTask() {
  const requiredFields = getRequiredFields();
  removeErrorMessages(requiredFields);

  if (validateFields(requiredFields)) return;

  const task = buildTaskObject();
  sendTaskToAPI(task);
}

function getRequiredFields() {
  return [
    {
      input: document.getElementById("title"),
      errorMessage: "This field is required",
      errorClass: "error-title",
    },
    {
      input: document.querySelector("input[type='date']"),
      errorMessage: "Please select a due date",
      errorClass: "error-due-date",
    },
    {
      input: document.getElementById("customDropdownInput"),
      errorMessage: "Please select a category",
      errorClass: "error-category",
    },
  ];
}

function removeErrorMessages(fields) {
  document.querySelectorAll(".error-message").forEach((el) => el.remove());
  fields.forEach(({ input }) => input.classList.remove("error"));
}

function validateFields(fields) {
  let hasErrors = false;

  fields.forEach(({ input, errorMessage, errorClass }) => {
    if (!input.value.trim()) {
      hasErrors = true;
      displayError(input, errorMessage, errorClass);
    }
  });

  return hasErrors;
}

function displayError(input, errorMessage, errorClass) {
  input.classList.add("error");
  if (!document.querySelector(`.${errorClass}`)) {
    const errorText = document.createElement("div");
    errorText.className = `error-message ${errorClass}`;
    errorText.textContent = errorMessage;
    input.parentElement.appendChild(errorText);
  }
}

function buildTaskObject() {
  return {
    title: document.getElementById("title").value.trim(),
    description: document.getElementById("description").value.trim(),
    assignedTo: getSelectedContacts(),
    dueDate: document.querySelector("input[type='date']").value,
    prio: getActivePrio(),
    category: document.getElementById("customDropdownInput").value.trim(),
    subtasks: getSubtasks(),
  };
}

function getSelectedContacts() {
  return Array.from(document.getElementById("selectedContacts").children).map(
    (button) => button.textContent.trim()
  );
}

function getActivePrio() {
  const activeButton = document.querySelector(".prio-btn button.active");
  return activeButton ? activeButton.textContent.trim() : null;
}

function getSubtasks() {
  return Array.from(
    document.querySelectorAll("#subtaskList .subtask-item li")
  ).map((li) => li.textContent.trim());
}

function sendTaskToAPI(task) {
  fetch(
    "https://join-388-default-rtdb.europe-west1.firebasedatabase.app/tasks.json",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(task),
    }
  )
    .then((response) => {
      if (response.ok) {
        // Overlay und Erfolgsmeldung anzeigen
        const overlay = document.getElementById("overlay");
        overlay.style.display = "flex";

        // Nach 3 Sekunden das Overlay ausblenden und Formular zurücksetzen
        setTimeout(() => {
          overlay.style.display = "none";
          clearForm(); // Formular leeren
          window.location.href = "../html/boardTest.html";
        }, 3000);
      } else {
        console.error("Error creating task.");
      }
    })
    .catch((error) => console.error("API Error:", error));
}

// Funktion: Fehlernachrichten beim Eingeben oder Ändern entfernen
function addInputListeners() {
  const fieldsToValidate = getRequiredFields();

  fieldsToValidate.forEach(({ input, errorClass }) => {
    addErrorRemovalListeners(input, errorClass);
  });

  handleCategoryDropdown();
}

function addErrorRemovalListeners(input, errorClass) {
  input.addEventListener("input", () => removeError(input, errorClass));
  if (input.type === "date") {
    input.addEventListener("change", () => removeError(input, errorClass));
  }
}

function handleCategoryDropdown() {
  const categoryInput = document.getElementById("customDropdownInput");
  const dropdownMenu = document.getElementById("customDropdownMenu");

  ["input", "focus"].forEach((event) =>
    categoryInput.addEventListener(event, () =>
      removeError(categoryInput, "error-category")
    )
  );

  dropdownMenu.addEventListener("click", (event) => {
    if (event.target.classList.contains("custom-dropdown-item")) {
      removeError(categoryInput, "error-category");
    }
  });
}

function removeError(input, errorClass) {
  if (input.value.trim()) {
    input.classList.remove("error");
    const errorText = document.querySelector(`.${errorClass}`);
    if (errorText) errorText.remove();
  }
}

// Event-Listener beim Laden der Seite hinzufügen
window.onload = () => {
  addInputListeners();
};

// Event-Listener für die Buttons hinzufügen
document.querySelector(".clear-btn").addEventListener("click", clearForm);
document
  .querySelector(".create-task-btn")
  .addEventListener("click", createTask);
