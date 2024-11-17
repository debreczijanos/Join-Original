//  HTML-Include
function includeHTML(containerSelector, filePath) {
  const container = document.querySelector(containerSelector);
  if (container) {
    fetch(filePath)
      .then((response) => response.text())
      .then((html) => {
        container.innerHTML = html;
      })
      .catch((error) => console.error("Error loading HTML:", error));
  }
}

includeHTML("#include-container", "./nav.html");

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

function setupButtonListeners(buttons) {
  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      clearActiveStates(buttons);
      activateButton(button);
    });
  });
}

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
