/**
 * Leert das Formular und setzt alle Felder auf die Standardwerte zurück.
 */
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

/**
 * Setzt die Werte von Texteingabefeldern zurück.
 *
 * @param {Array<string>} inputIds - Die IDs der Texteingabefelder.
 */
function resetTextInputs(inputIds) {
  inputIds.forEach((id) => (document.getElementById(id).value = ""));
}

/**
 * Löscht den inneren HTML-Inhalt von Elementen.
 *
 * @param {Array<string>} elementIds - Die IDs der Elemente.
 */
function clearInnerHTML(elementIds) {
  elementIds.forEach((id) => (document.getElementById(id).innerHTML = ""));
}

/**
 * Setzt das Datumsfeld zurück.
 */
function resetDateInput() {
  const dateInput = document.querySelector("input[type='date']");
  if (dateInput) dateInput.value = "";
}

/**
 * Setzt die Prioritäts-Buttons zurück und aktiviert den Standardwert.
 */
function resetPrioButtons() {
  const buttons = document.querySelectorAll(".prio-btn button");
  clearActiveStates(buttons);
  const defaultActiveIndex = 1;
  activateButton(buttons[defaultActiveIndex]);
}

/**
 * Setzt das Kategoriemenü zurück.
 */
function resetCategoryDropdown() {
  const categoryDropdown = document.getElementById("customDropdownMenu");
  if (categoryDropdown) categoryDropdown.style.display = "none";
}

/**
 * Entfernt die Markierung von Checkboxen.
 *
 * @param {string} selector - Der CSS-Selektor für die Checkboxen.
 */
function uncheckCheckboxes(selector) {
  document
    .querySelectorAll(selector)
    .forEach((checkbox) => (checkbox.checked = false));
}

/**
 * Erstellt eine neue Aufgabe und sendet sie an die API.
 */
function createTask() {
  const requiredFields = getRequiredFields();
  removeErrorMessages(requiredFields);

  if (validateFields(requiredFields)) return;

  const task = buildTaskObject();
  sendTaskToAPI(task);
}

/**
 * Liefert die erforderlichen Formularfelder und ihre Validierungsinformationen.
 *
 * @returns {Array<Object>} Eine Liste der erforderlichen Felder.
 */
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

/**
 * Entfernt alle Fehlermeldungen aus dem Formular.
 *
 * @param {Array<Object>} fields - Die Felder mit Fehlern.
 */
function removeErrorMessages(fields) {
  document.querySelectorAll(".error-message").forEach((el) => el.remove());
  fields.forEach(({ input }) => input.classList.remove("error"));
}

/**
 * Validiert die angegebenen Felder.
 *
 * @param {Array<Object>} fields - Die Felder, die validiert werden sollen.
 * @returns {boolean} Gibt true zurück, wenn Fehler gefunden wurden.
 */
function validateFields(fields) {
  let hasErrors = false;
  const today = new Date().toISOString().split("T")[0]; // Heutiges Datum im Format YYYY-MM-DD

  fields.forEach(({ input, errorMessage, errorClass }) => {
    if (!input.value.trim()) {
      hasErrors = true;
      displayError(input, errorMessage, errorClass);
    }

    // Zusätzliche Validierung für das Datum
    if (input.type === "date" && input.value < today) {
      hasErrors = true;
      displayError(
        input,
        "Das Datum darf nicht vor heute liegen!",
        "error-due-date"
      );
    }
  });

  return hasErrors;
}

/**
 * Zeigt eine Fehlermeldung für ein bestimmtes Feld an.
 *
 * @param {HTMLElement} input - Das Eingabefeld mit einem Fehler.
 * @param {string} errorMessage - Die anzuzeigende Fehlermeldung.
 * @param {string} errorClass - Die CSS-Klasse für die Fehlermeldung.
 */
function displayError(input, errorMessage, errorClass) {
  input.classList.add("error");
  if (!document.querySelector(`.${errorClass}`)) {
    const errorText = document.createElement("div");
    errorText.className = `error-message ${errorClass}`;
    errorText.textContent = errorMessage;
    input.parentElement.appendChild(errorText);
  }
  toggleButtonState();
}

/**
 * Erstellt ein Task-Objekt aus den Formularfeldern.
 *
 * @returns {Object} Das erstellte Task-Objekt.
 */
// function buildTaskObject() {
//   return {
//     title: document.getElementById("title").value.trim(),
//     description: document.getElementById("description").value.trim(),
//     assignedTo: getSelectedContacts(),
//     dueDate: document.querySelector("input[type='date']").value,
//     prio: getActivePrio(),
//     status: "To Do",
//     category: document.getElementById("customDropdownInput").value.trim(),
//     subtasks: getSubtasks(),
//   };
// }

/**
 * Holt die ausgewählten Kontakte aus dem Formular.
 *
 * @returns {Array<string>} Eine Liste der Namen der ausgewählten Kontakte.
 */
