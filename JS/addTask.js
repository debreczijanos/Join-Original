//  HTML-Include
function includeHTML(selector, file, callback) {
  const element = document.querySelector(selector);
  if (element) {
    fetch(file)
      .then((response) => {
        if (!response.ok) {
          throw new Error("HTTP error " + response.status);
        }
        return response.text();
      })
      .then((data) => {
        element.innerHTML = data;
        if (typeof callback === "function") {
          callback(); // Führe die Callback-Funktion aus
        }
      })
      .catch((error) => console.error("Error loading HTML:", error));
  }
}
includeHTML("#include-container", "./nav.html", function () {
  // Header-Funktionalität initialisieren
  initializeHeader();
});

// Button-Management (Prio-Buttons)
// Button-Management (Prio-Buttons)
function clearActiveStates(buttons) {
  buttons.forEach((btn) => {
    btn.classList.remove("active");
    const img = btn.querySelector("img");
    if (img) img.classList.remove("filter-color-to-white");
  });
}

function activateButton(button) {
  button.classList.add("active");
  const img = button.querySelector("img");
  if (img) img.classList.add("filter-color-to-white");
}

function setupButtonListeners(buttons, defaultActiveIndex = 1) {
  buttons.forEach((button, index) => {
    button.addEventListener("click", () => {
      clearActiveStates(buttons);
      activateButton(button);
    });

    // Setze Standard-Button als aktiv
    if (index === defaultActiveIndex) {
      activateButton(button);
    }
  });
}

// Beispiel: Initialisierung der Buttons
document.addEventListener("DOMContentLoaded", () => {
  const prioButtons = document.querySelectorAll(".prio-button");
  setupButtonListeners(prioButtons, 1); // Standardmäßig Index 1 (Medium) aktivieren
});

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
