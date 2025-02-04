/**
 * Initializes the application and sets up necessary event listeners and dropdowns.
 *
 * The function is executed once the page has fully loaded (`DOMContentLoaded`).
 * It configures dropdowns, loads contacts, sets up event listeners for inputs and buttons,
 * and ensures smooth operation of the application.
 */
function initApp() {
  initializeDropdown("dropdownInput", "dropdownMenu", ".dropdown-menu-item");
  initializeDropdown(
    "customDropdownInput",
    "customDropdownMenu",
    ".custom-dropdown-item"
  );

  addInputListeners();
  loadContacts(apiURL, "dropdownMenu");
  setupEventListeners();
  const buttons = document.querySelectorAll(".prio-btn button");
  setupButtonListeners(buttons);
}

/**
 * Start the initialization of the app once the page is loaded
 */
document.addEventListener("DOMContentLoaded", initApp);