function getSelectedContacts() {
  return Array.from(document.getElementById("selectedContacts").children).map(
    (button) => button.textContent.trim()
  );
}

/**
 * Holt die aktive Prioritätsstufe aus den Buttons.
 *
 * @returns {string|null} Die aktive Priorität oder null, wenn keine aktiv ist.
 */
function getActivePrio() {
  const activeButton = document.querySelector(".prio-btn button.active");
  return activeButton ? activeButton.textContent.trim() : null;
}

/**
 * Holt die Subtasks aus der Liste.
 *
 * @returns {Array<string>} Eine Liste der Subtasks.
 */
function getSubtasks() {
  return Array.from(
    document.querySelectorAll("#subtaskList .subtask-item li")
  ).map((li) => li.textContent.trim());
}

/**
 * Sendet eine Aufgabe an die API und zeigt das Ergebnis in der UI an.
 *
 * @param {Object} task - Das zu sendende Task-Objekt.
 */
let isRequestInProgress = false;

function sendTaskToAPI(task) {
  if (isRequestInProgress) return;

  isRequestInProgress = true;
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
        const overlay = document.getElementById("overlay");
        overlay.style.display = "flex";

        setTimeout(() => {
          overlay.style.display = "none";
          clearForm(); // Formular leeren
          window.location.href = "../html/boardTest.html";
        }, 3000);
      } else {
        console.error("Error creating task.");
      }
    })
    .catch((error) => console.error("API Error:", error))
    .finally(() => {
      isRequestInProgress = false;
    });
}

/**
 * Fügt Event-Listener hinzu, um Fehlernachrichten bei Eingabeänderungen zu entfernen.
 */
function addInputListeners() {
  const fieldsToValidate = getRequiredFields();

  fieldsToValidate.forEach(({ input, errorClass }) => {
    addErrorRemovalListeners(input, errorClass);

    // Zusätzliche Validierung für Datumseingaben
    if (input.type === "date") {
      input.addEventListener("change", () => {
        const today = new Date().toISOString().split("T")[0];
        if (input.value < today) {
          displayError(
            input,
            "Das Datum darf nicht vor heute liegen!",
            "error-due-date"
          );
        } else {
          removeError(input, "error-due-date");
        }
      });
    }
  });

  handleCategoryDropdown();
}

/**
 * Fügt Event-Listener zu einem Eingabefeld hinzu, um Fehler zu entfernen.
 *
 * @param {HTMLElement} input - Das Eingabefeld.
 * @param {string} errorClass - Die CSS-Klasse des Fehlertexts.
 */
function addErrorRemovalListeners(input, errorClass) {
  input.addEventListener("input", () => removeError(input, errorClass));
  if (input.type === "date") {
    input.addEventListener("change", () => removeError(input, errorClass));
  }
}

/**
 * Behandelt die Interaktion mit dem Kategorie-Dropdown und entfernt Fehlernachrichten.
 */
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

/**
 * Entfernt die Fehleranzeige eines Eingabefelds, wenn es gültige Eingaben enthält.
 *
 * @param {HTMLElement} input - Das Eingabefeld.
 * @param {string} errorClass - Die CSS-Klasse des Fehlertexts.
 */
function removeError(input, errorClass) {
  if (input.value.trim()) {
    input.classList.remove("error");
    const errorText = document.querySelector(`.${errorClass}`);
    if (errorText) errorText.remove();

    toggleButtonState();
  }
}

function setMinDateForDateInput() {
  const dateInput = document.querySelector("input[type='date']");
  if (dateInput) {
    // Heutiges Datum im Format YYYY-MM-DD
    const today = new Date().toISOString().split("T")[0];
    dateInput.setAttribute("min", today);
  }
}

function toggleButtonState() {
  const createTaskButton = document.querySelector(".create-task-btn");
  const errorMessages = document.querySelectorAll(".error-message");

  const requiredFields = getRequiredFields();
  const hasEmptyFields = requiredFields.some(
    ({ input }) => !input.value.trim()
  );

  if (errorMessages.length === 0 && !hasEmptyFields) {
    createTaskButton.classList.add("active");
    createTaskButton.classList.remove("inactive");
  } else {
    createTaskButton.classList.add("inactive");
    createTaskButton.classList.remove("active");
  }
}

document.querySelector(".create-task-btn").addEventListener("click", (e) => {
  const createTaskButton = e.target;

  if (!createTaskButton.classList.contains("active")) {
    return;
  }

  createTask();
});

/**
 * Event-Listener beim Laden der Seite hinzufügen
 */
window.onload = () => {
  addInputListeners();
  setMinDateForDateInput();
  toggleButtonState();
};

/**
 * Event-Listener für die Buttons hinzufügen
 */
document.querySelector(".clear-btn").addEventListener("click", clearForm);
document
  .querySelector(".create-task-btn")
  .addEventListener("click", createTask);
