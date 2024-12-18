function navToggel() {
  var x = document.getElementById("myLinks");
  if (x.style.display === "flex") {
    x.style.display = "none";
  } else {
    x.style.display = "flex";
  }
}

function setUserInitial() {
  const userName = localStorage.getItem("userName") || "Guest";
  const userInitial = userName.charAt(0).toUpperCase();

  const userButton = document.getElementById("user-init");
  if (userButton) {
    userButton.textContent = userInitial;
  }
}

function activateLogoutButton() {
  const logoutButton = document.querySelector(".nav-toggel button:last-child");
  if (logoutButton) {
    logoutButton.addEventListener("click", function () {
      localStorage.removeItem("userName"); // Benutzerdaten löschen
      window.location.href = "../index.html"; // Weiterleitung zur Login-Seite
    });
  }
}

function initializeHeader() {
  setUserInitial();
  activateLogoutButton();
}

function navigateToBoard() {
  window.location.href = "../html/boardTest.html";
}

function navigateToSummary() {
  window.location.href = "../html/summary.html";
}

function navigateToAddTask() {
  window.location.href = "../html/addTask.html";
}

function navigateToContacts() {
  window.location.href = "../html/contacts.html";
}

function navigateToLegalNotice() {
  window.location.href = "../html/legalNotice.html";
}

function navigateToprivacyPolicy() {
  window.location.href = "../html/privacyPolicy.html";
}
