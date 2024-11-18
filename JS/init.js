function initApp() {
  // Initialisiere beide Dropdowns
  initializeDropdown("dropdownInput", "dropdownMenu", ".dropdown-menu-item");
  initializeDropdown(
    "customDropdownInput",
    "customDropdownMenu",
    ".custom-dropdown-item"
  );

  // Weitere Initialisierungen
  addInputListeners();
  loadContacts(apiURL, "dropdownMenu"); // Für "Assigned to"
  setupEventListeners();
  const buttons = document.querySelectorAll(".prio-btn button");
  setupButtonListeners(buttons);
}

document.addEventListener("DOMContentLoaded", initApp);
