/**
 * Initializes the navigation and sets the active menu item based on the URL.
 */
document.addEventListener("DOMContentLoaded", function () {
  setTimeout(() => {
    const menuItems = document.querySelectorAll(
      ".summary, .addTask, .board, .contacts"
    );

    if (menuItems.length === 0) return;

    const activeMenuClass = getActiveMenuClass();
    updateActiveMenu(menuItems, activeMenuClass);
    addClickListeners(menuItems);
  }, 200);
});

/**
 * Determines the active menu class based on the current URL.
 * @returns {string|null} - The class of the active menu item or null if no match is found.
 */
function getActiveMenuClass() {
  const currentPath = window.location.pathname;
  const pathToMenuClass = {
    "/summary.html": "summary",
    "/addTask.html": "addTask",
    "/boardTest.html": "board",
    "/contacts.html": "contacts",
  };

  for (const path in pathToMenuClass) {
    if (currentPath.includes(path)) return pathToMenuClass[path];
  }
  return null;
}

/**
 * Sets the "active" class for the found menu item.
 * @param {NodeList} menuItems - List of menu items.
 * @param {string|null} activeMenuClass - The class of the active menu item.
 */
function updateActiveMenu(menuItems, activeMenuClass) {
  menuItems.forEach((el) => el.classList.remove("active"));

  if (activeMenuClass) {
    const activeElement = document.querySelector(`.${activeMenuClass}`);
    if (activeElement) activeElement.classList.add("active");
  }
}

/**
 * Adds a click event to all menu items to set them as active.
 * @param {NodeList} menuItems - List of menu items.
 */
function addClickListeners(menuItems) {
  menuItems.forEach((item) => {
    item.addEventListener("click", function () {
      menuItems.forEach((el) => el.classList.remove("active"));
      this.classList.add("active");
    });
  });
}
