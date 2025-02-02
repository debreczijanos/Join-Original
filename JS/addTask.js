/**
 * Loads an HTML file and inserts its content into an element.
 *
 * @param {string} selector - The CSS selector of the target element.
 * @param {string} file - The path to the HTML file.
 * @param {Function} [callback] - An optional callback function to execute after loading.
 */
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
          callback();
        }
      })
      .catch((error) => console.error("Error loading HTML:", error));
  }
}
includeHTML("#include-container", "./nav.html", function () {
  initializeHeader();
});

/**
 * Removes the active state from all buttons.
 *
 * @param {NodeList} buttons - A list of buttons to process.
 */
function clearActiveStates(buttons) {
  buttons.forEach((btn) => {
    btn.classList.remove("active");
    const img = btn.querySelector("img");
    if (img) img.classList.remove("filter-color-to-white");
  });
}

/**
 * Activates a button and sets the corresponding image color.
 *
 * @param {HTMLElement} button - The button to activate.
 */
function activateButton(button) {
  button.classList.add("active");
  const img = button.querySelector("img");
  if (img) img.classList.add("filter-color-to-white");
}

/**
 * Adds event listeners to buttons and activates a default button.
 *
 * @param {NodeList} buttons - A list of buttons.
 * @param {number} defaultActiveIndex - The index of the default active button (optional, default: 1).
 */
function setupButtonListeners(buttons, defaultActiveIndex = 1) {
  buttons.forEach((button, index) => {
    button.addEventListener("click", () => {
      clearActiveStates(buttons);
      activateButton(button);
    });

    if (index === defaultActiveIndex) {
      activateButton(button);
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const prioButtons = document.querySelectorAll(".prio-button");
  setupButtonListeners(prioButtons, 1);
});

/**
 * Adds event listeners to input fields to remove errors.
 */
function addInputListeners() {
  const fieldsToValidate = getRequiredFields();

  fieldsToValidate.forEach(({ input, errorClass }) => {
    addErrorRemovalListeners(input, errorClass);
  });

  handleCategoryDropdown();
}

/**
 * Adds event listeners to remove errors from an input field.
 *
 * @param {HTMLElement} input - The input field.
 * @param {string} errorClass - The CSS class of the error to remove.
 */
function addErrorRemovalListeners(input, errorClass) {
  input.addEventListener("input", () => removeError(input, errorClass));
  if (input.type === "date") {
    input.addEventListener("change", () => removeError(input, errorClass));
  }
}

/**
 * Handles events in the category dropdown and removes errors.
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
 * Removes the error class from an input field and deletes the associated error text.
 *
 * @param {HTMLElement} input - The input field.
 * @param {string} errorClass - The CSS class of the error text.
 */
function removeError(input, errorClass) {
  if (input.value.trim()) {
    input.classList.remove("error");
    const errorText = document.querySelector(`.${errorClass}`);
    if (errorText) errorText.remove();
  }
}
