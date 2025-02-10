/**
 * Toggles the visibility of the navigation menu.
 */
function navToggel() {
  const x = document.getElementById("myLinks");
  if (x.style.display === "flex") {
    x.style.display = "none";
  } else {
    x.style.display = "flex";
  }
}

/**
 * Sets the initial letter of the username in the header.
 *
 * The username is retrieved from localStorage.
 * If no name is found, "Guest" is used.
 */
function setUserInitial() {
  const userName = localStorage.getItem("userName") || "Guest";
  const userInitial = userName.charAt(0).toUpperCase();

  const userButton = document.getElementById("user-init");
  if (userButton) {
    userButton.textContent = userInitial;
  }
}

/**
 * Activates the logout button to log the user out.
 *
 * When the logout button is clicked, the user data is removed
 * from localStorage and the user is redirected to the login page.
 */
function activateLogoutButton() {
  const logoutButton = document.querySelector(".nav-toggel button:last-child");
  if (logoutButton) {
    logoutButton.addEventListener("click", function () {
      localStorage.removeItem("userName");
      window.location.href = "../index.html";
    });
  }
}

/**
 * Initializes the header by setting the username,
 * activating the logout button, and enabling the overlay close function.
 */
function initializeHeader() {
  setUserInitial();
  activateLogoutButton();
  setupOverlayClose();
}

/**
 * Closes the overlay when clicking outside of it.
 */
function setupOverlayClose() {
  const overlay = document.getElementById("myLinks");

  document.addEventListener("click", (event) => {
    if (
      overlay.style.display === "flex" &&
      !overlay.contains(event.target) &&
      event.target.id !== "user-init"
    ) {
      overlay.style.display = "none";
    }
  });
}

/**
 * Navigates to the Kanban board page.
 */
function navigateToBoard() {
  window.location.href = "../html/board.html";
}

/**
 * Navigates to the summary page.
 */
function navigateToSummary() {
  window.location.href = "../html/summary.html";
}

/**
 * Navigates to the add task page.
 */
function navigateToAddTask() {
  window.location.href = "../html/addTask.html";
}

/**
 * Navigates to the contacts page.
 */
function navigateToContacts() {
  window.location.href = "../html/contacts.html";
}

/**
 * Navigates to the legal notice page.
 */
function navigateToLegalNotice() {
  window.location.href = "../html/legalNotice.html";
}

/**
 * Navigates to the privacy policy page.
 */
function navigateToprivacyPolicy() {
  window.location.href = "../html/privacyPolicy.html";
}
